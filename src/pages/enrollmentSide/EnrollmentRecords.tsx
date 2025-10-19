import React, { useState } from "react";
import {
  Card,
  Button,
  Input,
  Table,
  Modal,
  Select,
  Space,
  message,
  Tag,
  Badge,
  Form,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";
import { enrollmentDummyData } from "../../data/enrollmentDummyData";
import type { EnrollmentRecord } from "../../types/enrollment";

const { Option } = Select;
// const { RangePicker } = DatePicker;

const EnrollmentRecords: React.FC = () => {
  const [records, setRecords] = useState(enrollmentDummyData.enrollmentRecords);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    semesterId: "",
    status: "",
    department: "",
    yearLevel: "",
  });
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnrollmentRecord | null>(
    null
  );
  const [form] = Form.useForm();

  const { semesters } = enrollmentDummyData;
  const departments = [
    "Computer Science",
    "Information Technology",
    "Computer Engineering",
    "Information Systems",
    "Software Engineering",
  ];
  const yearLevels = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ];
  const statuses = ["Enrolled", "Dropped", "Withdrawn", "Completed"];

  // Filter records based on search and filters
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchText ||
      record.student.firstName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      record.student.lastName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      record.student.studentNumber
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      record.semester.semesterName
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesFilters =
      (!filters.semesterId || record.semesterId === filters.semesterId) &&
      (!filters.status || record.status === filters.status) &&
      (!filters.department ||
        record.student.department === filters.department) &&
      (!filters.yearLevel || record.student.yearLevel === filters.yearLevel);

    return matchesSearch && matchesFilters;
  });

  const handleViewRecord = (record: EnrollmentRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: EnrollmentRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      status: record.status,
      remarks: record.enrolledSections[0]?.enrollment.remarks || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    Modal.confirm({
      title: "Delete Enrollment Record",
      content:
        "Are you sure you want to delete this enrollment record? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setRecords(records.filter((record) => record.id !== recordId));
        message.success("Enrollment record deleted successfully");
      },
    });
  };

  const handleUpdateRecord = async () => {
    try {
      const values = await form.validateFields();

      if (editingRecord) {
        const updatedRecord: EnrollmentRecord = {
          ...editingRecord,
          status: values.status,
          lastUpdated: new Date().toISOString(),
          enrolledSections: editingRecord.enrolledSections.map(
            (enrolledSection) => ({
              ...enrolledSection,
              enrollment: {
                ...enrolledSection.enrollment,
                status: values.status,
                remarks: values.remarks,
                dateUpdated: new Date().toISOString(),
              },
            })
          ),
        };

        setRecords(
          records.map((record) =>
            record.id === editingRecord.id ? updatedRecord : record
          )
        );
        message.success("Enrollment record updated successfully");
        setIsEditModalOpen(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleExportRecords = () => {
    // In a real application, this would export to CSV/Excel
    message.info("Export functionality would be implemented here");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enrolled":
        return "green";
      case "Dropped":
        return "red";
      case "Withdrawn":
        return "orange";
      case "Completed":
        return "blue";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<EnrollmentRecord> = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">
              {record.student.firstName} {record.student.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {record.student.studentNumber}
            </div>
          </div>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Department",
      dataIndex: ["student", "department"],
      key: "department",
      render: (department: string) => <Tag color="blue">{department}</Tag>,
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Year Level",
      dataIndex: ["student", "yearLevel"],
      key: "yearLevel",
      render: (yearLevel: string) => <Tag color="green">{yearLevel}</Tag>,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Semester",
      key: "semester",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.semester.semesterName}</div>
          <div className="text-sm text-gray-500">
            {record.semester.academicYear}
          </div>
        </div>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Courses Enrolled",
      key: "courses",
      render: (_, record) => (
        <div>
          <Badge
            count={record.enrolledSections.length}
            showZero
            color="purple"
          />
          <div className="text-sm text-gray-500 mt-1">
            {record.enrolledSections.map((es, index) => (
              <div key={index} className="text-xs">
                {es.section.course.courseCode}
              </div>
            ))}
          </div>
        </div>
      ),
      responsive: ["lg", "xl"],
    },
    {
      title: "Total Units",
      dataIndex: "totalUnits",
      key: "totalUnits",
      render: (units: number) => <Badge count={units} showZero color="blue" />,
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Enrollment Date",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      responsive: ["lg", "xl"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewRecord(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditRecord(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRecord(record.id)}
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
            <TeamOutlined className="text-purple-600" />
            Enrollment Records
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage all enrollment records
          </p>
        </div>
        <Button icon={<DownloadOutlined />} onClick={handleExportRecords}>
          Export Records
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Input
              placeholder="Search records..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              placeholder="Semester"
              className="w-full"
              value={filters.semesterId}
              onChange={(value) =>
                setFilters({ ...filters, semesterId: value })
              }
              allowClear
            >
              {semesters.map((semester) => (
                <Option key={semester.id} value={semester.id}>
                  {semester.semesterName}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Status"
              className="w-full"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
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
            <Select
              placeholder="Year Level"
              className="w-full"
              value={filters.yearLevel}
              onChange={(value) => setFilters({ ...filters, yearLevel: value })}
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
            <Button
              icon={<FilterOutlined />}
              onClick={() =>
                setFilters({
                  semesterId: "",
                  status: "",
                  department: "",
                  yearLevel: "",
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
            <Badge count={filteredRecords.length} showZero color="blue" />
            <div className="text-sm text-gray-600 mt-1">Total Records</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredRecords.filter((r) => r.status === "Enrolled").length
              }
              showZero
              color="green"
            />
            <div className="text-sm text-gray-600 mt-1">Active Enrollments</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredRecords.filter((r) => r.status === "Completed").length
              }
              showZero
              color="blue"
            />
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge
              count={
                filteredRecords.filter(
                  (r) => r.status === "Dropped" || r.status === "Withdrawn"
                ).length
              }
              showZero
              color="red"
            />
            <div className="text-sm text-gray-600 mt-1">Dropped/Withdrawn</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} records`,
          }}
        />
      </Card>

      {/* View Record Modal */}
      <Modal
        title="Enrollment Record Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Student Information */}
            <Card title="Student Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Name:</strong> {selectedRecord.student.firstName}{" "}
                    {selectedRecord.student.lastName}
                  </p>
                  <p>
                    <strong>Student Number:</strong>{" "}
                    {selectedRecord.student.studentNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedRecord.student.email}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedRecord.student.department}
                  </p>
                  <p>
                    <strong>Year Level:</strong>{" "}
                    {selectedRecord.student.yearLevel}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Tag color="green">{selectedRecord.student.status}</Tag>
                  </p>
                </div>
              </div>
            </Card>

            {/* Semester Information */}
            <Card title="Semester Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Semester:</strong>{" "}
                    {selectedRecord.semester.semesterName}
                  </p>
                  <p>
                    <strong>Academic Year:</strong>{" "}
                    {selectedRecord.semester.academicYear}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedRecord.semester.semesterType}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Tag color="blue">{selectedRecord.semester.status}</Tag>
                  </p>
                </div>
              </div>
            </Card>

            {/* Enrollment Details */}
            <Card title="Enrollment Details">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Total Units:</strong>
                  </span>
                  <Badge
                    count={selectedRecord.totalUnits}
                    showZero
                    color="blue"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Enrollment Status:</strong>
                  </span>
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Enrollment Date:</strong>
                  </span>
                  <span>
                    {new Date(
                      selectedRecord.enrollmentDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Last Updated:</strong>
                  </span>
                  <span>
                    {new Date(selectedRecord.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Enrolled Sections */}
            <Card title="Enrolled Sections">
              <div className="space-y-3">
                {selectedRecord.enrolledSections.map(
                  (enrolledSection, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {enrolledSection.section.sectionCode} -{" "}
                            {enrolledSection.section.course.courseName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrolledSection.section.sectionName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {enrolledSection.section.course.units} units •{" "}
                            {enrolledSection.section.course.department}
                          </div>
                        </div>
                        <div className="text-right">
                          <Tag
                            color={getStatusColor(
                              enrolledSection.enrollment.status
                            )}
                          >
                            {enrolledSection.enrollment.status}
                          </Tag>
                          <div className="text-xs text-gray-500 mt-1">
                            {enrolledSection.section.course.units} units
                          </div>
                        </div>
                      </div>
                      {enrolledSection.section.schedule && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Schedule:</strong>
                          {enrolledSection.section.schedule.map(
                            (sched, schedIndex) => (
                              <div key={schedIndex} className="text-xs">
                                {sched.day} {sched.startTime}-{sched.endTime}
                                {sched.room && ` (${sched.room})`}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {enrolledSection.section.instructor && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Instructor:</strong>{" "}
                          {enrolledSection.section.instructor.name}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Edit Record Modal */}
      <Modal
        title="Edit Enrollment Record"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
        }}
        onOk={handleUpdateRecord}
        okText="Update Record"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Enrollment Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea
              rows={3}
              placeholder="Enter any remarks (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnrollmentRecords;
