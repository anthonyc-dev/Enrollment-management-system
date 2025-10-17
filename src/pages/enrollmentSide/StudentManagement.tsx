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
  DatePicker,
  message,
  Tag,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";

import dayjs from "dayjs";
import type { CreateStudentForm, Student } from "../../types/enrollment";
import axiosInstance from "../../api/axios";
import { AxiosError } from "axios";

const { Option } = Select;

const API_BASE_URL = "/student-management";

const departments = [
  "CECS", // Changed to match your reference data; add more mappings if needed
  "Computer Science",
  "Information Technology",
  "Computer Engineering",
  "Information Systems",
  "Software Engineering",
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const genders = ["Male", "Female"];
const statuses = ["Active", "Inactive", "Graduated", "Dropped"];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    yearLevel: "",
    status: "",
    gender: "",
  });
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  // Added programs field based on reference example
  const programs = [
    "BS-Computer Science",
    "BS-Information Technology",
    "BS-Computer Engineering",
    "BS-Information Systems",
    "BS-Software Engineering",
  ];

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${API_BASE_URL}/getAllStudents`
      );
      // Backend returns students directly as an array
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      message.error("Failed to fetch students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset form when modal opens for adding new student
  useEffect(() => {
    if (isModalOpen && !editingStudent) {
      form.resetFields();
    }
  }, [isModalOpen, editingStudent, form]);

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchText ||
      student.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      (student.schoolId || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilters =
      (!filters.department || student.department === filters.department) &&
      (!filters.yearLevel || student.yearLevel === filters.yearLevel) &&
      (!filters.status || student.status === filters.status) &&
      (!filters.gender || student.gender === filters.gender);

    return matchesSearch && matchesFilters;
  });

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      ...student,
      dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth) : null,
    });
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this student?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await axiosInstance.delete(`${API_BASE_URL}/deleteStudent/${id}`);
          message.success("Student deleted successfully");
          await fetchStudents();
        } catch (err) {
          console.error("Error deleting student:", err);
          message.error("Failed to delete student. Please try again.");
        }
      },
    });
  };

  // Map 'Student Number' to 'schoolId', and support required reference fields
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingStudent) {
        // Update existing student - only send fields that the backend expects
        const updatedStudent = {
          schoolId: values.schoolId,
          firstName: values.firstName,
          lastName: values.lastName,
          middleName: values.middleName,
          email: values.email,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
          gender: values.gender,
          address: values.address,
          department: values.department,
          yearLevel: values.yearLevel,
          program: values.program,
        };

        try {
          console.log("Updating student with data:", updatedStudent);
          console.log("Student ID:", editingStudent.id);

          await axiosInstance.put(
            `${API_BASE_URL}/updateStudent/${editingStudent.id}`,
            updatedStudent
          );
          message.success("Student updated successfully");
          await fetchStudents();
        } catch (axiosErr) {
          console.error("Update failed - Full error:", axiosErr);

          if (axiosErr instanceof AxiosError) {
            console.error("Response data:", axiosErr.response?.data);
            console.error("Response status:", axiosErr.response?.status);

            // Show more specific error message from backend
            if (axiosErr.response?.data?.message) {
              message.error(`Update failed: ${axiosErr.response.data.message}`);
            } else {
              message.error("Failed to update student. Please try again.");
            }
          } else {
            message.error("Failed to update student. Please try again.");
          }
          return;
        }
      } else {
        // Create new student -- match API's expected payload
        const payload: CreateStudentForm = {
          ...values,
          schoolId: values.schoolId,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : "",
        };

        try {
          await axiosInstance.post(`${API_BASE_URL}/createStudent`, payload);
          message.success("Student created successfully");
          await fetchStudents();
        } catch (axiosErr) {
          // Show more descriptive error
          if (
            axiosErr instanceof AxiosError &&
            axiosErr.response &&
            axiosErr.response.data &&
            axiosErr.response.data.message
          ) {
            message.error(
              "Failed to create student: " + axiosErr.response.data.message
            );
          } else {
            message.error("Failed to create student. Please try again.");
          }
          console.error("API call failed:", axiosErr);
          return;
        }
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingStudent(null);
    } catch (error) {
      // error is always an array from validateFields
      if (Array.isArray(error) && error.length > 0) {
        message.error("Please fix the form errors and try again.");
      } else {
        console.error("Validation failed:", error);
      }
    }
  };

  const columns: ColumnsType<Student> = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">
              {record.firstName} {record.middleName ? record.middleName : ""}{" "}
              {record.lastName}
            </div>
            <div className="text-sm text-gray-500">{record.schoolId}</div>
          </div>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MailOutlined className="text-green-500 text-xs" />
            <span className="text-sm">{record.email}</span>
          </div>
          {!!record.phone && (
            <div className="flex items-center gap-1">
              <PhoneOutlined className="text-purple-500 text-xs" />
              <span className="text-sm">{record.phone}</span>
            </div>
          )}
        </div>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string) => <Tag color="blue">{department}</Tag>,
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Year Level",
      dataIndex: "yearLevel",
      key: "yearLevel",
      render: (yearLevel: string) => <Tag color="green">{yearLevel}</Tag>,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Program",
      dataIndex: "program",
      key: "program",
      render: (program: string) =>
        program ? <Tag color="purple">{program}</Tag> : null,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Active"
              ? "green"
              : status === "Inactive"
              ? "orange"
              : status === "Graduated"
              ? "blue"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStudent(record.id)}
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
          <h1 className="text-3xl font-bold text-slate-700 flex items-center gap-3">
            <UserOutlined className="text-blue-600" />
            Student Management
          </h1>
          <p className="text-gray-500 mt-2">
            Add, edit, and manage student accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Input
              placeholder="Search students..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              placeholder="Department"
              className="w-full"
              value={filters.department || undefined}
              onChange={(value) =>
                setFilters({ ...filters, department: value || "" })
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
            <Select
              placeholder="Year Level"
              className="w-full"
              value={filters.yearLevel || undefined}
              onChange={(value) =>
                setFilters({ ...filters, yearLevel: value || "" })
              }
              allowClear
            >
              {yearLevels.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Status"
              className="w-full"
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters({ ...filters, status: value || "" })
              }
              allowClear
            >
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Gender"
              className="w-full"
              value={filters.gender || undefined}
              onChange={(value) =>
                setFilters({ ...filters, gender: value || "" })
              }
              allowClear
            >
              {genders.map((gender) => (
                <Option key={gender} value={gender}>
                  {gender}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Button
              icon={<FilterOutlined />}
              onClick={() =>
                setFilters({
                  department: "",
                  yearLevel: "",
                  status: "",
                  gender: "",
                })
              }
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
        <Card>
          <div className="text-center">
            <Badge count={filteredStudents.length} showZero color="blue" />
            <div className="text-sm text-gray-600 mt-1">Total Students</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredStudents.filter((s) => s.status === "Active").length
              }
              showZero
              color="green"
            />
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredStudents.filter((s) => s.status === "Graduated").length
              }
              showZero
              color="blue"
            />
            <div className="text-sm text-gray-600 mt-1">Graduated</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredStudents.filter((s) => s.status === "Dropped").length
              }
              showZero
              color="red"
            />
            <div className="text-sm text-gray-600 mt-1">Dropped</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey={(row) => row.id ?? row.schoolId}
          scroll={{ x: "max-content" }}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} students`,
          }}
        />
      </Card>

      {/* Add/Edit Student Modal */}
      <Modal
        title={editingStudent ? "Edit Student" : "Add New Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingStudent(null);
        }}
        onOk={handleModalOk}
        okText={editingStudent ? "Update Student" : "Add Student"}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="schoolId"
              label="Student Number"
              rules={[{ required: true, message: "Please enter school ID" }]}
            >
              <Input placeholder="e.g., 20250001" />
            </Form.Item>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
            <Form.Item name="middleName" label="Middle Name">
              <Input placeholder="Enter middle name (optional)" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Enter phone number (optional)" />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[
                { required: true, message: "Please select date of birth" },
              ]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Select placeholder="Select gender" allowClear>
                {genders.map((gender) => (
                  <Option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() +
                      gender.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input placeholder="Enter complete address" />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select placeholder="Select department" allowClear>
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="yearLevel"
              label="Year Level"
              rules={[{ required: true, message: "Please select year level" }]}
            >
              <Select placeholder="Select year level" allowClear>
                {yearLevels.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="program"
              label="Program"
              rules={[{ required: true, message: "Please select program" }]}
            >
              <Select placeholder="Select program" allowClear>
                {programs.map((program) => (
                  <Option key={program} value={program}>
                    {program}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
