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
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";
import type {
  Student,
  Course,
  StudentEnrollment,
  CreateStudentEnrollmentForm,
  Semester,
} from "../../types/enrollment";
import { enrollmentService } from "../../api/enrollmentService";
import { AxiosError } from "axios";
import { courseService } from "../../api/courseService";

const { Step } = Steps;

const StudentEnrollmentComponent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseQuery, setCourseQuery] = useState("");
  const [courseDepartmentFilter, setCourseDepartmentFilter] =
    useState<string>("");
  const [courseYearLevelFilter, setCourseYearLevelFilter] =
    useState<string>("");

  // Selection states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Search and filter states
  const [studentSearchText, setStudentSearchText] = useState("");
  const [studentDepartmentFilter, setStudentDepartmentFilter] =
    useState<string>("");
  const [studentYearLevelFilter, setStudentYearLevelFilter] =
    useState<string>("");

  // API Data States
  const [studentEnrollments, setStudentEnrollments] = useState<
    StudentEnrollment[]
  >([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [studentEnrollmentsLoading, setStudentEnrollmentsLoading] =
    useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
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
  const [editingStudentEnrollment, setEditingStudentEnrollment] =
    useState<StudentEnrollment | null>(null);

  // View modal for Current Enrollments
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudentEnrollment, setViewingStudentEnrollment] =
    useState<StudentEnrollment | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    name: string;
    studentNumber: string;
    department: string;
    yearLevel: string;
    semester: string;
    academicYear: string;
    selectedCourses: string[];
  }>({
    name: "",
    studentNumber: "",
    department: "",
    yearLevel: "1st Year",
    semester: "",
    academicYear: "",
    selectedCourses: [],
  });

  // Edit modal course selection states
  const [editCourseQuery, setEditCourseQuery] = useState("");
  const [editCourseDepartmentFilter, setEditCourseDepartmentFilter] =
    useState<string>("");
  const [editCourseYearLevelFilter, setEditCourseYearLevelFilter] =
    useState<string>("");

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
        fetchStudentEnrollments(),
        fetchStudents(),
        fetchSemesters(),
        fetchCourses(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student enrollments from API
  const fetchStudentEnrollments = async () => {
    try {
      setStudentEnrollmentsLoading(true);
      const data = await enrollmentService.getAllStudentEnrollments();
      // console.log("Fetched student enrollments:", data);
      setStudentEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      message.error("Failed to fetch student enrollments");
      setStudentEnrollments([]);
    } finally {
      setStudentEnrollmentsLoading(false);
    }
  };

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await enrollmentService.getStudents();
      // console.log("Fetched students:", data);
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch semesters from API
  const fetchSemesters = async () => {
    try {
      setSemestersLoading(true);
      const data = await enrollmentService.getSemesters();
      // console.log("Fetched semesters:", data);
      setSemesters(data || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setSemesters([]);
    } finally {
      setSemestersLoading(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const data = await courseService.getAllCourses();
      // console.log("Fetched courses:", data);
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
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

  // Filter students for selection
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !studentSearchText ||
      student.firstName
        ?.toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      student.lastName
        ?.toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      student.studentNumber
        ?.toLowerCase()
        .includes(studentSearchText.toLowerCase());

    const matchesDepartment =
      !studentDepartmentFilter ||
      student.department === studentDepartmentFilter;

    const matchesYearLevel =
      !studentYearLevelFilter || student.yearLevel === studentYearLevelFilter;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  // Get sections for selected semester
  // const availableSections = (sections || []).filter(
  //   (section) =>
  //     section.semesterId === selectedSemester &&
  //     section.status === "Open" &&
  //     section.currentEnrollment < section.maxCapacity
  // );

  // Fallback: if no available sections, show existing dummy sections
  // const fallbackSections = selectedSemester
  //   ? (sections || []).filter(
  //       (section) => section.semesterId === selectedSemester
  //     )
  //   : sections || [];
  // const displayedSections =
  //   availableSections.length > 0 ? availableSections : fallbackSections;

  // Derived filters for Select Courses step
  // const uniqueDays = Array.from(
  //   new Set(
  //     (sections || [])
  //       .filter((s) => s?.schedule && Array.isArray(s.schedule))
  //       .flatMap((s) => s.schedule.map((sched) => sched?.day).filter(Boolean))
  //   )
  // );

  const uniqueCourseDepartments = Array.from(
    new Set(
      (courses || []).filter((c) => c?.department).map((c) => c.department)
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

  // Course filters remain empty by default - no auto-population from selected student

  // const filteredDisplayedSections = displayedSections.filter((section) => {
  //   // Ensure section has required properties
  //   if (!section || !section.course) {
  //     return false;
  //   }

  //   const matchesText =
  //     !courseQuery ||
  //     section.sectionCode?.toLowerCase().includes(courseQuery.toLowerCase()) ||
  //     section.sectionName?.toLowerCase().includes(courseQuery.toLowerCase()) ||
  //     section.course.courseCode
  //       ?.toLowerCase()
  //       .includes(courseQuery.toLowerCase()) ||
  //     section.course.courseName
  //       ?.toLowerCase()
  //       .includes(courseQuery.toLowerCase());

  //   const matchesDay =
  //     !dayFilter ||
  //     (section.schedule &&
  //       Array.isArray(section.schedule) &&
  //       section.schedule.some((sched) => sched?.day === dayFilter));

  //   const matchesAvailability =
  //     availabilityFilter === "all"
  //       ? true
  //       : availabilityFilter === "open"
  //       ? section.status === "Open" &&
  //         section.currentEnrollment < section.maxCapacity
  //       : availabilityFilter === "full"
  //       ? section.currentEnrollment >= section.maxCapacity ||
  //         section.status !== "Open"
  //       : true;

  //   const matchesDepartmentFilter =
  //     !courseDepartmentFilter ||
  //     section.course?.department === courseDepartmentFilter;

  //   const courseYearLevel = section.course?.courseCode
  //     ? mapCourseCodeToYearLevel(section.course.courseCode)
  //     : undefined;
  //   const matchesYearLevelFilter =
  //     !courseYearLevelFilter || courseYearLevelFilter === courseYearLevel;

  //   return (
  //     matchesText &&
  //     matchesDay &&
  //     matchesAvailability &&
  //     matchesDepartmentFilter &&
  //     matchesYearLevelFilter
  //   );
  // });

  // // Get enrolled sections for selected student and semester
  // const enrolledSections = enrollments.filter(
  //   (enrollment) =>
  //     enrollment.studentId === selectedStudent?.id &&
  //     enrollment.semesterId === selectedSemester &&
  //     enrollment.status === "Enrolled"
  // );

  // Filter courses based on search and department filters
  const filteredCourses = courses.filter((course) => {
    // Search filter - matches course code, course name, or description
    const matchesSearch =
      !courseQuery ||
      course.courseCode?.toLowerCase().includes(courseQuery.toLowerCase()) ||
      course.courseName?.toLowerCase().includes(courseQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(courseQuery.toLowerCase());

    // Department filter
    const matchesDepartment =
      !courseDepartmentFilter || course.department === courseDepartmentFilter;

    // Year level filter based on course code (e.g., 101 -> 1st Year)
    const courseYearLevel = course.courseCode
      ? mapCourseCodeToYearLevel(course.courseCode)
      : undefined;
    const matchesYearLevel =
      !courseYearLevelFilter || courseYearLevelFilter === courseYearLevel;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  // Filter courses for edit modal
  const filteredEditCourses = courses.filter((course) => {
    // Search filter - matches course code, course name, or description
    const matchesSearch =
      !editCourseQuery ||
      course.courseCode
        ?.toLowerCase()
        .includes(editCourseQuery.toLowerCase()) ||
      course.courseName
        ?.toLowerCase()
        .includes(editCourseQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(editCourseQuery.toLowerCase());

    // Department filter
    const matchesDepartment =
      !editCourseDepartmentFilter ||
      course.department === editCourseDepartmentFilter;

    // Year level filter based on course code (e.g., 101 -> 1st Year)
    const courseYearLevel = course.courseCode
      ? mapCourseCodeToYearLevel(course.courseCode)
      : undefined;
    const matchesYearLevel =
      !editCourseYearLevelFilter ||
      editCourseYearLevelFilter === courseYearLevel;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  // Filtering for Current Student Enrollments table
  const filteredStudentEnrollments = studentEnrollments.filter((record) => {
    const matchesSearch =
      !enrollmentSearchText ||
      record.name?.toLowerCase().includes(enrollmentSearchText.toLowerCase()) ||
      record.studentNumber
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.selectedCourses.some((course) =>
        course.toLowerCase().includes(enrollmentSearchText.toLowerCase())
      );

    const matchesDepartment =
      !enrollmentDepartmentFilter ||
      record.department === enrollmentDepartmentFilter;

    const matchesYearLevel =
      !enrollmentYearLevelFilter ||
      record.yearLevel === enrollmentYearLevelFilter;

    return matchesSearch && matchesDepartment && matchesYearLevel;
  });

  const handleCourseToggle = (course: Course) => {
    const courseString = `${course.courseCode} - ${course.courseName} (${course.units} units)`;
    setSelectedCourses((prev) =>
      prev.includes(courseString)
        ? prev.filter((c) => c !== courseString)
        : [...prev, courseString]
    );
  };

  // Handle course toggle in edit modal
  const handleEditCourseToggle = (course: Course) => {
    const courseString = `${course.courseCode} - ${course.courseName} (${course.units} units)`;
    setEditFormData((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseString)
        ? prev.selectedCourses.filter((c) => c !== courseString)
        : [...prev.selectedCourses, courseString],
    }));
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentStep(1);
  };

  const handleSemesterSelect = (semester: Semester) => {
    // Only allow selection of active semesters
    if (semester.status === "Active" || semester.status === "active") {
      setSelectedSemester(semester);
      setCurrentStep(2);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedSemester || selectedCourses.length === 0) {
      message.error("Please complete all required selections");
      return;
    }

    setCreateLoading(true);
    try {
      const enrollmentData: CreateStudentEnrollmentForm = {
        name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentNumber: selectedStudent.schoolId,
        department: selectedStudent.department,
        yearLevel: selectedStudent.yearLevel,
        semester: selectedSemester.semesterName,
        academicYear: selectedSemester.academicYear,
        selectedCourses: selectedCourses,
      };

      await enrollmentService.createStudentEnrollment(enrollmentData);

      message.success(
        `Successfully enrolled ${selectedStudent.firstName} ${selectedStudent.lastName} in ${selectedCourses.length} course(s)`
      );

      // Refresh student enrollments data
      await fetchStudentEnrollments();

      // Reset selections
      setSelectedStudent(null);
      setSelectedSemester(null);
      setSelectedCourses([]);
      setCurrentStep(0);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating student enrollment:", error);
      message.error("Failed to create enrollment. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Student selection table columns
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

  const handleRemoveStudentEnrollment = (enrollmentId: string) => {
    Modal.confirm({
      title: "Remove Enrollment",
      content: "Are you sure you want to remove this enrollment?",
      okText: "Yes, Remove",
      okType: "danger",
      async onOk() {
        setDeleteLoading(true);
        try {
          await enrollmentService.deleteStudentEnrollment(enrollmentId);
          message.success("Enrollment removed successfully");

          // Refresh student enrollments data
          await fetchStudentEnrollments();
        } catch (error) {
          console.error("Error deleting enrollment:", error);
          message.error("Failed to delete enrollment. Please try again.");
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const courseColumns: ColumnsType<Course> = [
    {
      title: "Course Code",
      key: "courseCode",
      render: (_, record) => (
        <Space>
          <BookOutlined className="text-purple-500" />
          <div>
            <div className="font-medium">{record.courseCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Course Name",
      key: "courseName",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.courseName}</div>
          <div className="text-sm text-gray-500">
            {record.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      title: "Units",
      key: "units",
      width: 80,
      align: "center" as const,
      render: (_, record) => (
        <div className="text-center">
          <Tag color="blue">{record.units}</Tag>
        </div>
      ),
    },
    {
      title: "Department",
      key: "department",
      render: (_, record) => <Tag color="green">{record.department}</Tag>,
    },
    {
      title: "Prerequisites",
      key: "prerequisites",
      render: (_, record) => (
        <div className="text-sm">
          {record.prerequisites && record.prerequisites.length > 0 ? (
            record.prerequisites.map((prereqId, index) => {
              // Find the course by ID to get the course code
              const prereqCourse = courses.find(
                (course) => course.id === prereqId
              );
              return (
                <Tag key={index} color="orange" className="mb-1">
                  {prereqCourse ? prereqCourse.courseCode : prereqId}
                </Tag>
              );
            })
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const courseString = `${record.courseCode} - ${record.courseName} (${record.units} units)`;
        const isSelected = selectedCourses.includes(courseString);

        return (
          <Button
            type={isSelected ? "primary" : "default"}
            danger={isSelected}
            icon={isSelected ? <MinusOutlined /> : <PlusOutlined />}
            onClick={() => handleCourseToggle(record)}
          >
            {isSelected ? "Remove" : "Add"}
          </Button>
        );
      },
    },
  ];

  // Edit modal course columns
  const editCourseColumns: ColumnsType<Course> = [
    {
      title: "Course Code",
      key: "courseCode",
      render: (_, record) => (
        <Space>
          <BookOutlined className="text-purple-500" />
          <div>
            <div className="font-medium">{record.courseCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Course Name",
      key: "courseName",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.courseName}</div>
          <div className="text-sm text-gray-500">
            {record.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      title: "Units",
      key: "units",
      width: 80,
      align: "center" as const,
      render: (_, record) => (
        <div className="text-center">
          <Tag color="blue">{record.units}</Tag>
        </div>
      ),
    },
    {
      title: "Department",
      key: "department",
      render: (_, record) => <Tag color="green">{record.department}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const courseString = `${record.courseCode} - ${record.courseName} (${record.units} units)`;
        const isSelected = editFormData.selectedCourses.includes(courseString);

        return (
          <Button
            type={isSelected ? "primary" : "default"}
            danger={isSelected}
            icon={isSelected ? <MinusOutlined /> : <PlusOutlined />}
            onClick={() => handleEditCourseToggle(record)}
          >
            {isSelected ? "Remove" : "Add"}
          </Button>
        );
      },
    },
  ];

  // New StudentEnrollment table columns
  const studentEnrollmentColumns: ColumnsType<StudentEnrollment> = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">
              {record.studentNumber || "N/A"}
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
      key: "semester",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.semester}</div>
          <div className="text-sm text-gray-500">{record.academicYear}</div>
        </div>
      ),
    },
    {
      title: "Courses",
      key: "courses",
      render: (_, record) => (
        <div className="max-w-xs">
          {record.selectedCourses.slice(0, 2).map((course, index) => (
            <Tag key={index} color="purple" className="mb-1 text-xs">
              {course.split(" - ")[0]}
            </Tag>
          ))}
          {record.selectedCourses.length > 2 && (
            <Tag color="default" className="text-xs">
              +{record.selectedCourses.length - 2} more
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Total Units",
      dataIndex: "totalUnits",
      key: "totalUnits",
      align: "center" as const,
      render: (units: number) => (
        <Tag color="orange" className="font-medium">
          {units} units
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewingStudentEnrollment(record);
              setIsViewModalOpen(true);
            }}
            title="View Details"
          >
            View
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStudentEnrollment(record);
              setEditFormData({
                name: record.name,
                studentNumber: record.studentNumber || "",
                department: record.department,
                yearLevel: record.yearLevel,
                semester: record.semester,
                academicYear: record.academicYear,
                selectedCourses: [...record.selectedCourses],
              });
              setIsEditModalOpen(true);
            }}
            loading={updateLoading}
            title="Edit Enrollment"
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveStudentEnrollment(record.id)}
            loading={deleteLoading}
            title="Remove Enrollment"
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
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
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
        <Spin spinning={studentEnrollmentsLoading}>
          <Table
            columns={studentEnrollmentColumns}
            dataSource={filteredStudentEnrollments}
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
          setSelectedSemester(null);
          setSelectedCourses([]);
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
                (currentStep === 2 && selectedCourses.length === 0)
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
            <h4 className="font-medium mb-4">Select Student:</h4>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Search students..."
                prefix={<SearchOutlined />}
                value={studentSearchText}
                onChange={(e) => setStudentSearchText(e.target.value)}
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
          <div>
            <h4 className="font-medium mb-4">Select Semester:</h4>
            <Spin spinning={semestersLoading}>
              <div className="space-y-2">
                {semesters.map((semester) => {
                  const isActive =
                    semester.status === "Active" ||
                    semester.status === "active";
                  const isSelected = selectedSemester?.id === semester.id;

                  return (
                    <Card
                      key={semester.id}
                      hoverable={isActive}
                      className={`${
                        isActive
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } ${
                        isSelected && isActive
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => isActive && handleSemesterSelect(semester)}
                    >
                      <div className="flex justify-between items-center">
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
                                {new Date(
                                  semester.endDate
                                ).toLocaleDateString()}
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
                              : semester.status === "inactive" ||
                                semester.status === "Inactive"
                              ? "red"
                              : "blue"
                          }
                        >
                          {semester.status}
                        </Tag>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Spin>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h4 className="font-medium mb-4">Select Courses:</h4>
            <div className="mb-4">
              <Tag color="blue">
                Selected: {selectedCourses.length} course(s)
              </Tag>
              {selectedCourses.length > 0 && (
                <Tag color="green" className="ml-2">
                  Total Units:{" "}
                  {selectedCourses.reduce((total, courseString) => {
                    const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
                    return (
                      total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0)
                    );
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
            <Spin spinning={coursesLoading}>
              <Table
                columns={courseColumns}
                dataSource={filteredCourses}
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
                  {selectedStudent?.schoolId || "N/A"}
                </p>
                <p>
                  <strong>Department:</strong> {selectedStudent?.department}
                </p>
                <p>
                  <strong>Year Level:</strong> {selectedStudent?.yearLevel}
                </p>
              </Card>

              <Card>
                <h5 className="font-medium mb-2">Academic Details:</h5>
                <p>
                  <strong>Semester:</strong> {selectedSemester?.semesterName}
                </p>
                <p>
                  <strong>Academic Year:</strong>{" "}
                  {selectedSemester?.academicYear}
                </p>
              </Card>

              <Card>
                <h5 className="font-medium mb-2">Selected Courses:</h5>
                <div className="space-y-2">
                  {selectedCourses.map((courseString, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-black rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {courseString.split(" (")[0]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {courseString.match(/\((\d+)\s+units?\)/)?.[0] ||
                            "N/A"}
                        </div>
                      </div>
                      <Tag color="blue">
                        {courseString.match(/\((\d+)\s+units?\)/)?.[1] || 0}{" "}
                        units
                      </Tag>
                    </div>
                  ))}
                </div>
                <Divider />
                <div className="flex justify-between items-center font-medium">
                  <span>Total Units:</span>
                  <span className="text-blue-600">
                    {selectedCourses.reduce((total, courseString) => {
                      const unitsMatch =
                        courseString.match(/\((\d+)\s+units?\)/);
                      return (
                        total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0)
                      );
                    }, 0)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal>
      {/* View Student Enrollment Modal */}
      <Modal
        title="View Student Enrollment"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingStudentEnrollment(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {viewingStudentEnrollment && (
          <div className="space-y-4">
            <Card>
              <h5 className="font-medium mb-3">Student Information</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{viewingStudentEnrollment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student Number</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.studentNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.department}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year Level</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.yearLevel}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h5 className="font-medium mb-3">Academic Information</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.semester}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.academicYear}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Units</p>
                  <p className="font-medium">
                    <Tag color="orange">
                      {viewingStudentEnrollment.totalUnits} units
                    </Tag>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p className="font-medium">
                    {new Date(
                      viewingStudentEnrollment.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h5 className="font-medium mb-3">Enrolled Courses</h5>
              <div className="space-y-2">
                {viewingStudentEnrollment.selectedCourses.map(
                  (courseString, index) => {
                    const courseParts = courseString.split(" - ");
                    const courseCode = courseParts[0];
                    const courseName = courseParts[1]?.split(" (")[0];
                    const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
                    const units = unitsMatch ? unitsMatch[1] : "0";

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-black rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-blue-600">
                            {courseCode}
                          </div>
                          <div className="text-sm text-gray-600">
                            {courseName}
                          </div>
                        </div>
                        <Tag color="blue">{units} units</Tag>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Edit Student Enrollment Modal */}
      <Modal
        title="Update Student Courses"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingStudentEnrollment(null);
          // Reset edit course filters
          setEditCourseQuery("");
          setEditCourseDepartmentFilter("");
          setEditCourseYearLevelFilter("");
        }}
        onOk={async () => {
          if (!editingStudentEnrollment) return;

          // Validate required fields - only validate selected courses for admin update
          if (
            !editFormData.selectedCourses ||
            editFormData.selectedCourses.length === 0
          ) {
            message.error("At least one course must be selected");
            return;
          }

          setUpdateLoading(true);
          try {
            // Admin can only update selected courses
            const updateData = {
              selectedCourses: editFormData.selectedCourses,
            };

            await enrollmentService.updateStudentEnrollment(
              editingStudentEnrollment.id,
              updateData
            );

            message.success("Student courses updated successfully");
            await fetchStudentEnrollments();
            setIsEditModalOpen(false);
            setEditingStudentEnrollment(null);
          } catch (error: unknown) {
            console.error("Error updating student enrollment:", error);

            // Provide more specific error messages
            let errorMessage = "Failed to update courses. Please try again.";

            if (error instanceof AxiosError) {
              if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.response?.status === 500) {
                errorMessage =
                  "Server error occurred. Please check the data and try again.";
              } else if (error.response?.status === 404) {
                errorMessage =
                  "Enrollment not found. It may have been deleted.";
              } else if (error.response?.status === 400) {
                errorMessage =
                  "Invalid data provided. Please check your inputs.";
              }
            }

            message.error(errorMessage);
          } finally {
            setUpdateLoading(false);
          }
        }}
        okText="Save Changes"
        confirmLoading={updateLoading}
        width={1400}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Name (Read-only)
              </label>
              <Input
                value={editFormData.name}
                disabled
                placeholder="Enter student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Number (Read-only)
              </label>
              <Input
                value={editFormData.studentNumber}
                disabled
                placeholder="Enter student number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Department (Read-only)
              </label>
              <Select
                value={editFormData.department}
                disabled
                style={{ width: "100%" }}
                options={uniqueDepartments.map((d) => ({ label: d, value: d }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Year Level (Read-only)
              </label>
              <Select
                value={editFormData.yearLevel}
                disabled
                style={{ width: "100%" }}
                options={[
                  { label: "1st Year", value: "1st Year" },
                  { label: "2nd Year", value: "2nd Year" },
                  { label: "3rd Year", value: "3rd Year" },
                  { label: "4th Year", value: "4th Year" },
                  { label: "5th Year", value: "5th Year" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Semester (Read-only)
              </label>
              <Input
                value={editFormData.semester}
                disabled
                placeholder="Enter semester"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Year (Read-only)
              </label>
              <Input
                value={editFormData.academicYear}
                disabled
                placeholder="Enter academic year"
              />
            </div>
          </div>

          <Divider orientation="left">Course Management</Divider>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Selected Courses Section */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <BookOutlined className="text-blue-400" />
                  Selected Courses
                </h4>
                <div className="flex gap-2">
                  <Tag color="green" className="font-medium">
                    Total Units:{" "}
                    {editFormData.selectedCourses.reduce(
                      (total, courseString) => {
                        const unitsMatch =
                          courseString.match(/\((\d+)\s+units?\)/);
                        return (
                          total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0)
                        );
                      },
                      0
                    )}
                  </Tag>
                  <Tag color="blue" className="font-medium">
                    {editFormData.selectedCourses.length} course(s)
                  </Tag>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-900 rounded border border-gray-600 p-3">
                {editFormData.selectedCourses.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <BookOutlined className="text-4xl text-gray-500 mb-2" />
                    <p className="text-gray-300">No courses selected</p>
                    <p className="text-sm text-gray-400">
                      Add courses from the available list
                    </p>
                  </div>
                ) : (
                  editFormData.selectedCourses.map((courseString, index) => {
                    const courseParts = courseString.split(" - ");
                    const courseCode = courseParts[0];
                    const courseName = courseParts[1]?.split(" (")[0];
                    const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
                    const units = unitsMatch ? unitsMatch[1] : "0";

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-blue-900/30 border border-blue-700 rounded-lg hover:bg-blue-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-blue-300">
                            {courseCode}
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            {courseName}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Tag color="cyan" className="font-medium">
                            {units} units
                          </Tag>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => {
                              const newCourses =
                                editFormData.selectedCourses.filter(
                                  (_, i) => i !== index
                                );
                              setEditFormData({
                                ...editFormData,
                                selectedCourses: newCourses,
                              });
                            }}
                            className="hover:bg-red-900/30"
                            title="Remove course"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Available Courses Section */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <PlusOutlined className="text-green-400" />
                  Available Courses
                </h4>
              </div>

              {/* Course Search and Filters */}
              <div className="mb-4 space-y-3 bg-gray-900 p-3 rounded border border-gray-600">
                <Input
                  placeholder="Search by course code, name, or description..."
                  prefix={<SearchOutlined />}
                  value={editCourseQuery}
                  onChange={(e) => setEditCourseQuery(e.target.value)}
                  allowClear
                  className="mb-2"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select
                    placeholder="Filter by Department"
                    value={editCourseDepartmentFilter || undefined}
                    onChange={(val) => setEditCourseDepartmentFilter(val || "")}
                    allowClear
                    className="w-full"
                    options={uniqueCourseDepartments.map((d) => ({
                      label: d,
                      value: d,
                    }))}
                  />
                  <Select
                    placeholder="Filter by Year Level"
                    value={editCourseYearLevelFilter || undefined}
                    onChange={(val) => setEditCourseYearLevelFilter(val || "")}
                    allowClear
                    className="w-full"
                    options={uniqueYearLevels.map((y) => ({
                      label: y,
                      value: y,
                    }))}
                  />
                </div>
              </div>

              {/* Available Courses Table */}
              <div className="bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
                <Spin spinning={coursesLoading}>
                  <Table
                    columns={editCourseColumns}
                    dataSource={filteredEditCourses}
                    rowKey="id"
                    pagination={{
                      pageSize: 6,
                      size: "small",
                      showSizeChanger: false,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} courses`,
                    }}
                    size="small"
                    scroll={{ y: 320 }}
                    className="course-selection-table"
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentEnrollmentComponent;
