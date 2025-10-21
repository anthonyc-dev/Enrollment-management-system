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
  TimePicker,
} from "antd";
import dayjs from "dayjs";
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
import { courseService } from "../../api/courseService";
import type { Course, CreateCourseForm } from "../../types/enrollment";
import { departments } from "@/data/subData";

const { Option } = Select;
const { TextArea } = Input;

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [isCourseViewModalOpen, setIsCourseViewModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    department: "",
  });
  const [courseForm] = Form.useForm();

  // Fetch courses data
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching courses from API...");
      const coursesData = await courseService.getAllCourses();

      console.log(`Loaded ${coursesData?.length || 0} courses`);
      console.log("Raw courses data:", coursesData);

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

      console.log("Processed courses:", coursesWithDefaults);
      setCourses(coursesWithDefaults);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter courses based on search and filters
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

  console.log(
    `Displaying ${filteredCourses?.length || 0} of ${
      courses?.length || 0
    } courses`
  );

  const handleAddCourse = () => {
    setEditingCourse(null);
    courseForm.resetFields();
    // Set default values for new course
    setTimeout(() => {
      courseForm.setFieldsValue({
        units: 3,
        maxCapacity: 30,
        day: "Monday",
        semester: "1st Semester",
        yearLevel: "1st Year",
      });
    }, 0);
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.setFieldsValue({
      ...course,
      prerequisites: course.prerequisites || [],
      maxCapacity: course.maxCapacity || 30,
      day: course.day || "Monday",
      timeStart: course.timeStart ? dayjs(course.timeStart, "HH:mm A") : null,
      timeEnd: course.timeEnd ? dayjs(course.timeEnd, "HH:mm A") : null,
      room: course.room || "",
      instructor: course.instructor || "",
      semester: course.semester || "1st Semester",
      yearLevel: course.yearLevel || "1st Year",
    });
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this course?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await courseService.deleteCourse(id);
          await fetchData();
          message.success("Course deleted successfully");
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error("Failed to delete course. Please try again.");
        }
      },
    });
  };

  const handleViewCourse = (course: Course) => {
    setViewingCourse(course);
    setIsCourseViewModalOpen(true);
  };

  const handleCourseModalOk = async () => {
    try {
      setCourseLoading(true);
      const values = await courseForm.validateFields();

      console.log("Form values:", values);

      // Validate time fields
      if (values.timeStart && values.timeEnd) {
        const startTime = dayjs(values.timeStart);
        const endTime = dayjs(values.timeEnd);
        if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
          message.error("Start time must be before end time");
          return;
        }
      }

      if (editingCourse) {
        // Update existing course
        const updateData: Partial<CreateCourseForm> = {
          courseCode: values.courseCode?.trim(),
          courseName: values.courseName?.trim(),
          description: values.description?.trim() || "",
          units: Number(values.units),
          department: values.department,
          prerequisites: Array.isArray(values.prerequisites)
            ? values.prerequisites
            : [],
          // Section-specific fields
          maxCapacity: Number(values.maxCapacity) || 30,
          day: values.day,
          timeStart: values.timeStart
            ? dayjs(values.timeStart).format("hh:mm A")
            : "",
          timeEnd: values.timeEnd
            ? dayjs(values.timeEnd).format("hh:mm A")
            : "",
          room: values.room?.trim() || "",
          instructor: values.instructor?.trim() || "",
          semester: values.semester,
          yearLevel: values.yearLevel,
        };
        console.log("Updating course with data:", updateData);
        await courseService.updateCourse(editingCourse.id, updateData);
        await fetchData();
        message.success(`Course ${updateData.courseCode} updated successfully`);
      } else {
        // Create new course
        const courseData: CreateCourseForm = {
          courseCode: values.courseCode?.trim(),
          courseName: values.courseName?.trim(),
          description: values.description?.trim() || "",
          units: Number(values.units),
          department: values.department,
          prerequisites: Array.isArray(values.prerequisites)
            ? values.prerequisites
            : [],
          // Section-specific fields
          maxCapacity: Number(values.maxCapacity) || 30,
          day: values.day || "Monday",
          timeStart: values.timeStart
            ? dayjs(values.timeStart).format("hh:mm A")
            : "08:00 AM",
          timeEnd: values.timeEnd
            ? dayjs(values.timeEnd).format("hh:mm A")
            : "10:00 AM",
          room: values.room?.trim() || "",
          instructor: values.instructor?.trim() || "",
          semester: values.semester || "1st Semester",
          yearLevel: values.yearLevel || "1st Year",
        };

        console.log("Creating course with data:", courseData);
        const result = await courseService.createCourse(courseData);
        console.log("Course creation result:", result);

        // Verify the course was created
        if (result && result.id) {
          console.log("Course created successfully with ID:", result.id);
          await fetchData();
          message.success(
            `Course ${courseData.courseCode} created successfully`
          );
        } else {
          console.error("Course creation failed - no ID returned:", result);
          message.error("Course creation failed - please check the data");
          return;
        }
      }

      setIsCourseModalOpen(false);
      courseForm.resetFields();
    } catch (error) {
      console.error("Error saving course:", error);

      if (error instanceof AxiosError) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.message ||
            "Invalid course data. Please check all required fields.";
          message.error(errorMessage);
        } else if (error.response?.status === 409) {
          message.error(
            "Course code already exists. Please use a different code."
          );
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
                  color="orange"
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
      responsive: ["lg", "xl"],
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => {
        if (!record.day || !record.timeStart || !record.timeEnd) {
          return <span className="text-gray-400">Not scheduled</span>;
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{record.day}</div>
            <div className="text-gray-500">
              {record.timeStart} - {record.timeEnd}
            </div>
            {record.room && (
              <div className="text-xs text-blue-600">Room: {record.room}</div>
            )}
          </div>
        );
      },
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      render: (instructor: string) => (
        <span className="text-sm">
          {instructor || <span className="text-gray-400">Not assigned</span>}
        </span>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      render: (semester: string) => (
        <Tag color="purple">{semester || "Not specified"}</Tag>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Max Capacity",
      dataIndex: "maxCapacity",
      key: "maxCapacity",
      render: (maxCapacity: number) => (
        <Badge count={maxCapacity || 0} showZero color="orange" />
      ),
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
            <BookOutlined className="text-green-600" />
            Course Management
          </h1>
          <p className="text-gray-500 mt-2">Create and manage courses</p>
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
            onClick={handleAddCourse}
          >
            Add Course
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search courses..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
        <Card>
          <div className="text-center">
            <Badge count={courses?.length || 0} showZero color="blue" />
            <div className="text-sm text-gray-600 mt-1">Total Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={filteredCourses?.length || 0}
              showZero
              color="green"
            />
            <div className="text-sm text-gray-600 mt-1">Filtered Courses</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
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

          {/* Section-Specific Fields */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-700">
              Schedule & Capacity
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Option value="Sunday">Sunday</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="timeStart"
                label="Start Time"
                rules={[
                  { required: true, message: "Please select start time" },
                ]}
              >
                <TimePicker
                  format="hh:mm A"
                  use12Hours
                  placeholder="Select start time"
                  className="w-full"
                  minuteStep={15}
                  showNow={false}
                />
              </Form.Item>
              <Form.Item
                name="timeEnd"
                label="End Time"
                rules={[{ required: true, message: "Please select end time" }]}
              >
                <TimePicker
                  format="hh:mm A"
                  use12Hours
                  placeholder="Select end time"
                  className="w-full"
                  minuteStep={15}
                  showNow={false}
                />
              </Form.Item>
              <Form.Item name="room" label="Room">
                <Input placeholder="e.g., Lab 201" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item name="instructor" label="Instructor">
                <Input placeholder="Instructor name" />
              </Form.Item>
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: "Please select semester" }]}
              >
                <Select placeholder="Select semester">
                  <Option value="1st Semester">1st Semester</Option>
                  <Option value="2nd Semester">2nd Semester</Option>
                  <Option value="Summer">Summer</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="yearLevel"
                label="Year Level"
                rules={[
                  { required: true, message: "Please select year level" },
                ]}
              >
                <Select placeholder="Select year level">
                  <Option value="1st Year">1st Year</Option>
                  <Option value="2nd Year">2nd Year</Option>
                  <Option value="3rd Year">3rd Year</Option>
                  <Option value="4th Year">4th Year</Option>
                </Select>
              </Form.Item>
            </div>
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
        width={800}
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

            {/* Schedule & Capacity Section */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
              <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-3">
                🕒 Schedule & Capacity
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Day:
                      </span>
                      <Tag color="blue" className="font-medium">
                        {viewingCourse.day || "Not scheduled"}
                      </Tag>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Time:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {viewingCourse.timeStart && viewingCourse.timeEnd
                          ? `${viewingCourse.timeStart} - ${viewingCourse.timeEnd}`
                          : "Not scheduled"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Room:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {viewingCourse.room || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Max Capacity:
                      </span>
                      <Badge
                        count={viewingCourse.maxCapacity || 0}
                        showZero
                        color="orange"
                        size="small"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Instructor:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {viewingCourse.instructor || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                  📅 Semester
                </label>
                <div>
                  <Tag color="purple" className="text-sm font-medium">
                    {viewingCourse.semester || "Not specified"}
                  </Tag>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                  🎓 Year Level
                </label>
                <div>
                  <Tag color="indigo" className="text-sm font-medium">
                    {viewingCourse.yearLevel || "Not specified"}
                  </Tag>
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
    </div>
  );
};

export default CourseManagement;
