import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Table,
  Modal,
  Space,
  message,
  Tag,
  Steps,
  Divider,
  Select,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";
import type {
  Enrollment,
  Section,
  Student,
  Semester,
} from "../../types/enrollment";
import { enrollmentService } from "../../api/enrollmentService";

const { Step } = Steps;

const StudentEnrollment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [studentDepartmentFilter, setStudentDepartmentFilter] =
    useState<string>("");
  const [studentYearLevelFilter, setStudentYearLevelFilter] =
    useState<string>("");
  const [courseQuery, setCourseQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [courseDepartmentFilter, setCourseDepartmentFilter] =
    useState<string>("");
  const [courseYearLevelFilter, setCourseYearLevelFilter] =
    useState<string>("");

  // API Data States
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Error States
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Current Enrollments – table controls
  const [enrollmentSearchText, setEnrollmentSearchText] = useState("");
  const [enrollmentDepartmentFilter, setEnrollmentDepartmentFilter] =
    useState<string>("");
  const [enrollmentYearLevelFilter, setEnrollmentYearLevelFilter] =
    useState<string>("");
  // Edit modal for Current Enrollments
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(
    null
  );
  const [editingStatus, setEditingStatus] =
    useState<Enrollment["status"]>("Enrolled");
  const [editingGrade, setEditingGrade] = useState<string>("");
  const [editingRemarks, setEditingRemarks] = useState<string>("");

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all required data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchEnrollments(),
        fetchStudents(),
        fetchSections(),
        fetchSemesters(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollments from API
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const data = await enrollmentService.getAllEnrollments();
      console.log("Fetched enrollments:", data);
      setEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      message.error("Failed to fetch enrollments");
      setEnrollments([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await enrollmentService.getStudents();
      console.log("Fetched students:", data);
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch sections from API
  const fetchSections = async () => {
    try {
      setSectionsLoading(true);
      const data = await enrollmentService.getSections();
      console.log("Fetched sections:", data);
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // Fetch semesters from API
  const fetchSemesters = async () => {
    try {
      setSemestersLoading(true);
      const data = await enrollmentService.getSemesters();
      console.log("Fetched semesters:", data);
      setSemesters(data || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setSemesters([]);
    } finally {
      setSemestersLoading(false);
    }
  };

  // Unique filters from student data
  const uniqueDepartments = Array.from(
    new Set(students.map((s) => s.department))
  );
  const uniqueYearLevels = Array.from(
    new Set(students.map((s) => s.yearLevel))
  );

  // Unique values for Current Enrollments table filters (derived from students as source of truth)
  const enrollmentUniqueDepartments = uniqueDepartments;
  const enrollmentUniqueYearLevels = uniqueYearLevels;

  // Filter students based on search + department + year level
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchText ||
      student.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentNumber?.toLowerCase().includes(searchText.toLowerCase());

    const matchesDepartment =
      !studentDepartmentFilter ||
      student.department === studentDepartmentFilter;

    const matchesYearLevel =
      !studentYearLevelFilter || student.yearLevel === studentYearLevelFilter;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  // Get sections for selected semester
  const availableSections = (sections || []).filter(
    (section) =>
      section.semesterId === selectedSemester &&
      section.status === "Open" &&
      section.currentEnrollment < section.maxCapacity
  );

  // Fallback: if no available sections, show existing dummy sections
  const fallbackSections = selectedSemester
    ? (sections || []).filter(
        (section) => section.semesterId === selectedSemester
      )
    : sections || [];
  const displayedSections =
    availableSections.length > 0 ? availableSections : fallbackSections;

  // Derived filters for Select Courses step
  const uniqueDays = Array.from(
    new Set(
      (sections || [])
        .filter((s) => s?.schedule && Array.isArray(s.schedule))
        .flatMap((s) => s.schedule.map((sched) => sched?.day).filter(Boolean))
    )
  );

  const uniqueCourseDepartments = Array.from(
    new Set(
      (sections || [])
        .filter((s) => s?.course?.department)
        .map((s) => s.course.department)
    )
  );

  // Infer recommended year level from course code number (e.g., 101 -> 1st Year)
  const mapCourseCodeToYearLevel = (courseCode: string): string | undefined => {
    const match = courseCode.match(/(\d{3})/);
    if (!match) return undefined;
    const hundreds = parseInt(match[1][0], 10);
    switch (hundreds) {
      case 1:
        return "1st Year";
      case 2:
        return "2nd Year";
      case 3:
        return "3rd Year";
      case 4:
        return "4th Year";
      case 5:
        return "5th Year";
      default:
        return undefined;
    }
  };

  // When student changes, default the course filters to their department and year
  useEffect(() => {
    if (selectedStudent) {
      setCourseDepartmentFilter(selectedStudent.department);
      setCourseYearLevelFilter(selectedStudent.yearLevel);
    } else {
      setCourseDepartmentFilter("");
      setCourseYearLevelFilter("");
    }
  }, [selectedStudent]);

  const filteredDisplayedSections = displayedSections.filter((section) => {
    // Ensure section has required properties
    if (!section || !section.course) {
      return false;
    }

    const matchesText =
      !courseQuery ||
      section.sectionCode?.toLowerCase().includes(courseQuery.toLowerCase()) ||
      section.sectionName?.toLowerCase().includes(courseQuery.toLowerCase()) ||
      section.course.courseCode
        ?.toLowerCase()
        .includes(courseQuery.toLowerCase()) ||
      section.course.courseName
        ?.toLowerCase()
        .includes(courseQuery.toLowerCase());

    const matchesDay =
      !dayFilter ||
      (section.schedule &&
        Array.isArray(section.schedule) &&
        section.schedule.some((sched) => sched?.day === dayFilter));

    const matchesAvailability =
      availabilityFilter === "all"
        ? true
        : availabilityFilter === "open"
        ? section.status === "Open" &&
          section.currentEnrollment < section.maxCapacity
        : availabilityFilter === "full"
        ? section.currentEnrollment >= section.maxCapacity ||
          section.status !== "Open"
        : true;

    const matchesDepartmentFilter =
      !courseDepartmentFilter ||
      section.course?.department === courseDepartmentFilter;

    const courseYearLevel = section.course?.courseCode
      ? mapCourseCodeToYearLevel(section.course.courseCode)
      : undefined;
    const matchesYearLevelFilter =
      !courseYearLevelFilter || courseYearLevelFilter === courseYearLevel;

    return (
      matchesText &&
      matchesDay &&
      matchesAvailability &&
      matchesDepartmentFilter &&
      matchesYearLevelFilter
    );
  });

  // Get enrolled sections for selected student and semester
  const enrolledSections = enrollments.filter(
    (enrollment) =>
      enrollment.studentId === selectedStudent?.id &&
      enrollment.semesterId === selectedSemester &&
      enrollment.status === "Enrolled"
  );

  // Filtering for Current Enrollments table
  const filteredEnrollments = enrollments.filter((record) => {
    const matchesSearch =
      !enrollmentSearchText ||
      record.student?.firstName
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.student?.lastName
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.student?.studentNumber
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.section?.sectionCode
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.section?.sectionName
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase());

    const matchesDepartment =
      !enrollmentDepartmentFilter ||
      record.student?.department === enrollmentDepartmentFilter;

    const matchesYearLevel =
      !enrollmentYearLevelFilter ||
      record.student?.yearLevel === enrollmentYearLevelFilter;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentStep(1);
    setSelectedSections([]);
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleEnrollStudent = async () => {
    if (
      !selectedStudent ||
      !selectedSemester ||
      selectedSections.length === 0
    ) {
      message.error("Please complete all required selections");
      return;
    }

    setCreateLoading(true);
    try {
      // Create enrollments for each selected section
      const enrollmentPromises = selectedSections.map((sectionId) =>
        enrollmentService.createEnrollment({
          studentId: selectedStudent.id,
          sectionId: sectionId,
          semesterId: selectedSemester,
          status: "Enrolled",
        })
      );

      await Promise.all(enrollmentPromises);

      message.success(
        `Successfully enrolled ${selectedStudent.firstName} ${selectedStudent.lastName} in ${selectedSections.length} section(s)`
      );

      // Refresh enrollments data
      await fetchEnrollments();

      // Reset form
      setSelectedStudent(null);
      setSelectedSemester("");
      setSelectedSections([]);
      setCurrentStep(0);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating enrollments:", error);
      message.error("Failed to create enrollments. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRemoveEnrollment = (enrollmentId: string) => {
    Modal.confirm({
      title: "Remove Enrollment",
      content: "Are you sure you want to remove this enrollment?",
      okText: "Yes, Remove",
      okType: "danger",
      async onOk() {
        setDeleteLoading(true);
        try {
          await enrollmentService.deleteEnrollment(enrollmentId);
          message.success("Enrollment removed successfully");

          // Refresh enrollments data
          await fetchEnrollments();
        } catch (error) {
          console.error("Error deleting enrollment:", error);
          message.error("Failed to delete enrollment. Please try again.");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const studentColumns: ColumnsType<Student> = [
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleStudentSelect(record)}
          disabled={record.status !== "Active"}
        >
          Select Student
        </Button>
      ),
    },
  ];

  const sectionColumns: ColumnsType<Section> = [
    {
      title: "Section",
      key: "section",
      render: (_, record) => (
        <Space>
          <BookOutlined className="text-purple-500" />
          <div>
            <div className="font-medium">{record.sectionCode}</div>
            <div className="text-sm text-gray-500">{record.sectionName}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.course?.courseCode || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {record.course?.courseName || "N/A"}
          </div>
          <div className="text-xs text-gray-400">
            {record.course?.units || 0} units
          </div>
        </div>
      ),
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => (
        <div className="text-sm">
          {(record.schedule || []).map((sched, index) => (
            <div key={index} className="text-xs">
              {sched?.day || "N/A"} {sched?.startTime || ""}-
              {sched?.endTime || ""}
              {sched?.room && ` (${sched.room})`}
            </div>
          ))}
          {(!record.schedule || record.schedule.length === 0) && (
            <div className="text-xs text-gray-400">No schedule available</div>
          )}
        </div>
      ),
    },
    {
      title: "Instructor",
      key: "instructor",
      render: (_, record) =>
        record.instructor ? (
          <div>
            <div className="font-medium">{record.instructor.name}</div>
            <div className="text-sm text-gray-500">
              {record.instructor.email}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        ),
    },
    {
      title: "Availability",
      key: "availability",
      render: (_, record) => (
        <div className="text-center">
          <div className="font-medium">
            {record.currentEnrollment}/{record.maxCapacity}
          </div>
          <div className="text-xs text-gray-500">
            {Math.round((record.currentEnrollment / record.maxCapacity) * 100)}%
            full
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isSelected = selectedSections.includes(record.id);
        const isEnrolled = enrolledSections.some(
          (e) => e.sectionId === record.id
        );

        return (
          <Button
            type={isSelected ? "primary" : "default"}
            danger={isSelected}
            icon={isSelected ? <MinusOutlined /> : <PlusOutlined />}
            onClick={() => handleSectionToggle(record.id)}
            disabled={
              isEnrolled || record.currentEnrollment >= record.maxCapacity
            }
          >
            {isSelected ? "Remove" : isEnrolled ? "Enrolled" : "Add"}
          </Button>
        );
      },
    },
  ];

  const enrollmentColumns: ColumnsType<Enrollment> = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">
              {record.student?.firstName} {record.student?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {record.student?.schoolId || "N/A"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Section",
      key: "section",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.section?.sectionCode || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {record.section?.sectionName || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Semester",
      key: "semester",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.semester?.semesterName || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {record.semester?.academicYear || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Enrolled"
            ? "green"
            : status === "Dropped"
            ? "red"
            : status === "Withdrawn"
            ? "orange"
            : status === "Completed"
            ? "blue"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: string) => grade || "N/A",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (remarks: string) => (
        <div className="max-w-xs truncate" title={remarks}>
          {remarks || "N/A"}
        </div>
      ),
    },
    {
      title: "Enrollment Date",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            onClick={() => {
              setEditingEnrollment(record);
              setEditingStatus(record.status);
              setEditingGrade(record.grade || "");
              setEditingRemarks(record.remarks || "");
              setIsEditModalOpen(true);
            }}
            loading={updateLoading}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            onClick={() => handleRemoveEnrollment(record.id)}
            loading={deleteLoading}
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  const steps = [
    {
      title: "Select Student",
      description: "Choose a student to enroll",
      icon: <UserOutlined />,
    },
    {
      title: "Select Semester",
      description: "Choose the semester",
      icon: <CalendarOutlined />,
    },
    {
      title: "Select Courses",
      description: "Choose courses to enroll",
      icon: <BookOutlined />,
    },
    {
      title: "Confirm",
      description: "Review and confirm enrollment",
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 flex items-center gap-3">
            <TeamOutlined className="text-green-600" />
            Student Enrollment
          </h1>
          <p className="text-gray-500 mt-2">
            Enroll students in courses for the current semester
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            loading={createLoading}
          >
            Enroll Student
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Current Enrollments */}
      <Card title="Current Enrollments" className="mb-6">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, number, course..."
            prefix={<SearchOutlined />}
            value={enrollmentSearchText}
            onChange={(e) => setEnrollmentSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by department"
            value={enrollmentDepartmentFilter || undefined}
            onChange={(val) => setEnrollmentDepartmentFilter(val || "")}
            allowClear
            options={enrollmentUniqueDepartments.map((d) => ({
              label: d,
              value: d,
            }))}
          />
          <Select
            placeholder="Filter by year level"
            value={enrollmentYearLevelFilter || undefined}
            onChange={(val) => setEnrollmentYearLevelFilter(val || "")}
            allowClear
            options={enrollmentUniqueYearLevels.map((y) => ({
              label: y,
              value: y,
            }))}
          />
        </div>
        <Spin spinning={enrollmentsLoading}>
          <Table
            columns={enrollmentColumns}
            dataSource={filteredEnrollments}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} enrollments`,
            }}
            scroll={{ x: "max-content" }}
          />
        </Spin>
      </Card>

      {/* Enrollment Modal */}
      <Modal
        title="Enroll Student"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setCurrentStep(0);
          setSelectedStudent(null);
          setSelectedSemester("");
          setSelectedSections([]);
        }}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          currentStep > 0 && (
            <Button key="back" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          ),
          currentStep < 3 ? (
            <Button
              key="next"
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && !selectedStudent) ||
                (currentStep === 1 && !selectedSemester) ||
                (currentStep === 2 && selectedSections.length === 0)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              key="enroll"
              type="primary"
              onClick={handleEnrollStudent}
              loading={createLoading}
            >
              Complete Enrollment
            </Button>
          ),
        ]}
      >
        <Steps current={currentStep} className="mb-6">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        {currentStep === 0 && (
          <div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Search students..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by department"
                value={studentDepartmentFilter || undefined}
                onChange={(val) => setStudentDepartmentFilter(val || "")}
                allowClear
                options={uniqueDepartments.map((d) => ({ label: d, value: d }))}
              />
              <Select
                placeholder="Filter by year level"
                value={studentYearLevelFilter || undefined}
                onChange={(val) => setStudentYearLevelFilter(val || "")}
                allowClear
                options={uniqueYearLevels.map((y) => ({ label: y, value: y }))}
              />
            </div>
            <Spin spinning={studentsLoading}>
              <Table
                columns={studentColumns}
                dataSource={filteredStudents}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Spin>
            {selectedStudent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Selected Student:</h4>
                <p className="text-blue-600">
                  {selectedStudent.firstName} {selectedStudent.lastName} (
                  {selectedStudent.studentNumber})
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="mt-5">
            <h4 className="font-medium mb-4">Select Semester:</h4>
            <Spin spinning={semestersLoading}>
              <div className="space-y-2 mt-5">
                {semesters.map((semester) => (
                  <Card
                    key={semester.id}
                    hoverable
                    className={`cursor-pointer mt-5 ${
                      selectedSemester === semester.id
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedSemester(semester.id)}
                  >
                    <div className="flex justify-between items-center mt-5">
                      <div>
                        <div className="font-medium">
                          {semester.semesterName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {semester.academicYear}
                        </div>
                        <div className="text-xs text-gray-400">
                          {semester.startDate && semester.endDate ? (
                            <>
                              {new Date(
                                semester.startDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(semester.endDate).toLocaleDateString()}
                            </>
                          ) : (
                            semester.semesterDuration ||
                            "Duration not specified"
                          )}
                        </div>
                      </div>
                      <Tag
                        color={
                          semester.status === "active" ||
                          semester.status === "Active"
                            ? "green"
                            : "blue"
                        }
                      >
                        {semester.status}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            </Spin>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h4 className="font-medium mb-4">Select Courses:</h4>
            <div className="mb-4">
              <Tag color="blue">
                Selected: {selectedSections.length} section(s)
              </Tag>
              {availableSections.length === 0 && (
                <Tag color="orange" className="ml-2">
                  No open sections found. Showing existing sections.
                </Tag>
              )}
              {selectedSections.length > 0 && (
                <Tag color="green" className="ml-2">
                  Total Units:{" "}
                  {selectedSections.reduce((total, sectionId) => {
                    const section = (sections || []).find(
                      (s) => s.id === sectionId
                    );
                    return total + (section?.course?.units || 0);
                  }, 0)}
                </Tag>
              )}
            </div>
            {/* Filters */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                placeholder="Search by course/section..."
                prefix={<SearchOutlined />}
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by day"
                value={dayFilter || undefined}
                onChange={(val) => setDayFilter(val || "")}
                allowClear
                options={uniqueDays.map((d) => ({ label: d, value: d }))}
              />
              <Select
                placeholder="Availability"
                value={availabilityFilter}
                onChange={(val) => setAvailabilityFilter(val)}
                options={[
                  { label: "All", value: "all" },
                  { label: "Open only", value: "open" },
                  { label: "Full/Closed", value: "full" },
                ]}
              />
              <Select
                placeholder="Department"
                value={courseDepartmentFilter || undefined}
                onChange={(val) => setCourseDepartmentFilter(val || "")}
                allowClear
                options={uniqueCourseDepartments.map((d) => ({
                  label: d,
                  value: d,
                }))}
              />
              <Select
                placeholder="Year level"
                value={courseYearLevelFilter || undefined}
                onChange={(val) => setCourseYearLevelFilter(val || "")}
                allowClear
                options={uniqueYearLevels.map((y) => ({ label: y, value: y }))}
              />
            </div>
            <Spin spinning={sectionsLoading}>
              <Table
                columns={sectionColumns}
                dataSource={filteredDisplayedSections}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Spin>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h4 className="font-medium mb-4">Review Enrollment:</h4>
            <div className="space-y-4">
              <Card>
                <h5 className="font-medium mb-2">Student Information:</h5>
                <p>
                  <strong>Name:</strong> {selectedStudent?.firstName}{" "}
                  {selectedStudent?.lastName}
                </p>
                <p>
                  <strong>Student Number:</strong>{" "}
                  {selectedStudent?.studentNumber}
                </p>
                <p>
                  <strong>Department:</strong> {selectedStudent?.department}
                </p>
                <p>
                  <strong>Year Level:</strong> {selectedStudent?.yearLevel}
                </p>
              </Card>

              <Card>
                <h5 className="font-medium mb-2">Semester:</h5>
                <p>
                  {
                    semesters.find((s) => s.id === selectedSemester)
                      ?.semesterName
                  }
                </p>
              </Card>

              <Card>
                <h5 className="font-medium mb-2">Selected Courses:</h5>
                <div className="space-y-2">
                  {selectedSections.map((sectionId) => {
                    const section = (sections || []).find(
                      (s) => s.id === sectionId
                    );
                    return section ? (
                      <div
                        key={sectionId}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">
                            {section.sectionCode} -{" "}
                            {section.course?.courseName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {section.course?.units || 0} units
                          </div>
                        </div>
                        <Tag color="blue">
                          {section.course?.units || 0} units
                        </Tag>
                      </div>
                    ) : null;
                  })}
                </div>
                <Divider />
                <div className="flex justify-between items-center font-medium">
                  <span>Total Units:</span>
                  <span className="text-blue-600">
                    {selectedSections.reduce((total, sectionId) => {
                      const section = (sections || []).find(
                        (s) => s.id === sectionId
                      );
                      return total + (section?.course?.units || 0);
                    }, 0)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal>
      {/* Edit Enrollment Modal */}
      <Modal
        title="Edit Enrollment"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingEnrollment(null);
        }}
        onOk={async () => {
          if (!editingEnrollment) return;

          setUpdateLoading(true);
          try {
            await enrollmentService.updateEnrollment(editingEnrollment.id, {
              status: editingStatus,
              grade: editingGrade,
              remarks: editingRemarks,
            });

            message.success("Enrollment updated successfully");

            // Refresh enrollments data
            await fetchEnrollments();

            setIsEditModalOpen(false);
            setEditingEnrollment(null);
            setEditingStatus("Enrolled");
            setEditingGrade("");
            setEditingRemarks("");
          } catch (error) {
            console.error("Error updating enrollment:", error);
            message.error("Failed to update enrollment. Please try again.");
          } finally {
            setUpdateLoading(false);
          }
        }}
        okText="Save"
        confirmLoading={updateLoading}
      >
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <Select
              value={editingStatus}
              onChange={(val) => setEditingStatus(val)}
              options={[
                { label: "Enrolled", value: "Enrolled" },
                { label: "Dropped", value: "Dropped" },
                { label: "Withdrawn", value: "Withdrawn" },
                { label: "Completed", value: "Completed" },
              ]}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Grade</div>
            <Input
              value={editingGrade}
              onChange={(e) => setEditingGrade(e.target.value)}
              placeholder="Enter grade (e.g., A, B+, 85, etc.)"
              maxLength={10}
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Remarks</div>
            <Input.TextArea
              value={editingRemarks}
              onChange={(e) => setEditingRemarks(e.target.value)}
              placeholder="Enter any remarks or notes"
              rows={3}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentEnrollment;
