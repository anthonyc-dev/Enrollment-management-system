import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Table,
  Modal,
  Select,
  Space,
  Form,
  message,
  Tag,
  Badge,
  InputNumber,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  BookOutlined,
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";
import { AxiosError } from "axios";
import { courseService, sectionService } from "../../api/courseService";
import type {
  Course,
  Section,
  CreateCourseForm,
  CreateSectionForm,
} from "../../types/enrollment";
import {
  departments,
  getClearingOfficersAsInstructors,
  semesters,
  type Instructor,
} from "@/data/subData";

const { Option } = Select;
const { TextArea } = Input;

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [viewingSection, setViewingSection] = useState<Section | null>(null);
  const [isCourseViewModalOpen, setIsCourseViewModalOpen] = useState(false);
  const [isSectionViewModalOpen, setIsSectionViewModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    department: "",
  });
  const [activeTab, setActiveTab] = useState<"courses" | "sections">("courses");
  const [courseForm] = Form.useForm();
  const [sectionForm] = Form.useForm();
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, sectionsData, instructorsData] = await Promise.all([
        courseService.getAllCourses(),
        sectionService.getAllSections(),
        getClearingOfficersAsInstructors(),
      ]);

      // console.log(
      //   `Loaded ${coursesData?.length || 0} courses and ${
      //     sectionsData?.length || 0
      //   } sections`
      // );

      // Ensure all courses have required fields
      const coursesWithDefaults = (coursesData || []).map(
        (
          course: Partial<Course> & {
            createdAt?: string;
            updatedAt?: string;
            dateCreated?: string;
            dateUpdated?: string;
          }
        ) => ({
          ...course,
          // normalize to frontend Course type
          dateCreated:
            course.dateCreated || course.createdAt || new Date().toISOString(),
          dateUpdated:
            course.dateUpdated || course.updatedAt || new Date().toISOString(),
        })
      ) as Course[];

      setCourses(coursesWithDefaults);

      // Ensure all sections have required/safe fields even if API shape differs
      type BackendSection = {
        id: string;
        sectionCode: string;
        sectionName: string;
        courseId?: string;
        course?: Course;
        maxCapacity?: number;
        // flat schedule shape from backend
        day?: string;
        timeStart?: string;
        timeEnd?: string;
        room?: string;
        // or normalized schedule array
        schedule?: Section["schedule"];
        currentEnrollment?: number;
        semesterId?: string;
        // additional loose backend fields
        instructor?: string;
        semester?: string;
        department?: string;
        createdAt?: string;
        updatedAt?: string;
        dateCreated?: string;
        dateUpdated?: string;
      };

      const sectionsWithDefaults = (
        (sectionsData as BackendSection[] | undefined) || []
      ).map((section: BackendSection) => {
        const hasFlatSchedule = Boolean(
          section.day && section.timeStart && section.timeEnd
        );

        const derivedSchedule: Section["schedule"] = Array.isArray(
          section.schedule
        )
          ? section.schedule || []
          : hasFlatSchedule
          ? [
              {
                day:
                  (section.day as Section["schedule"][number]["day"]) ||
                  "Monday",
                startTime: section.timeStart || "00:00",
                endTime: section.timeEnd || "00:00",
                room: section.room,
              },
            ]
          : [];

        const firstSchedule = derivedSchedule[0] || undefined;

        const normalizedCourse: Course | undefined = section.course
          ? section.course
          : section.courseId
          ? {
              id: section.courseId,
              courseCode: "-",
              courseName: "-",
              description: "",
              units: 0,
              department: "",
              prerequisites: [],
              dateCreated: new Date().toISOString(),
              dateUpdated: new Date().toISOString(),
            }
          : undefined;

        const normalized: Omit<Section, "semesterId"> & {
          semester: string;
          _firstDay?: Section["schedule"][number]["day"];
          _firstStart?: string;
          _firstEnd?: string;
          _firstRoom?: string;
          _instructorName?: string;
          _semesterName?: string;
          _department?: string;
        } = {
          id: section.id,
          sectionCode: section.sectionCode,
          sectionName: section.sectionName,
          courseId: section.courseId || normalizedCourse?.id || "",
          course: (normalizedCourse || ({} as Course)) as Course,
          instructor: undefined,
          schedule: derivedSchedule,
          maxCapacity: Number(section.maxCapacity ?? 0),
          currentEnrollment: Number(section.currentEnrollment ?? 0),
          department:
            (section as unknown as { department?: string }).department ||
            normalizedCourse?.department ||
            "",
          semester:
            (section as unknown as { semester?: string; semesterId?: string })
              .semester ||
            (section as unknown as { semesterId?: string }).semesterId ||
            "",
          status:
            (section as unknown as { status?: "Open" | "Closed" | "Cancelled" })
              .status || "Open",
          dateCreated:
            section.dateCreated ||
            section.createdAt ||
            new Date().toISOString(),
          dateUpdated:
            section.dateUpdated ||
            section.updatedAt ||
            new Date().toISOString(),
          _firstDay: firstSchedule?.day,
          _firstStart: firstSchedule?.startTime,
          _firstEnd: firstSchedule?.endTime,
          _firstRoom: firstSchedule?.room,
          _instructorName: section.instructor,
          _semesterName: section.semester,
          _department:
            (section as unknown as { department?: string }).department ||
            normalizedCourse?.department,
        };

        return normalized;
      });

      setSections(sectionsWithDefaults as unknown as Section[]);
      setInstructors(instructorsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load courses and sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter courses based on search and filters - show all by default
  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      !searchText ||
      course.courseCode.toLowerCase().includes(searchText.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilters =
      !filters.department || course.department === filters.department;

    return matchesSearch && matchesFilters;
  });

  // Debug: Show counts
  // console.log(
  //   `Displaying ${filteredCourses?.length || 0} of ${
  //     courses?.length || 0
  //   } courses`
  // );

  // Filter sections based on search and filters - show all by default
  const filteredSections = (sections || []).filter((section) => {
    const matchesSearch =
      !searchText ||
      section.sectionCode.toLowerCase().includes(searchText.toLowerCase()) ||
      section.sectionName.toLowerCase().includes(searchText.toLowerCase()) ||
      section.course?.courseName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      section.course?.department
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesFilters =
      !filters.department || section?.department === filters.department;

    return matchesSearch && matchesFilters;
  });

  const handleAddCourse = () => {
    setEditingCourse(null);
    courseForm.resetFields();
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.setFieldsValue({
      ...course,
      prerequisites: course.prerequisites || [],
    });
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this course?",
      content:
        "This will also delete all associated sections. This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await courseService.deleteCourse(id);
          // Refresh data to ensure we have the latest from server
          await fetchData();
          message.success("Course deleted successfully");
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error("Failed to delete course. Please try again.");
        }
      },
    });
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.resetFields();
    setIsSectionModalOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    sectionForm.setFieldsValue({
      ...section,
      courseId: section.courseId,
      department: section.department || section.course?.department || "",
      instructor: (section as unknown as { _instructorName?: string })
        ? (section as unknown as { _instructorName?: string })._instructorName
        : section.instructor?.name,
      semester: (section as unknown as { _semesterName?: string })
        ? (section as unknown as { _semesterName?: string })._semesterName
        : undefined,
      day: section.schedule?.[0]?.day,
      timeStart: section.schedule?.[0]?.startTime,
      timeEnd: section.schedule?.[0]?.endTime,
      room: section.schedule?.[0]?.room,
    });
    setIsSectionModalOpen(true);
  };

  const handleViewCourse = (course: Course) => {
    setViewingCourse(course);
    setIsCourseViewModalOpen(true);
  };

  const handleViewSection = (section: Section) => {
    setViewingSection(section);
    setIsSectionViewModalOpen(true);
  };

  const handleDeleteSection = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this section?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await sectionService.deleteSection(id);
          // Refresh data to ensure we have the latest from server
          await fetchData();
          message.success("Section deleted successfully");
        } catch (error) {
          console.error("Error deleting section:", error);
          message.error("Failed to delete section. Please try again.");
        }
      },
    });
  };

  const handleCourseModalOk = async () => {
    try {
      setCourseLoading(true);
      const values = await courseForm.validateFields();

      // console.log("Form values:", values);

      if (editingCourse) {
        // Update existing course - only send allowed fields
        const updateData: Partial<CreateCourseForm> = {
          courseCode: values.courseCode,
          courseName: values.courseName,
          description: values.description || "",
          units: Number(values.units),
          department: values.department,
          prerequisites: values.prerequisites || [],
        };
        await courseService.updateCourse(editingCourse.id, updateData);
        // Refresh data to ensure we have the latest from server
        await fetchData();
        message.success("Course updated successfully");
      } else {
        // Create new course
        // const courseData: CreateCourseForm = {
        //   courseCode: values.courseCode,
        //   courseName: values.courseName,
        //   description: values.description || "",
        //   units: Number(values.units),
        //   department: values.department,
        //   prerequisites: values.prerequisites || [],
        // };

        // console.log("Sending course data:", courseData);
        // const newCourse = await courseService.createCourse(courseData);
        // console.log("Received new course:", newCourse);

        // Refresh data to ensure we have the latest from server
        await fetchData();
        message.success("Course created successfully");
      }

      setIsCourseModalOpen(false);
      courseForm.resetFields();
    } catch (error) {
      console.error("Error saving course:", error);

      // Check if it's an axios error with response
      if (error instanceof AxiosError) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.message ||
            "Invalid course data. Please check all required fields.";
          message.error(errorMessage);
        } else {
          message.error("Failed to save course. Please try again.");
        }
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setCourseLoading(false);
    }
  };

  const handleSectionModalOk = async () => {
    try {
      setSectionLoading(true);
      const values = await sectionForm.validateFields();

      const { day, timeStart, timeEnd, room, ...restValues } = values;
      const schedule = [
        {
          day,
          startTime: timeStart,
          endTime: timeEnd,
          room,
        },
      ];

      if (editingSection) {
        // Update existing section
        const sectionData: Partial<CreateSectionForm> & {
          instructor?: string;
          semester?: string;
        } = {
          sectionCode: restValues.sectionCode,
          sectionName: restValues.sectionName,
          courseId: restValues.courseId,
          department: restValues.department,
          // backend accepts plain instructor name
          instructor: restValues.instructor,
          schedule,
          maxCapacity: Number(restValues.maxCapacity),
          // backend accepts human-readable semester name
          semester: restValues.semester,
        };
        await sectionService.updateSection(editingSection.id, sectionData);
        // Refresh data to ensure we have the latest from server
        await fetchData();
        message.success("Section updated successfully");
      } else {
        // Create new section
        // const sectionData: Omit<
        //   CreateSectionForm,
        //   "semesterId" | "instructorId"
        // > & {
        //   instructor?: string;
        //   semester?: string;
        // } = {
        //   sectionCode: restValues.sectionCode,
        //   sectionName: restValues.sectionName,
        //   courseId: restValues.courseId,
        //   department: restValues.department,
        //   // backend accepts plain instructor name
        //   instructor: restValues.instructor,
        //   schedule,
        //   maxCapacity: Number(restValues.maxCapacity),
        //   // backend accepts human-readable semester name
        //   semester: restValues.semester,
        // };

        // console.log("Sending section data:", sectionData);
        // const newSection = await sectionService.createSection(
        //   sectionData as unknown as CreateSectionForm & {
        //     instructor?: string;
        //     semester?: string;
        //   }
        // );
        // console.log("Received new section:", newSection);

        // Refresh data to ensure we have the latest from server
        await fetchData();
        message.success("Section created successfully");
      }

      setIsSectionModalOpen(false);
      sectionForm.resetFields();
    } catch (error) {
      console.error("Error saving section:", error);

      // Enhanced error handling for sections
      if (error instanceof AxiosError) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.message ||
            "Invalid section data. Please check all required fields.";
          message.error(errorMessage);
        } else {
          message.error("Failed to save section. Please try again.");
        }
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSectionLoading(false);
    }
  };

  const courseColumns: ColumnsType<Course> = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Space>
          <BookOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{record.courseCode}</div>
            <div className="text-sm text-gray-500">{record.courseName}</div>
          </div>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <div className="max-w-xs truncate" title={description}>
          {description || "No description"}
        </div>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units: number) => <Badge count={units} showZero color="blue" />,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string) => <Tag color="green">{department}</Tag>,
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Prerequisites",
      dataIndex: "prerequisites",
      key: "prerequisites",
      render: (prerequisites?: string[]) => {
        if (!prerequisites || prerequisites.length === 0) {
          return <span className="text-gray-400">None</span>;
        }
        return (
          <Space wrap>
            {prerequisites.map((pid) => {
              const match = (courses || []).find((c) => c.id === pid);
              const label = match?.courseCode || pid;
              return (
                <Tag
                  key={pid}
                  title={
                    match ? `${match.courseCode} - ${match.courseName}` : pid
                  }
                >
                  {label}
                </Tag>
              );
            })}
          </Space>
        );
      },
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewCourse(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCourse(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCourse(record.id)}
          />
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
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
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => (
        <div className="text-sm">
          {(record.schedule || []).map((sched, index) => (
            <div key={index} className="text-xs">
              {sched.day} {sched.startTime}-{sched.endTime}
              {sched.room && ` (${sched.room})`}
            </div>
          ))}
        </div>
      ),
      responsive: ["lg", "xl"],
    },
    {
      title: "Instructor",
      key: "instructor",
      render: (
        _,
        record: Section & { _instructorName?: string; _semesterName?: string }
      ) => (
        <span className="text-sm">
          {record._instructorName || record.instructor?.name || "-"}
        </span>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Department",
      key: "department",
      render: (_, record: Section) => (
        <Tag color="green">
          {record.department || record.course?.department || "-"}
        </Tag>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Semester",
      key: "semester",
      render: (
        _,
        record: Section & {
          _instructorName?: string;
          _semesterName?: string;
          semester?: string;
        }
      ) => (
        <span className="text-sm">
          {record._semesterName || record.semester || "-"}
        </span>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Max Capacity",
      dataIndex: "maxCapacity",
      key: "maxCapacity",
      render: (maxCapacity: number) => (
        <div className="text-center">{Number(maxCapacity || 0)}</div>
      ),
      responsive: ["md", "lg", "xl"],
    },
    // removed status column for sections; backend has no status field
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSection(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditSection(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSection(record.id)}
          />
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
            <BookOutlined className="text-green-600" />
            Course Management
          </h1>
          <p className="text-gray-500 mt-2">
            Create and manage courses and sections
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<SearchOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={
              activeTab === "courses" ? handleAddCourse : handleAddSection
            }
          >
            Add {activeTab === "courses" ? "Course" : "Section"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center text-sm text-gray-500 mb-4"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li>
              <span
                className={
                  activeTab === "courses"
                    ? "text-blue-700 font-semibold flex items-center gap-1"
                    : "cursor-pointer hover:text-blue-600 flex items-center gap-1"
                }
                onClick={() => setActiveTab("courses")}
                style={{ userSelect: "none" }}
                role="button"
                aria-current={activeTab === "courses" ? "page" : undefined}
              >
                Courses <span className="ml-1">({courses?.length || 0})</span>
              </span>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span
                className={
                  activeTab === "sections"
                    ? "text-blue-700 font-semibold flex items-center gap-1"
                    : "cursor-pointer hover:text-blue-600 flex items-center gap-1"
                }
                onClick={() => setActiveTab("sections")}
                style={{ userSelect: "none" }}
                role="button"
                aria-current={activeTab === "sections" ? "page" : undefined}
              >
                Sections <span className="ml-1">({sections?.length || 0})</span>
              </span>
            </li>
          </ol>
        </nav>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder={`Search ${activeTab}...`}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              placeholder="Department"
              className="w-full"
              value={filters.department}
              onChange={(value) =>
                setFilters({ ...filters, department: value })
              }
              allowClear
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Button
              onClick={() => {
                setSearchText("");
                setFilters({ department: "" });
              }}
              disabled={!searchText && !filters.department}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
        <Card>
          <div className="text-center">
            <Badge count={courses?.length || 0} showZero color="blue" />
            <div className="text-sm text-gray-600 mt-1">Total Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge count={sections?.length || 0} showZero color="purple" />
            <div className="text-sm text-gray-600 mt-1">Total Sections</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          {activeTab === "courses" ? (
            <Table
              columns={courseColumns}
              dataSource={filteredCourses}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} courses`,
              }}
            />
          ) : (
            <Table
              columns={sectionColumns}
              dataSource={filteredSections}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} sections`,
              }}
            />
          )}
        </Spin>
      </Card>

      {/* Add/Edit Course Modal */}
      <Modal
        title={editingCourse ? "Edit Course" : "Add New Course"}
        open={isCourseModalOpen}
        onCancel={() => {
          setIsCourseModalOpen(false);
          courseForm.resetFields();
        }}
        onOk={handleCourseModalOk}
        okText={editingCourse ? "Update Course" : "Add Course"}
        confirmLoading={courseLoading}
        width={600}
      >
        <Form form={courseForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="courseCode"
              label="Course Code"
              rules={[{ required: true, message: "Please enter course code" }]}
            >
              <Input placeholder="e.g., CS101" />
            </Form.Item>
            <Form.Item
              name="units"
              label="Units"
              rules={[
                { required: true, message: "Please enter number of units" },
              ]}
            >
              <InputNumber min={1} max={6} className="w-full" placeholder="3" />
            </Form.Item>
          </div>
          <Form.Item
            name="courseName"
            label="Course Name"
            rules={[{ required: true, message: "Please enter course name" }]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter course description (optional)"
            />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select placeholder="Select department">
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="prerequisites" label="Prerequisites">
              <Select
                mode="multiple"
                placeholder="Select prerequisite courses"
                allowClear
              >
                {courses?.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add/Edit Section Modal */}
      <Modal
        title={editingSection ? "Edit Section" : "Add New Section"}
        open={isSectionModalOpen}
        onCancel={() => {
          setIsSectionModalOpen(false);
          sectionForm.resetFields();
        }}
        onOk={handleSectionModalOk}
        okText={editingSection ? "Update Section" : "Add Section"}
        confirmLoading={sectionLoading}
        width={700}
      >
        <Form form={sectionForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="sectionCode"
              label="Section Code"
              rules={[{ required: true, message: "Please enter section code" }]}
            >
              <Select placeholder="Select section code">
                {courses?.map((course) => (
                  <Option key={course.id} value={course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="maxCapacity"
              label="Max Capacity"
              rules={[
                { required: true, message: "Please enter maximum capacity" },
              ]}
            >
              <InputNumber
                min={1}
                max={100}
                className="w-full"
                placeholder="30"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="sectionName"
            label="Section Name"
            rules={[{ required: true, message: "Please enter section name" }]}
          >
            <Input placeholder="Enter section name" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <Form.Item
              name="courseId"
              label="Course"
              rules={[{ required: true, message: "Please select course" }]}
            >
              <Select placeholder="Select course">
                {courses?.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </Option>
                ))}
              </Select>
            </Form.Item> */}

            <Form.Item
              name="semester"
              label="Semester"
              rules={[{ required: true, message: "Please enter semester" }]}
            >
              <Select placeholder="Select semester">
                {semesters.map((semester) => (
                  <Option key={semester.id} value={semester.semesterName}>
                    {semester.semesterName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="instructor" label="Instructor (Optional)">
            <Select placeholder="Select instructor">
              {instructors.map((instructor) => (
                <Option key={instructor.id} value={instructor.name}>
                  {instructor.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* --- New Schedule Inputs --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Form.Item
              name="day"
              label="Day"
              rules={[{ required: true, message: "Please select a day" }]}
            >
              <Select placeholder="Select day">
                <Option value="Monday">Monday</Option>
                <Option value="Tuesday">Tuesday</Option>
                <Option value="Wednesday">Wednesday</Option>
                <Option value="Thursday">Thursday</Option>
                <Option value="Friday">Friday</Option>
                <Option value="Saturday">Saturday</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="timeStart"
              label="Time Start"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <Input type="time" />
            </Form.Item>

            <Form.Item
              name="timeEnd"
              label="Time End"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <Input type="time" />
            </Form.Item>

            <Form.Item
              name="room"
              label="Room"
              rules={[{ required: true, message: "Please enter room name" }]}
            >
              <Input placeholder="e.g., Lab 201" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* View Course Modal */}
      <Modal
        title="Course Details"
        open={isCourseViewModalOpen}
        onCancel={() => {
          setIsCourseViewModalOpen(false);
          setViewingCourse(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsCourseViewModalOpen(false);
              setViewingCourse(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {viewingCourse && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-blue-100 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                    Course Code
                  </label>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {viewingCourse.courseCode}
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                      Units
                    </label>
                    <div className="text-base">
                      <Badge
                        count={viewingCourse.units}
                        showZero
                        color="blue"
                        className="text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Name Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Course Name
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {viewingCourse.courseName}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                Description
              </label>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-h-[60px]">
                {viewingCourse.description || (
                  <span className="italic text-gray-400 dark:text-gray-500">
                    No description provided
                  </span>
                )}
              </div>
            </div>

            {/* Department & Prerequisites Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <label className="block text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                  Department
                </label>
                <div>
                  <Tag color="green" className="text-sm font-medium">
                    {viewingCourse.department}
                  </Tag>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                <label className="block text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
                  Prerequisites
                </label>
                <div className="min-h-[40px] flex items-center">
                  {viewingCourse.prerequisites &&
                  viewingCourse.prerequisites.length > 0 ? (
                    <Space wrap>
                      {viewingCourse.prerequisites.map((pid) => {
                        const match = courses.find((c) => c.id === pid);
                        const label = match?.courseCode || pid;
                        return (
                          <Tag
                            key={pid}
                            color="orange"
                            title={
                              match
                                ? `${match.courseCode} - ${match.courseName}`
                                : pid
                            }
                            className="font-medium"
                          >
                            {label}
                          </Tag>
                        );
                      })}
                    </Space>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      No prerequisites required
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    📅 Date Created
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(viewingCourse.dateCreated).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    🔄 Last Updated
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(viewingCourse.dateUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Section Modal */}
      <Modal
        title="Section Details"
        open={isSectionViewModalOpen}
        onCancel={() => {
          setIsSectionViewModalOpen(false);
          setViewingSection(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsSectionViewModalOpen(false);
              setViewingSection(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={700}
      >
        {viewingSection && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-purple-100 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                    Section Code
                  </label>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {viewingSection.sectionCode}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                    Section Name
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {viewingSection.sectionName}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Information Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
                📚 Course Information
              </label>
              <div>
                {viewingSection.course ? (
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {viewingSection.course.courseCode}
                    </div>
                    <div className="text-base text-gray-700 dark:text-gray-300">
                      {viewingSection.course.courseName}
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        Units:
                      </span>
                      <Badge
                        count={viewingSection.course.units}
                        showZero
                        color="blue"
                        size="small"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    No course information available
                  </span>
                )}
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <label className="block text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                  🏢 Department
                </label>
                <div>
                  <Tag color="green" className="text-sm font-medium">
                    {viewingSection.department ||
                      viewingSection.course?.department ||
                      "Not specified"}
                  </Tag>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                  📅 Semester
                </label>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {(
                    viewingSection as Section & {
                      _semesterName?: string;
                      semester?: string;
                    }
                  )._semesterName ||
                    (
                      viewingSection as Section & {
                        _semesterName?: string;
                        semester?: string;
                      }
                    ).semester ||
                    "Not specified"}
                </div>
              </div>
            </div>

            {/* Instructor Section */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">
                👨‍🏫 Instructor
              </label>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                {(viewingSection as Section & { _instructorName?: string })
                  ._instructorName ||
                  viewingSection.instructor?.name || (
                    <span className="italic text-gray-400 dark:text-gray-500">
                      Not assigned
                    </span>
                  )}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
              <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-3">
                🕒 Schedule
              </label>
              <div>
                {viewingSection.schedule &&
                viewingSection.schedule.length > 0 ? (
                  <div className="space-y-3">
                    {viewingSection.schedule.map((sched, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-700 rounded-md p-3 border border-cyan-100 dark:border-cyan-800"
                      >
                        <div className="flex items-center space-x-3 text-sm">
                          <Tag color="blue" className="font-medium">
                            {sched.day}
                          </Tag>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {sched.startTime} - {sched.endTime}
                          </span>
                          {sched.room && (
                            <Tag color="orange" className="font-medium">
                              {sched.room}
                            </Tag>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    No schedule information available
                  </span>
                )}
              </div>
            </div>

            {/* Enrollment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                  👥 Max Capacity
                </label>
                <div className="text-base">
                  <Badge
                    count={viewingSection.maxCapacity || 0}
                    showZero
                    color="purple"
                    className="text-lg"
                  />
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
                  ✅ Current Enrollment
                </label>
                <div className="text-base">
                  <Badge
                    count={viewingSection.currentEnrollment || 0}
                    showZero
                    color="green"
                    className="text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    📅 Date Created
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(viewingSection.dateCreated).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    🔄 Last Updated
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(viewingSection.dateUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseManagement;
