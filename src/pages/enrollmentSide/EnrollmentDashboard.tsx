import React, { useState } from "react";
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
import { enrollmentDummyData } from "../../data/enrollmentDummyData";
import type { EnrollmentRecord } from "../../types/enrollment";

const EnrollmentDashboard: React.FC = () => {
  const [selectedSemester] = useState<string>("semester-2");

  const { stats, enrollmentRecords, semesters, students } = enrollmentDummyData;

  const currentSemester = semesters.find((s) => s.id === selectedSemester);
  const currentSemesterRecords = enrollmentRecords.filter(
    (record) => record.semesterId === selectedSemester
  );

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
    },
    {
      title: "Department",
      dataIndex: ["student", "department"],
      key: "department",
      render: (department: string) => <Tag color="blue">{department}</Tag>,
    },
    {
      title: "Year Level",
      dataIndex: ["student", "yearLevel"],
      key: "yearLevel",
      render: (yearLevel: string) => <Tag color="green">{yearLevel}</Tag>,
    },
    {
      title: "Total Units",
      dataIndex: "totalUnits",
      key: "totalUnits",
      render: (units: number) => <Badge count={units} showZero color="blue" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Enrolled"
              ? "green"
              : status === "Dropped"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/enrollment/student/${record.studentId}`}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          <Link to={`/enrollment/student/${record.studentId}/edit`}>
            <Button size="small" icon={<EditOutlined />}>
              Edit
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-700 flex items-center gap-3">
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
            <div style={{ color: "#3f8600", fontSize: "14px" }}>
              Active: {students.filter((s) => s.status === "Active").length}
            </div>
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
            <div style={{ color: "#3f8600", fontSize: "14px" }}>
              This Semester: {currentSemesterRecords.length}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Semester Selection */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Semester</h3>
            <p className="text-gray-600">
              {currentSemester ? (
                <>
                  <span className="font-medium">
                    {currentSemester.semesterName}
                  </span>
                  <span className="ml-2 text-sm">
                    ({currentSemester.academicYear})
                  </span>
                </>
              ) : (
                "No semester selected"
              )}
            </p>
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

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6 mt-6">
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <div className="text-center">
              <UserOutlined className="text-4xl text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Student Management</h3>
              <p className="text-gray-600 mb-4">
                Add, edit, and manage student accounts
              </p>
              <Link to="/students">
                <Button type="primary" block>
                  Manage Students
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <div className="text-center">
              <BookOutlined className="text-4xl text-green-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Course Management</h3>
              <p className="text-gray-600 mb-4">
                Create and manage courses and sections
              </p>
              <Link to="/courses">
                <Button type="primary" block>
                  Manage Courses
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <div className="text-center">
              <TeamOutlined className="text-4xl text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Enrollment Records</h3>
              <p className="text-gray-600 mb-4">
                View and update enrollment records
              </p>
              <Link to="/records">
                <Button type="primary" block>
                  View Records
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Enrollments */}
      <Card title="Recent Enrollments" className="mb-6">
        <Table
          columns={columns}
          dataSource={currentSemesterRecords}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
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
