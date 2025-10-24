import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Space,
  Tag,
  Badge,
  Spin,
  message,
  Select,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { type ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../api/enrollmentService";
import { courseService } from "../../api/courseService";
import { clearingOfficerService } from "../../api/clearingOfficerService";
import type {
  Student,
  Course,
  Section,
  Semester,
  StudentEnrollment,
  EnrollmentStats,
  ClearingOfficer,
} from "../../types/enrollment";

// Chart colors - Dark theme with green variations
const COLORS = [
  "#00ff88", // Bright green
  "#00cc6a", // Medium green
  "#00b359", // Darker green
  "#00ff99", // Light green
  "#00e676", // Material green
  "#00ffaa", // Cyan-green
  "#00ff77", // Lime green
  "#00ff66", // Neon green
];

// Dark theme colors for backgrounds and text
const DARK_THEME = {
  background: "#1f1f1f",
  text: "#ffffff",
  grid: "#333333",
  tooltip: "#2d2d2d",
  card: "#2a2a2a",
};

const EnrollmentDashboard: React.FC = () => {
  // State management for real data
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<
    StudentEnrollment[]
  >([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<EnrollmentStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalSections: 0,
    activeEnrollments: 0,
    totalClearingOfficers: 0,
    enrollmentByDepartment: [],
    enrollmentByYearLevel: [],
    semesterStats: [],
  });
  const [chartData, setChartData] = useState({
    departmentData: [] as Array<{ name: string; value: number; count: number }>,
    yearLevelData: [] as Array<{ name: string; value: number; count: number }>,
    enrollmentTrendData: [] as Array<{ semester: string; enrollments: number }>,
  });

  // Get current semester and related data
  const currentSemester = semesters.find((s) => s.id === selectedSemester);
  const currentSemesterEnrollments = studentEnrollments.filter(
    (enrollment) => enrollment.semester === currentSemester?.semesterName
  );

  // Data fetching functions
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        studentsData,
        coursesData,
        sectionsData,
        semestersData,
        enrollmentsData,
        clearingOfficersData,
      ] = await Promise.all([
        enrollmentService.getStudents(),
        courseService.getAllCourses(),
        enrollmentService.getSections(),
        enrollmentService.getSemesters(),
        enrollmentService.getAllStudentEnrollments(),
        clearingOfficerService.getAll(),
      ]);

      setSemesters(semestersData);
      setStudentEnrollments(enrollmentsData);

      // Set default semester to the first active one
      const activeSemester = semestersData.find((s) => s.status === "Active");
      if (activeSemester && !selectedSemester) {
        setSelectedSemester(activeSemester.id);
      }

      // Calculate real statistics
      calculateStats(
        studentsData,
        coursesData,
        sectionsData,
        enrollmentsData,
        clearingOfficersData
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedSemester]);

  // Calculate statistics from real data
  const calculateStats = (
    studentsData: Student[],
    coursesData: Course[],
    sectionsData: Section[],
    enrollmentsData: StudentEnrollment[],
    clearingOfficersData: ClearingOfficer[]
  ) => {
    // Department statistics from enrollment data
    const departmentCounts = enrollmentsData.reduce((acc, enrollment) => {
      acc[enrollment.department] = (acc[enrollment.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrollmentByDepartment = Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Year level statistics from enrollment data
    const yearLevelCounts = enrollmentsData.reduce((acc, enrollment) => {
      acc[enrollment.yearLevel] = (acc[enrollment.yearLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrollmentByYearLevel = Object.entries(yearLevelCounts)
      .map(([yearLevel, count]) => ({ yearLevel, count }))
      .sort((a, b) => a.yearLevel.localeCompare(b.yearLevel)); // Sort by year level

    // Active sections count
    const activeSections = sectionsData.filter(
      (section) => section.status === "Open"
    ).length;

    // Get unique students from enrollments
    const uniqueStudents = new Set(
      enrollmentsData.map((e) => `${e.firstName} ${e.lastName}`)
    ).size;

    // Prepare chart data
    const departmentChartData = enrollmentByDepartment.map((item) => ({
      name: item.department,
      value: item.count,
      count: item.count,
    }));

    const yearLevelChartData = enrollmentByYearLevel.map((item) => ({
      name: item.yearLevel,
      value: item.count,
      count: item.count,
    }));

    // Create enrollment trend data (by semester)
    const semesterCounts = enrollmentsData.reduce((acc, enrollment) => {
      acc[enrollment.semester] = (acc[enrollment.semester] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrollmentTrendData = Object.entries(semesterCounts).map(
      ([semester, count]) => ({
        semester,
        enrollments: count,
      })
    );

    setStats({
      totalStudents: uniqueStudents || studentsData.length,
      totalClearingOfficers: clearingOfficersData.length,
      totalCourses: coursesData.length,
      totalSections: activeSections,
      activeEnrollments: enrollmentsData.length,
      enrollmentByDepartment,
      enrollmentByYearLevel,
      semesterStats: [], // Can be calculated if needed
    });

    setChartData({
      departmentData: departmentChartData,
      yearLevelData: yearLevelChartData,
      enrollmentTrendData,
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Table columns for student enrollments
  const columns: ColumnsType<StudentEnrollment> = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {record.schoolId || "N/A"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string) => <Tag color="blue">{department}</Tag>,
    },
    {
      title: "Year Level",
      dataIndex: "yearLevel",
      key: "yearLevel",
      render: (yearLevel: string) => <Tag color="green">{yearLevel}</Tag>,
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      render: (semester: string) => <Tag color="purple">{semester}</Tag>,
    },
    {
      title: "Total Units",
      dataIndex: "totalUnits",
      key: "totalUnits",
      render: (units: number) => <Badge count={units} showZero color="blue" />,
    },
    {
      title: "Courses",
      dataIndex: "selectedCourses",
      key: "selectedCourses",
      render: (courses: string[]) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-600">
            {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Link to={`/enroll`}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          <Link to={`/enroll`}>
            <Button size="small" icon={<EditOutlined />}>
              Edit
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
            <CalendarOutlined className="text-blue-600" />
            Enrollment Management
          </h1>
          <p className="text-gray-500 mt-2">
            Manage student enrollments and course registrations
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Link to="/semester">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Create Semester
            </Button>
          </Link>
          <Link to="/enroll">
            <Button icon={<TeamOutlined />} size="large">
              Enroll Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.totalStudents}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#3f8600" }}
            />
            {/* <div style={{ color: "#3f8600", fontSize: "14px" }}>
              Active: {students.filter((s) => s.status === "Active").length}
            </div> */}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Courses"
              value={stats.totalCourses}
              prefix={<BookOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Officers"
              value={stats.totalClearingOfficers}
              prefix={<BarChartOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Enrollments"
              value={stats.activeEnrollments}
              prefix={<TeamOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#3f8600" }}
            />
            {/* <div style={{ color: "#3f8600", fontSize: "14px" }}>
              This Semester: {currentSemesterRecords.length}
            </div> */}
          </Card>
        </Col>
      </Row>

      {/* Semester Selection */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Current Semester</h3>
            <div className="flex items-center gap-4">
              <Select
                value={selectedSemester}
                onChange={setSelectedSemester}
                placeholder="Select a semester"
                style={{ minWidth: 200 }}
                options={semesters.map((semester) => ({
                  value: semester.id,
                  label: `${semester.semesterName} (${semester.academicYear})`,
                }))}
              />
              {currentSemester && (
                <Tag
                  color={
                    currentSemester.status === "Active"
                      ? "green"
                      : currentSemester.status === "Upcoming"
                      ? "blue"
                      : "orange"
                  }
                >
                  {currentSemester.status}
                </Tag>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/semester">
              <Button icon={<CalendarOutlined />}>Manage Semesters</Button>
            </Link>
            <Link to="/courses">
              <Button icon={<BookOutlined />}>Manage Courses</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Enrollments */}
      <Card
        title="Recent Enrollments"
        style={{ marginBottom: "16px", marginTop: "16px" }}
      >
        <Table
          columns={columns}
          dataSource={currentSemesterEnrollments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: currentSemester
              ? `No enrollments found for ${currentSemester.semesterName}`
              : "No semester selected",
          }}
        />
      </Card>

      {/* Analytics Charts */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card
            title="Enrollment by Department"
            className="h-full"
            style={{
              backgroundColor: DARK_THEME.card,
              borderColor: DARK_THEME.grid,
            }}
          >
            <div className="space-y-3 mb-4">
              <div className="text-sm" style={{ color: "#00ff88" }}>
                Total Departments with Enrollments:{" "}
                {stats.enrollmentByDepartment.length}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {stats.enrollmentByDepartment.map((dept) => (
                  <div
                    key={dept.department}
                    className="flex justify-between items-center p-2 rounded"
                    style={{ backgroundColor: DARK_THEME.background }}
                  >
                    <span className="font-medium">{dept.department}</span>
                    <Badge count={dept.count} showZero color="blue" />
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData.departmentData}
                style={{ background: DARK_THEME.background }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                  tick={{ fill: DARK_THEME.text }}
                />
                <YAxis tick={{ fill: DARK_THEME.text }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: DARK_THEME.tooltip,
                    border: `1px solid ${DARK_THEME.grid}`,
                    color: DARK_THEME.text,
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Enrollment by Year Level"
            className="h-full"
            style={{
              backgroundColor: DARK_THEME.card,
              borderColor: DARK_THEME.grid,
            }}
          >
            <div className="space-y-3 mb-4">
              <div className="text-sm" style={{ color: "#00ff88" }}>
                Total Year Levels with Enrollments:{" "}
                {stats.enrollmentByYearLevel.length}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {stats.enrollmentByYearLevel.map((year) => (
                  <div
                    key={year.yearLevel}
                    className="flex justify-between items-center p-2 rounded"
                    style={{ backgroundColor: DARK_THEME.background }}
                  >
                    <span className="font-medium">{year.yearLevel}</span>
                    <Badge count={year.count} showZero color="green" />
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart style={{ background: DARK_THEME.background }}>
                <Pie
                  data={chartData.yearLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={COLORS[0]}
                  dataKey="value"
                >
                  {chartData.yearLevelData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: DARK_THEME.tooltip,
                    border: `1px solid ${DARK_THEME.grid}`,
                    color: DARK_THEME.text,
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ color: DARK_THEME.text }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Enrollment Trend Chart */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card
            title="Enrollment Trends by Semester"
            style={{
              backgroundColor: DARK_THEME.card,
              borderColor: DARK_THEME.grid,
            }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData.enrollmentTrendData}
                style={{ background: DARK_THEME.background }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
                <XAxis dataKey="semester" tick={{ fill: DARK_THEME.text }} />
                <YAxis tick={{ fill: DARK_THEME.text }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: DARK_THEME.tooltip,
                    border: `1px solid ${DARK_THEME.grid}`,
                    color: DARK_THEME.text,
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ color: DARK_THEME.text }} />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke={COLORS[0]}
                  strokeWidth={3}
                  name="Total Enrollments"
                  dot={{ fill: COLORS[0], strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: COLORS[1] }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnrollmentDashboard;
