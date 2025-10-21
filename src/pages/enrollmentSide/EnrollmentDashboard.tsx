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
import { type ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../api/enrollmentService";
import { courseService } from "../../api/courseService";
import type {
  Student,
  Course,
  Section,
  Semester,
  StudentEnrollment,
  EnrollmentStats,
} from "../../types/enrollment";

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
    enrollmentByDepartment: [],
    enrollmentByYearLevel: [],
    semesterStats: [],
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
      ] = await Promise.all([
        enrollmentService.getStudents(),
        courseService.getAllCourses(),
        enrollmentService.getSections(),
        enrollmentService.getSemesters(),
        enrollmentService.getAllStudentEnrollments(),
      ]);

      setSemesters(semestersData);
      setStudentEnrollments(enrollmentsData);

      // Set default semester to the first active one
      const activeSemester = semestersData.find((s) => s.status === "Active");
      if (activeSemester && !selectedSemester) {
        setSelectedSemester(activeSemester.id);
      }

      // Calculate real statistics
      calculateStats(studentsData, coursesData, sectionsData, enrollmentsData);
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
    enrollmentsData: StudentEnrollment[]
  ) => {
    // Department statistics from enrollment data
    const departmentCounts = enrollmentsData.reduce((acc, enrollment) => {
      acc[enrollment.department] = (acc[enrollment.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrollmentByDepartment = Object.entries(departmentCounts).map(
      ([department, count]) => ({ department, count })
    );

    // Year level statistics from enrollment data
    const yearLevelCounts = enrollmentsData.reduce((acc, enrollment) => {
      acc[enrollment.yearLevel] = (acc[enrollment.yearLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrollmentByYearLevel = Object.entries(yearLevelCounts).map(
      ([yearLevel, count]) => ({ yearLevel, count })
    );

    // Active sections count
    const activeSections = sectionsData.filter(
      (section) => section.status === "Open"
    ).length;

    // Get unique students from enrollments
    const uniqueStudents = new Set(
      enrollmentsData.map((e) => `${e.firstName} ${e.lastName}`)
    ).size;

    setStats({
      totalStudents: uniqueStudents || studentsData.length,
      totalCourses: coursesData.length,
      totalSections: activeSections,
      activeEnrollments: enrollmentsData.length,
      enrollmentByDepartment,
      enrollmentByYearLevel,
      semesterStats: [], // Can be calculated if needed
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
              title="Active Sections"
              value={stats.totalSections}
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

      {/* Department Statistics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="Enrollment by Department" className="h-full">
            <div className="space-y-3">
              {stats.enrollmentByDepartment.map((dept) => (
                <div
                  key={dept.department}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{dept.department}</span>
                  <Badge count={dept.count} showZero color="blue" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Enrollment by Year Level" className="h-full">
            <div className="space-y-3">
              {stats.enrollmentByYearLevel.map((year) => (
                <div
                  key={year.yearLevel}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{year.yearLevel}</span>
                  <Badge count={year.count} showZero color="green" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnrollmentDashboard;
