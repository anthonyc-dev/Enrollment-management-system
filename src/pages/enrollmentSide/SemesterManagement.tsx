import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Select,
  Space,
  Form,
  message,
  Tag,
  Input,
  Row,
  Col,
  DatePicker,
  Divider,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { type ColumnsType } from "antd/es/table";
import type { Semester, CreateSemesterForm } from "../../types/enrollment";
import { semesterService } from "../../api/semesterService";

const { Option } = Select;
const { Title, Text } = Typography;

const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [viewSemester, setViewSemester] = useState<Semester | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  const semesterTypes = [
    { value: "FIRST", label: "First Semester" },
    { value: "SECOND", label: "Second Semester" },
    { value: "SUMMER", label: "Summer Semester" },
  ];
  const statuses: Semester["status"][] = ["inactive", "active", "completed"];

  // Generate academic year options (current year - 2 to current year + 5)
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 5; i++) {
    academicYearOptions.push({
      value: `${i}–${i + 1}`,
      label: `${i}–${i + 1}`,
    });
  }

  const loadSemesters = async () => {
    try {
      setLoading(true);
      const data = await semesterService.getAllSemesters();
      // console.log("Loaded semesters:", data); // Debug log
      // console.log("First semester data:", data[0]); // Debug log

      // Validate semester data and IDs
      const validSemesters = Array.isArray(data)
        ? data.filter((semester, index) => {
            if (
              !semester.id ||
              semester.id === "" ||
              semester.id === "undefined"
            ) {
              console.warn(
                `Semester at index ${index} has invalid ID:`,
                semester
              );
              return false;
            }
            return true;
          })
        : [];

      // console.log("Valid semesters after filtering:", validSemesters); // Debug log
      setSemesters(validSemesters);

      // if (data && data.length > 0) {
      //   message.success(`Successfully loaded ${data.length} semester(s)`);
      // }
    } catch (error: unknown) {
      console.error("Failed to load semesters", error);

      // More specific error messages
      if (error && typeof error === "object") {
        if ("response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            message.warning(
              "No semesters found. Create your first semester to get started."
            );
          } else if (axiosError.response?.status === 500) {
            message.error("Server error. Please try again later.");
          } else {
            message.error(
              "Failed to load semesters. Please check your connection and try again."
            );
          }
        } else if ("code" in error) {
          const networkError = error as { code?: string };
          if (networkError.code === "NETWORK_ERROR" || !navigator.onLine) {
            message.error(
              "Network error. Please check your internet connection."
            );
          } else {
            message.error(
              "Failed to load semesters. Please check your connection and try again."
            );
          }
        } else {
          message.error(
            "Failed to load semesters. Please check your connection and try again."
          );
        }
      } else {
        message.error(
          "Failed to load semesters. Please check your connection and try again."
        );
      }

      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSemesters();
  }, []);

  // Effect to populate form fields when editing a semester
  useEffect(() => {
    if (isModalOpen && editingSemester) {
      // Parse existing date strings for DatePicker
      const parseSemesterDuration = (duration: string) => {
        // Try to extract dates from format like "June 2025 – October 2025"
        const parts = duration.split("–").map((part) => part.trim());
        if (parts.length === 2) {
          try {
            const startDate = dayjs(parts[0], "MMMM YYYY");
            const endDate = dayjs(parts[1], "MMMM YYYY");
            if (startDate.isValid() && endDate.isValid()) {
              return [startDate, endDate];
            }
          } catch {
            console.warn("Could not parse semester duration:", duration);
          }
        }
        return null;
      };

      const parseEnrollmentPeriod = (period: string) => {
        // Try to extract dates from format like "May 1 – June 15, 2025"
        const parts = period.split("–").map((part) => part.trim());
        if (parts.length === 2) {
          try {
            // Handle formats like "May 1, 2025" or "May 1"
            let startPart = parts[0];
            const endPart = parts[1];

            // If year is only in the end part, add it to start part
            if (!startPart.includes(",") && endPart.includes(",")) {
              const year = endPart.split(",")[1].trim();
              startPart = `${startPart}, ${year}`;
            }

            const startDate = dayjs(startPart, ["MMMM D, YYYY", "MMM D, YYYY"]);
            const endDate = dayjs(endPart, ["MMMM D, YYYY", "MMM D, YYYY"]);

            if (startDate.isValid() && endDate.isValid()) {
              return [startDate, endDate];
            }
          } catch {
            console.warn("Could not parse enrollment period:", period);
          }
        }
        return null;
      };

      // Set form values after modal is rendered
      setTimeout(() => {
        form.setFieldsValue({
          semesterName: editingSemester.semesterName,
          academicYear: editingSemester.academicYear,
          semesterType: editingSemester.semesterType,
          semesterDuration: parseSemesterDuration(
            editingSemester.semesterDuration || ""
          ),
          enrollmentPeriod: parseEnrollmentPeriod(
            editingSemester.enrollmentPeriod || ""
          ),
        });
      }, 0);
    }
  }, [isModalOpen, editingSemester, form]);

  // Helper function to generate semester name
  const generateSemesterName = (academicYear: string, semesterType: string) => {
    const typeMap = {
      FIRST: "1st Semester",
      SECOND: "2nd Semester",
      SUMMER: "Summer Semester",
    };
    return `${
      typeMap[semesterType as keyof typeof typeMap]
    } AY ${academicYear}`;
  };

  const handleAddSemester = () => {
    setEditingSemester(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditSemester = (semester: Semester) => {
    setEditingSemester(semester);
    setIsModalOpen(true);
  };

  const handleViewSemester = (semester: Semester) => {
    setViewSemester(semester);
  };

  const handleDeleteSemester = (semester: Semester) => {
    const { id, semesterName, status } = semester;

    // Prevent deletion of active semesters
    if (status === "active") {
      message.warning(
        "Cannot delete active semester. Please change status first."
      );
      return;
    }

    Modal.confirm({
      title: `Delete Semester: ${semesterName}`,
      content: (
        <div>
          <p>Are you sure you want to delete this semester?</p>
          <p>
            <strong>Semester:</strong> {semesterName}
          </p>
          <p>
            <strong>Academic Year:</strong> {semester.academicYear}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <br />
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            ⚠️ This action cannot be undone and may affect existing enrollments.
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      width: 500,
      async onOk() {
        try {
          // console.log("Deleting semester:", id); // Debug log

          const loadingMessage = message.loading(
            `Deleting ${semesterName}...`,
            0
          );

          await semesterService.deleteSemester(id);
          await loadSemesters();

          loadingMessage();
          message.success(`${semesterName} deleted successfully`);
        } catch (error) {
          console.error("Failed to delete semester", error);
          message.error(`Failed to delete ${semesterName}. Please try again.`);
        }
      },
    });
  };

  const handleStatusChange = async (
    semesterId: string,
    newStatus: Semester["status"],
    semesterName: string
  ) => {
    try {
      // console.log("Updating semester status:", {
      //   semesterId,
      //   newStatus,
      //   semesterName,
      // }); // Debug log

      // Check if semesterId is valid
      if (!semesterId || semesterId === "undefined") {
        message.error(
          "Invalid semester ID. Please refresh the page and try again."
        );
        return;
      }

      // Show loading message
      const loadingMessage = message.loading(
        `Updating ${semesterName} status to ${newStatus}...`,
        0
      );

      await semesterService.updateSemester(semesterId, { status: newStatus });
      await loadSemesters();

      loadingMessage();
      message.success(
        `${semesterName} status updated to ${newStatus} successfully`
      );
    } catch (error) {
      console.error("Failed to update semester status", error);
      message.error(
        `Failed to update ${semesterName} status. Please try again.`
      );
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (newStatus: Semester["status"]) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select semesters to update");
      return;
    }

    const selectedSemesters = semesters.filter((s) =>
      selectedRowKeys.includes(s.id)
    );
    const activeSemesters = selectedSemesters.filter(
      (s) => s.status === "active"
    );

    if (newStatus !== "active" && activeSemesters.length > 0) {
      message.warning(
        `Cannot change status of ${activeSemesters.length} active semester(s). Please change them individually.`
      );
      return;
    }

    try {
      const loadingMessage = message.loading(
        `Updating ${selectedRowKeys.length} semester(s) status to ${newStatus}...`,
        0
      );

      const updatePromises = selectedRowKeys.map((id) =>
        semesterService.updateSemester(id as string, { status: newStatus })
      );

      await Promise.all(updatePromises);
      await loadSemesters();
      setSelectedRowKeys([]);

      loadingMessage();
      message.success(
        `${selectedRowKeys.length} semester(s) status updated to ${newStatus} successfully`
      );
    } catch (error) {
      console.error("Failed to update bulk status", error);
      message.error("Failed to update selected semesters. Please try again.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select semesters to delete");
      return;
    }

    const selectedSemesters = semesters.filter((s) =>
      selectedRowKeys.includes(s.id)
    );
    const activeSemesters = selectedSemesters.filter(
      (s) => s.status === "active"
    );

    if (activeSemesters.length > 0) {
      message.warning(
        `Cannot delete ${activeSemesters.length} active semester(s). Please change their status first.`
      );
      return;
    }

    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} Semester(s)`,
      content: (
        <div>
          <p>Are you sure you want to delete the selected semesters?</p>
          <ul style={{ maxHeight: "200px", overflowY: "auto" }}>
            {selectedSemesters.map((semester) => (
              <li key={semester.id}>
                <strong>{semester.semesterName}</strong> (
                {semester.academicYear}) - {semester.status}
              </li>
            ))}
          </ul>
          <br />
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            ⚠️ This action cannot be undone and may affect existing enrollments.
          </p>
        </div>
      ),
      okText: "Yes, Delete All",
      okType: "danger",
      cancelText: "Cancel",
      width: 600,
      async onOk() {
        try {
          const loadingMessage = message.loading(
            `Deleting ${selectedRowKeys.length} semester(s)...`,
            0
          );

          const deletePromises = selectedRowKeys.map((id) =>
            semesterService.deleteSemester(id as string)
          );

          await Promise.all(deletePromises);
          await loadSemesters();
          setSelectedRowKeys([]);

          loadingMessage();
          message.success(
            `${selectedRowKeys.length} semester(s) deleted successfully`
          );
        } catch (error) {
          console.error("Failed to delete bulk semesters", error);
          message.error(
            "Failed to delete selected semesters. Please try again."
          );
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();

      // console.log("Form values:", values); // Debug log
      // console.log("Editing semester:", editingSemester); // Debug log

      // Format date ranges back to strings
      const formatSemesterDuration = (
        dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
      ) => {
        if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
          const [start, end] = dateRange;
          return `${start.format("MMMM YYYY")} – ${end.format("MMMM YYYY")}`;
        }
        return "";
      };

      const formatEnrollmentPeriod = (
        dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
      ) => {
        if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
          const [start, end] = dateRange;
          return `${start.format("MMMM D")} – ${end.format("MMMM D, YYYY")}`;
        }
        return "";
      };

      const payload: CreateSemesterForm = {
        semesterName: values.semesterName?.trim() || "",
        academicYear: values.academicYear?.trim() || "",
        semesterType: values.semesterType || "FIRST",
        semesterDuration: formatSemesterDuration(values.semesterDuration),
        enrollmentPeriod: formatEnrollmentPeriod(values.enrollmentPeriod),
      };

      // console.log("Submitting semester data:", payload); // Debug log

      // Validate required fields
      if (
        !payload.semesterName ||
        !payload.academicYear ||
        !payload.semesterType ||
        !payload.semesterDuration ||
        !payload.enrollmentPeriod
      ) {
        message.error("Please fill in all required fields.");
        return;
      }

      if (editingSemester) {
        // console.log("Update operation - Semester ID:", editingSemester.id); // Debug log

        // Validate semester ID before update
        if (
          !editingSemester.id ||
          editingSemester.id === "undefined" ||
          editingSemester.id === ""
        ) {
          // console.error("Invalid semester ID for update:", editingSemester.id);
          message.error(
            "Invalid semester ID. Please refresh the page and try again."
          );
          return;
        }

        await semesterService.updateSemester(editingSemester.id, payload);
        message.success("Semester updated successfully");
      } else {
        // Create operation - removed console.log for security
        await semesterService.createSemester(payload);
        message.success("Semester created successfully");
      }

      await loadSemesters();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error(
        "Create/Update semester failed or validation issue:",
        error
      );

      // Enhanced error handling
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
        };
        if (axiosError.response?.status === 400) {
          message.error(
            "Invalid data provided. Please check all fields and try again."
          );
        } else if (axiosError.response?.status === 409) {
          message.error("A semester with similar details already exists.");
        } else {
          message.error(
            editingSemester
              ? "Failed to update semester. Please try again."
              : "Failed to create semester. Please try again."
          );
        }
      } else if (error instanceof Error) {
        message.error(`Validation error: ${error.message}`);
      } else {
        message.error(
          editingSemester
            ? "Failed to update semester. Please try again."
            : "Failed to create semester. Please try again."
        );
      }
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "blue";
      case "completed":
        return "gray";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircleOutlined />;
      case "inactive":
        return <CalendarOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const columns: ColumnsType<Semester> = [
    {
      title: "Semester",
      key: "semester",
      render: (_, record) => (
        <Space>
          <CalendarOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{record.semesterName}</div>
            <div className="text-sm text-gray-500">{record.academicYear}</div>
          </div>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Type",
      dataIndex: "semesterType",
      key: "semesterType",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.semesterDuration}</div>
        </div>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Enrollment Period",
      key: "enrollmentPeriod",
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.enrollmentPeriod}</div>
        </div>
      ),
      responsive: ["lg", "xl"],
    },
    {
      title: "Status",
      key: "statusActions",
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Tag
            color={getStatusColor(record.status)}
            icon={getStatusIcon(record.status)}
          >
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Tag>
          <Select
            value={record.status}
            onChange={(value) => {
              // console.log("Status change triggered:", {
              //   recordId: record.id,
              //   recordData: record,
              //   newValue: value,
              // });
              handleStatusChange(
                record.id,
                value as Semester["status"],
                record.semesterName
              );
            }}
            size="small"
            style={{ width: 120 }}
            placeholder="Change status"
          >
            {statuses.map((status, index) => (
              <Option key={`${status}-${index}`} value={status}>
                <span className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </Option>
            ))}
          </Select>
        </div>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSemester(record)}
            title="View Details"
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditSemester(record)}
            title="Edit Semester"
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSemester(record)}
            disabled={record.status === "active"}
            title={
              record.status === "active"
                ? "Cannot delete active semester"
                : "Delete Semester"
            }
            size="small"
          />
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  // Statistics
  const activeSemester = semesters.find((s) => s.status === "active");
  const upcomingSemesters = semesters.filter((s) => s.status === "inactive");
  const completedSemesters = semesters.filter((s) => s.status === "completed");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
            <CalendarOutlined className="text-purple-600" />
            Semester Management
          </h1>
          <p className="text-gray-500 mt-2">
            Create and manage academic semesters
          </p>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadSemesters}
            loading={loading}
          >
            Refresh
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Select
                placeholder="Bulk Status Change"
                value={undefined}
                onChange={handleBulkStatusChange}
                style={{ width: 150 }}
                size="small"
              >
                <Option key="bulk-inactive" value="inactive">
                  <StopOutlined /> Set to Inactive
                </Option>
                <Option key="bulk-completed" value="completed">
                  <CheckCircleOutlined /> Set to Completed
                </Option>
              </Select>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                size="small"
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSemester}
          >
            Create Semester
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {semesters.length}
            </div>
            <div className="text-sm text-gray-600">Total Semesters</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {activeSemester ? 1 : 0}
            </div>
            <div className="text-sm text-gray-600">Active Semester</div>
            {activeSemester && (
              <div className="text-xs text-gray-500 mt-1">
                {activeSemester.semesterName}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {upcomingSemesters.length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {completedSemesters.length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
      </div>

      {/* Current Semester Info */}
      {activeSemester && (
        <Card
          className="mb-6"
          style={{ border: "2px solid #52c41a", marginBottom: "20px" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Current Active Semester
              </h3>
              <div className="space-y-1">
                <div>
                  <strong>{activeSemester.semesterName}</strong>
                </div>
                <div className="text-gray-600">
                  {activeSemester.semesterType} • {activeSemester.academicYear}
                </div>
                <div className="text-sm text-gray-500">
                  {activeSemester.semesterDuration}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Tag
                color="green"
                icon={<PlayCircleOutlined />}
                className="text-lg px-3 py-1"
              >
                Active
              </Tag>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="mt-6">
        <Table
          columns={columns}
          dataSource={semesters || []}
          rowKey="id"
          scroll={{ x: "max-content" }}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === "active",
              name: record.semesterName,
            }),
          }}
          locale={{
            emptyText:
              semesters.length === 0 && !loading
                ? "No semesters found. Click 'Create Semester' to add your first semester."
                : "No data",
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} semesters`,
          }}
        />
      </Card>

      {/* Add/Edit Semester Modal */}
      <Modal
        title={editingSemester ? "Edit Semester" : "Create New Semester"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleModalOk}
        okText={editingSemester ? "Update Semester" : "Create Semester"}
        confirmLoading={modalLoading}
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="semesterName"
            label="Semester Name"
            rules={[
              { required: true, message: "Please enter semester name" },
              {
                min: 3,
                message: "Semester name must be at least 3 characters",
              },
              {
                max: 100,
                message: "Semester name must be less than 100 characters",
              },
            ]}
          >
            <Input placeholder="e.g., 1st Semester AY 2025–2026" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label="Academic Year"
                rules={[
                  { required: true, message: "Please select academic year" },
                ]}
              >
                <Select
                  placeholder="Select academic year"
                  showSearch
                  onChange={(value) => {
                    const semesterType = form.getFieldValue("semesterType");
                    if (value && semesterType) {
                      const generatedName = generateSemesterName(
                        value,
                        semesterType
                      );
                      // Use setTimeout to prevent circular reference
                      setTimeout(() => {
                        form.setFieldValue("semesterName", generatedName);
                      }, 0);
                    }
                  }}
                >
                  {academicYearOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semesterType"
                label="Semester Type"
                rules={[
                  { required: true, message: "Please select semester type" },
                ]}
              >
                <Select
                  placeholder="Select semester type"
                  onChange={(value) => {
                    const academicYear = form.getFieldValue("academicYear");
                    if (value && academicYear) {
                      const generatedName = generateSemesterName(
                        academicYear,
                        value
                      );
                      // Use setTimeout to prevent circular reference
                      setTimeout(() => {
                        form.setFieldValue("semesterName", generatedName);
                      }, 0);
                    }
                  }}
                >
                  {semesterTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="semesterDuration"
            label="Semester Duration"
            rules={[
              { required: true, message: "Please select semester duration" },
            ]}
          >
            <DatePicker.RangePicker
              picker="month"
              format="MMMM YYYY"
              placeholder={["Start Month", "End Month"]}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="enrollmentPeriod"
            label="Enrollment Period"
            rules={[
              { required: true, message: "Please select enrollment period" },
            ]}
          >
            <DatePicker.RangePicker
              format="MMMM D, YYYY"
              placeholder={["Start Date", "End Date"]}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Enhanced View Semester Modal - Dark Theme Optimized */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <EyeOutlined className="text-blue-400" />
            <Title level={4} className="mb-0 text-slate-100">
              Semester Details
            </Title>
          </div>
        }
        open={!!viewSemester}
        onCancel={() => setViewSemester(null)}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (viewSemester) {
                handleEditSemester(viewSemester);
                setViewSemester(null);
              }
            }}
          >
            Edit Semester
          </Button>,
          <Button key="close" onClick={() => setViewSemester(null)}>
            Close
          </Button>,
        ]}
        width={700}
        className="semester-view-modal"
      >
        {viewSemester && (
          <div className="space-y-6">
            {/* Header Card with Status - Dark Theme Friendly */}
            <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full border border-blue-400/30">
                    <CalendarOutlined className="text-blue-300 text-xl" />
                  </div>
                  <div>
                    <Title level={3} className="mb-1 text-slate-100">
                      {viewSemester.semesterName}
                    </Title>
                    <Text className="text-slate-300 text-lg">
                      {viewSemester.academicYear}
                    </Text>
                  </div>
                </div>
                <div className="text-right">
                  <Tag
                    color={getStatusColor(viewSemester.status)}
                    icon={getStatusIcon(viewSemester.status)}
                    className="text-lg px-4 py-2 font-medium"
                  >
                    {viewSemester.status.charAt(0).toUpperCase() +
                      viewSemester.status.slice(1)}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Main Information Grid - Dark Theme Optimized */}
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <BookOutlined className="text-purple-400" />
                      <span className="text-slate-200">
                        Academic Information
                      </span>
                    </div>
                  }
                  className="h-full bg-slate-800 border-slate-600"
                  styles={{
                    header: {
                      backgroundColor: "#1e293b",
                      borderBottom: "1px solid #475569",
                      color: "#e2e8f0",
                    },
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <InfoCircleOutlined className="text-blue-400" />
                      <div>
                        <Text strong className="block text-slate-200">
                          Semester Type
                        </Text>
                        <Tag color="blue" className="mt-1">
                          {viewSemester.semesterType}
                        </Tag>
                      </div>
                    </div>
                    <Divider className="my-3 border-slate-600" />
                    <div className="flex items-center gap-3">
                      <UserOutlined className="text-green-400" />
                      <div>
                        <Text strong className="block text-slate-200">
                          Academic Year
                        </Text>
                        <Text className="text-slate-300 text-base">
                          {viewSemester.academicYear}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-orange-400" />
                      <span className="text-slate-200">
                        Timeline Information
                      </span>
                    </div>
                  }
                  className="h-full bg-slate-800 border-slate-600"
                  styles={{
                    header: {
                      backgroundColor: "#1e293b",
                      borderBottom: "1px solid #475569",
                      color: "#e2e8f0",
                    },
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarOutlined className="text-blue-400 mt-1" />
                      <div>
                        <Text strong className="block text-slate-200">
                          Semester Duration
                        </Text>
                        <Text className="text-slate-300 text-base">
                          {viewSemester.semesterDuration || "Not specified"}
                        </Text>
                      </div>
                    </div>
                    <Divider className="my-3 border-slate-600" />
                    <div className="flex items-start gap-3">
                      <FieldTimeOutlined className="text-green-400 mt-1" />
                      <div>
                        <Text strong className="block text-slate-200">
                          Enrollment Period
                        </Text>
                        <Text className="text-slate-300 text-base">
                          {viewSemester.enrollmentPeriod || "Not specified"}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* System Information - Dark Theme Optimized */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <InfoCircleOutlined className="text-slate-400" />
                  <span className="text-slate-200">System Information</span>
                </div>
              }
              className="bg-slate-800 border-slate-600"
              styles={{
                header: {
                  backgroundColor: "#1e293b",
                  borderBottom: "1px solid #475569",
                  color: "#e2e8f0",
                },
              }}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-full border border-green-400/30">
                      <PlusOutlined className="text-green-300" />
                    </div>
                    <div>
                      <Text strong className="block text-slate-200">
                        Created
                      </Text>
                      <Text className="text-slate-300">
                        {new Date(viewSemester.dateCreated).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full border border-blue-400/30">
                      <EditOutlined className="text-blue-300" />
                    </div>
                    <div>
                      <Text strong className="block text-slate-200">
                        Last Updated
                      </Text>
                      <Text className="text-slate-300">
                        {new Date(viewSemester.dateUpdated).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SemesterManagement;
