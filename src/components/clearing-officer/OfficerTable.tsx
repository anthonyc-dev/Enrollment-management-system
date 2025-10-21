import React, { useMemo } from "react";
import { Table, Space, Button, Card } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ClearingOfficer } from "@/types/enrollment";

interface OfficerTableProps {
  data: ClearingOfficer[];
  onEdit: (record: ClearingOfficer) => void;
  onDelete: (record: ClearingOfficer) => void;
  loading?: boolean;
}

const OfficerTable: React.FC<OfficerTableProps> = ({
  data,
  onEdit,
  onDelete,
  loading = false,
}) => {
  // Automatically sort data by name in ascending order
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [data]);
  const columns = [
    {
      title: "School ID",
      dataIndex: "schoolId",
      key: "schoolId",
      sorter: (a: ClearingOfficer, b: ClearingOfficer) =>
        a.schoolId.localeCompare(b.schoolId),
    },
    {
      title: "Name",
      key: "name",
      render: (record: ClearingOfficer) =>
        `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: ClearingOfficer, b: ClearingOfficer) =>
        a.email.localeCompare(b.email),
    },
    { title: "Phone", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      sorter: (a: ClearingOfficer, b: ClearingOfficer) => {
        const deptA = a.department || "";
        const deptB = b.department || "";
        return deptA.localeCompare(deptB);
      },
    },
    { title: "Position", dataIndex: "position", key: "position" },

    // { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (record: ClearingOfficer) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            type="link"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            type="link"
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Clearing Officer Management"
      style={{ marginBottom: "16px", marginTop: "16px" }}
    >
      <div style={{ overflowX: "auto" }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedData}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </div>
    </Card>
  );
};

export default OfficerTable;
