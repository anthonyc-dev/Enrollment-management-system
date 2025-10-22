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

const { Step } = Steps;

const StudentEnrollmentComponent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseQuery, setCourseQuery] = useState("");
  const [courseDepartmentFilter, setCourseDepartmentFilter] =
    useState<string>("");
  const [courseYearLevelFilter, setCourseYearLevelFilter] =
    useState<string>("");
  const [coursesModalVisible, setCoursesModalVisible] = useState(false);
  const [selectedRecordForCourses, setSelectedRecordForCourses] =
    useState<StudentEnrollment | null>(null);

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
    firstName: string;
    lastName: string;
    studentNumber: string;
    department: string;
    yearLevel: string;
    semester: string;
    academicYear: string;
    selectedCourses: string[];
    // Additional StudentEnrollment properties
    schedule?: {
      day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday";
      startTime: string;
      endTime: string;
      room?: string;
    }[];
    timeStart?: string;
    timeEnd?: string;
    room?: string;
    instructor?: string;
    courseCode?: string;
    courseName?: string;
    day?: string;
    units?: number;
    totalUnits?: number;
  }>({
    firstName: "",
    lastName: "",
    studentNumber: "",
    department: "",
    yearLevel: "1st Year",
    semester: "",
    academicYear: "",
    selectedCourses: [],
    // Initialize additional properties
    schedule: [],
    timeStart: "",
    timeEnd: "",
    room: "",
    instructor: "",
    courseCode: "",
    courseName: "",
    day: "",
    units: 0,
    totalUnits: 0,
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
      console.log("Fetching student enrollments...");
      const data = await enrollmentService.getAllStudentEnrollments();
      console.log("Fetched student enrollments:", data);
      console.log("Number of enrollments found:", data?.length || 0);

      // Debug: Log the structure of the first enrollment to understand data format
      if (data && data.length > 0) {
        console.log("First enrollment structure:", data[0]);
        console.log(
          "Selected courses in first enrollment:",
          data[0].selectedCourses
        );
        console.log("Type of selectedCourses:", typeof data[0].selectedCourses);
        console.log(
          "Is selectedCourses an array:",
          Array.isArray(data[0].selectedCourses)
        );
      }

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
      const data = await enrollmentService.getCourses();
      console.log("Fetched courses:", data);
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
      case 6:
        return "Old Student";
      default:
        return undefined;
    }
  };

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
    // Debug each record being filtered
    console.log("Filtering record:", record);

    const matchesSearch =
      !enrollmentSearchText ||
      record.firstName
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.lastName
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.studentNumber
        ?.toLowerCase()
        .includes(enrollmentSearchText.toLowerCase()) ||
      record.selectedCourses?.some((course) =>
        course.toLowerCase().includes(enrollmentSearchText.toLowerCase())
      );

    const matchesDepartment =
      !enrollmentDepartmentFilter ||
      record.department === enrollmentDepartmentFilter;

    const matchesYearLevel =
      !enrollmentYearLevelFilter ||
      record.yearLevel === enrollmentYearLevelFilter;

    const passes = matchesSearch && matchesDepartment && matchesYearLevel;
    console.log("Record passes filter:", passes, {
      matchesSearch,
      matchesDepartment,
      matchesYearLevel,
    });

    return passes;
  });

  console.log("Final filtered enrollments:", filteredStudentEnrollments);

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
    // Validate prerequisites
    if (!selectedStudent || !selectedSemester || selectedCourses.length === 0) {
      message.error("Please complete all enrollment steps before submitting.");
      return;
    }

    setCreateLoading(true);
    try {
      console.log(
        `Creating enrollment for ${selectedCourses.length} courses:`,
        selectedCourses
      );

      // Validate student information
      if (
        !selectedStudent.firstName ||
        !selectedStudent.lastName ||
        !selectedStudent.department
      ) {
        message.error(
          "Student information is incomplete. Please ensure student has firstName, lastName, and department."
        );
        return;
      }

      // Calculate total units from all selected courses
      const totalUnits = selectedCourses.reduce((total, courseString) => {
        const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
        return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
      }, 0);

      // Find course details from courses array for schedule information (use first course as default)
      let courseDetails = null;
      if (selectedCourses.length > 0) {
        const firstCourse = selectedCourses[0];
        const courseMatch = firstCourse.match(
          /^([A-Z0-9]+)\s*-\s*([^(]+?)\s*\((\d+)\s+units?\)/i
        );
        if (courseMatch) {
          const firstCourseCode = courseMatch[1].trim();
          courseDetails = courses.find(
            (course) => course.courseCode === firstCourseCode
          );
        }
      }

      const enrollmentData: CreateStudentEnrollmentForm = {
        // Required student information
        schoolId:
          selectedStudent.schoolId ||
          selectedStudent.studentNumber ||
          `S2025-${Date.now().toString().slice(-3)}`,
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        middleName: selectedStudent.middleName || "",
        studentNumber:
          selectedStudent.studentNumber || selectedStudent.schoolId,

        // Department information
        department: selectedStudent.department,

        // Academic information
        yearLevel: selectedStudent.yearLevel,
        semester: selectedSemester.semesterName,
        academicYear: selectedSemester.academicYear,

        // All selected courses - will be stored as course codes in prerequisites array
        selectedCourses: Array.isArray(selectedCourses) ? selectedCourses : [],
        totalUnits: totalUnits,

        // Schedule information (from course details if available)
        day: courseDetails?.day || "Monday",
        timeStart: courseDetails?.timeStart || "08:00 AM",
        timeEnd: courseDetails?.timeEnd || "10:00 AM",
        room: courseDetails?.room || "TBA",
        instructor: courseDetails?.instructor || "TBA",

        // Additional fields
        description:
          courseDetails?.description ||
          `Multiple course enrollment for ${selectedCourses.length} courses`,
        prerequisites: [], // Will be populated by API service with selected course codes
        maxCapacity: courseDetails?.maxCapacity || 30,
        status: "Enrolled",
        createdAt: new Date().toISOString(),

        // These fields will be populated per course by the API service
        courseCode: "", // Will be set per course
        courseName: "", // Will be set per course
        units: 0, // Will be set per course
      };

      console.log("Enrollment data being sent:", enrollmentData);
      console.log(
        `This will create 1 enrollment record with ${selectedCourses.length} courses stored in prerequisites array`
      );

      // Create single student enrollment with all courses stored in prerequisites array
      await enrollmentService.createStudentEnrollment(enrollmentData);

      message.success(
        `Successfully enrolled ${selectedStudent.firstName} ${selectedStudent.lastName} in ${selectedCourses.length} course(s) (${totalUnits} total units). 1 enrollment record created with courses stored in prerequisites array.`
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

      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to create enrollment. Please try again.";

      if (error instanceof Error) {
        // Handle validation errors from our own checks
        if (error.message.includes("Missing required fields")) {
          errorMessage = `Validation Error: ${error.message}`;
        } else if (error.message.includes("Invalid course format")) {
          errorMessage = `Course Format Error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage =
            "API endpoint not found. Please check if the backend server is running and the endpoint exists.";
        } else if (error.response?.status === 400) {
          // Extract specific error message from server response
          const serverMessage = error.response?.data?.message;
          if (serverMessage) {
            errorMessage = `Bad Request: ${serverMessage}`;
          } else {
            errorMessage =
              "Invalid data format. Please check all required fields are filled.";
          }
        } else if (error.response?.status === 500) {
          errorMessage =
            "Server error occurred. Please check the backend server logs.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      message.error(errorMessage);
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
          // Delete student enrollment using proper API service
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
      key: "semester",
      render: (_, record) => (
        <Space>
          <div>
            <div className="font-medium">{record.semester}</div>
            <div className="text-sm text-gray-500">{record.academicYear}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Enrolled" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Courses",
      key: "courses",
      render: (_, record) => {
        console.log("Rendering courses for record:", record.id, record);

        // Get course codes from selectedCourses (which comes from prerequisites array)
        let courseCodes = record.selectedCourses || [];

        // Ensure courseCodes is an array
        if (!Array.isArray(courseCodes)) {
          courseCodes = [];
        }

        console.log("Processed courses array:", courseCodes);

        if (courseCodes.length === 0) {
          // Fallback: single course field
          if (record.courseCode) {
            return (
              <Tag color="purple" className="text-xs">
                {record.courseCode}
              </Tag>
            );
          }
          return <Tag color="default">No courses</Tag>;
        }

        // Show only first course with +X more indicator
        const firstCourse = courseCodes[0]?.trim();
        const remainingCount = courseCodes.length - 1;

        // Note: match variable removed as it's not used in the simplified display

        return (
          <div
            className="cursor-pointer hover:bg-black/50 p-1 rounded"
            onClick={() => {
              setSelectedRecordForCourses(record);
              setCoursesModalVisible(true);
            }}
          >
            <Space>
              <Tag color="purple" className="text-xs">
                {firstCourse}
              </Tag>
              {remainingCount > 0 && (
                <span className="text-xs text-gray-500 hover:text-blue-500">
                  +{remainingCount} more
                </span>
              )}
            </Space>
          </div>
        );
      },
    },

    {
      title: "Total Units",
      key: "totalUnits",
      align: "center" as const,
      render: (_, record) => {
        console.log(
          "Rendering total units for record:",
          record.id,
          "totalUnits:",
          record.totalUnits
        );

        // Try to get total units from different possible sources
        let totalUnits = record.totalUnits;

        // If totalUnits is missing or 0, try to calculate from selectedCourses
        if (!totalUnits || totalUnits === 0) {
          const recordAny = record as unknown as Record<string, unknown>;
          const courses = record.selectedCourses || recordAny.courses || [];

          if (Array.isArray(courses) && courses.length > 0) {
            totalUnits = courses.reduce((total, courseString) => {
              if (typeof courseString === "string") {
                // Extract units from course string format: "CS201 - Data Structures and Algorithms (3 units)"
                const unitsMatch = courseString.match(
                  /^([A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s*\d{1,3}[A-Za-z0-9-]*)?)$/
                );
                return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
              }
              return total;
            }, 0);
          }
        }

        // Fallback to individual units field if available
        if (!totalUnits || totalUnits === 0) {
          totalUnits = record.units || 0;
        }

        console.log("Final calculated total units:", totalUnits);

        return (
          <Tag
            color={totalUnits > 0 ? "orange" : "default"}
            className="font-medium"
          >
            {totalUnits || 0} units
          </Tag>
        );
      },
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
                firstName: record.firstName,
                lastName: record.lastName,
                studentNumber: record.schoolId || "",
                department: record.department,
                yearLevel: record.yearLevel,
                semester: record.semester,
                academicYear: record.academicYear,
                selectedCourses: [...record.selectedCourses],
                schedule: record.schedule,
                timeStart: record.timeStart,
                timeEnd: record.timeEnd,
                room: record.room,
                totalUnits: record.totalUnits,
                instructor: record.instructor,
                courseCode: record.courseCode,
                courseName: record.courseName,
                day: record.day,
                units: record.units,
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
            Manage student enrollments - Add, update, and delete student course
            enrollments
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
          {/* <Button
            type="dashed"
            onClick={() => {
              console.log("=== API ENDPOINTS USED ===");
              console.log("CREATE: POST /courses/createCourse");
              console.log("READ: GET /courses/getAllCourses");
              console.log("UPDATE: PUT /courses/updateCourse/[id]");
              console.log("DELETE: DELETE /courses/deleteCourse/[id]");
              console.log("=========================");
              message.info(
                "API endpoints logged to console - Check browser dev tools"
              );
            }}
          >
            Show API Info
          </Button> */}
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
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Student Enrollments</span>
            <div className="flex gap-2">
              <Tag color="blue">Total: {studentEnrollments.length}</Tag>
              <Tag color="green">
                Total Units:{" "}
                {studentEnrollments.reduce(
                  (total, enrollment) => total + enrollment.totalUnits,
                  0
                )}
              </Tag>
              {/* <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchStudentEnrollments}
                loading={studentEnrollmentsLoading}
                type="dashed"
              >
                Refresh Enrollments
              </Button>
              <Button
                size="small"
                onClick={() => {
                  console.log("=== DEBUG INFO ===");
                  console.log("studentEnrollments state:", studentEnrollments);
                  console.log(
                    "filteredStudentEnrollments:",
                    filteredStudentEnrollments
                  );
                  console.log(
                    "studentEnrollments.length:",
                    studentEnrollments.length
                  );
                  console.log(
                    "filteredStudentEnrollments.length:",
                    filteredStudentEnrollments.length
                  );
                  console.log("enrollmentSearchText:", enrollmentSearchText);
                  console.log(
                    "enrollmentDepartmentFilter:",
                    enrollmentDepartmentFilter
                  );
                  console.log(
                    "enrollmentYearLevelFilter:",
                    enrollmentYearLevelFilter
                  );
                  console.log("==================");
                  message.info("Debug info logged to console");
                }}
                type="text"
              >
                Debug Table
              </Button> */}
            </div>
          </div>
        }
        className="mb-6"
      >
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
            locale={{
              emptyText:
                studentEnrollments.length === 0
                  ? "No enrollment records found. Try creating an enrollment first, then click 'Refresh Enrollments'."
                  : "No records match your search criteria.",
            }}
            onRow={(record) => {
              console.log("Table row data:", record);
              return {};
            }}
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
                  <p className="font-medium">
                    {viewingStudentEnrollment.firstName}{" "}
                    {viewingStudentEnrollment.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student Number</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.schoolId || "N/A"}
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
                  <p className="text-sm text-gray-500">Enrollment Status</p>
                  <p className="font-medium">
                    {viewingStudentEnrollment.status}
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
                {viewingStudentEnrollment.selectedCourses &&
                viewingStudentEnrollment.selectedCourses.length > 0 ? (
                  viewingStudentEnrollment.selectedCourses.map(
                    (courseCode, index) => {
                      // courseCode is already a string from prerequisites array
                      const trimmedCode = courseCode.trim();

                      // Find matching course data
                      const match = courses?.find(
                        (c) =>
                          c.courseCode?.toUpperCase().replace(/\s+/g, "") ===
                            trimmedCode.toUpperCase().replace(/\s+/g, "") ||
                          c.id?.toString() === trimmedCode ||
                          c.courseCode?.toUpperCase() ===
                            trimmedCode.toUpperCase()
                      );

                      // Use course data from match if available
                      const finalCourseName =
                        match?.courseName || "Course details not available";
                      const finalUnits = match?.units || 0;
                      const schedules = Array.isArray(match?.schedules)
                        ? match?.schedules
                        : [];
                      const day = match?.day || "N/A";
                      const timeStart = match?.timeStart || "N/A";
                      const timeEnd = match?.timeEnd || "N/A";
                      const room = match?.room || "N/A";
                      const instructor = match?.instructor || "N/A";

                      return (
                        <div
                          key={index}
                          className="flex flex-col p-3 bg-gray-900 rounded-lg space-y-2"
                        >
                          {/* Course Header */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-blue-400">
                                {trimmedCode}
                              </div>
                              <div className="text-sm text-gray-400">
                                {finalCourseName}
                              </div>
                            </div>
                            <Tag color="blue">{finalUnits} units</Tag>
                          </div>

                          {/* Schedule Details */}
                          {schedules && schedules.length > 0 ? (
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-2 space-y-2">
                              <p className="font-medium text-yellow-400">
                                Schedules:
                              </p>
                              {schedules.map((s, i) => (
                                <div
                                  key={i}
                                  className="flex flex-wrap gap-x-4 gap-y-1"
                                >
                                  <div>
                                    <strong>Day:</strong> {s.day || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Time:</strong>{" "}
                                    {s.timeStart || "N/A"} -{" "}
                                    {s.timeEnd || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Room:</strong> {s.room || "N/A"}
                                  </div>
                                  {s.instructor && (
                                    <div>
                                      <strong>Instructor:</strong>{" "}
                                      {s.instructor}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 border-t border-gray-800 pt-2">
                              <div>
                                <strong>Day:</strong> {day}
                              </div>
                              <div>
                                <strong>Time:</strong> {timeStart} - {timeEnd}
                              </div>
                              <div>
                                <strong>Room:</strong> {room}
                              </div>
                              <div>
                                <strong>Instructor:</strong> {instructor}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="text-gray-500 text-sm">
                    No enrolled courses
                  </div>
                )}
              </div>

              {/* ✅ Total Units Summary */}
              <div className="mt-4 flex justify-end border-t border-gray-700 pt-3">
                <span className="text-gray-300 text-sm">
                  <strong>Total Units:</strong>{" "}
                  {viewingStudentEnrollment.totalUnits || 0} units
                </span>
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

            // Update student enrollment using proper API service
            await enrollmentService.updateStudentEnrollment(
              editingStudentEnrollment.id,
              updateData
            );

            const totalUnits = editFormData.selectedCourses.reduce(
              (total, courseString) => {
                const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
                return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
              },
              0
            );

            message.success(
              `Student courses updated successfully - ${editFormData.selectedCourses.length} course(s) (${totalUnits} total units)`
            );
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
                value={`${editFormData.firstName} ${editFormData.lastName}`}
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

      {/* Courses Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOutlined />
            <span>Enrolled Courses</span>
          </div>
        }
        open={coursesModalVisible}
        onCancel={() => setCoursesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCoursesModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedRecordForCourses && (
          <div>
            <div className="mb-4 p-3 bg-black/50 rounded-lg">
              <div className="font-medium text-gray-300">
                Student: {selectedRecordForCourses.firstName}{" "}
                {selectedRecordForCourses.lastName}
              </div>
              <div className="text-sm text-gray-400">
                Semester: {selectedRecordForCourses.semester}{" "}
                {selectedRecordForCourses.academicYear}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-300">Enrolled Courses:</h4>
              {(selectedRecordForCourses.selectedCourses || []).map(
                (courseCode, index) => {
                  const trimmedCode = courseCode.trim();

                  // Try to find matching course for additional info
                  const match = (courses || []).find(
                    (c) =>
                      c.courseCode?.toUpperCase().replace(/\s+/g, "") ===
                        trimmedCode.toUpperCase().replace(/\s+/g, "") ||
                      c.id === trimmedCode ||
                      c.courseCode?.toUpperCase() === trimmedCode.toUpperCase()
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-black/50  rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">
                          {match?.courseCode || trimmedCode}
                        </div>
                        {match?.courseName && (
                          <div className="text-sm text-blue-700">
                            {match.courseName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Tag color="blue" className="font-medium">
                          {match?.units || 0} units
                        </Tag>
                      </div>
                    </div>
                  );
                }
              )}

              {(selectedRecordForCourses.selectedCourses || []).length ===
                0 && (
                <div className="text-center py-8 text-gray-500">
                  No courses enrolled
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentEnrollmentComponent;
