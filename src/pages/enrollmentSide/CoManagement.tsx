import React, { useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import { PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import OfficerTable from "@/components/clearing-officer/OfficerTable";
import OfficerForm from "@/components/clearing-officer/OfficerForm";
import ConfirmDialog from "@/components/common/officer/ConfirmDialog";
import { clearingOfficerService } from "@/api/clearingOfficerService";
import type { ClearingOfficer } from "@/types/enrollment";

const ClearingOfficerManagement: React.FC = () => {
  const [officers, setOfficers] = useState<ClearingOfficer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<ClearingOfficer[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedOfficer, setSelectedOfficer] =
    useState<ClearingOfficer | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClearingOfficer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  /** 🔹 Fetch all clearing officers from API */
  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const data = await clearingOfficerService.getAll();
      setOfficers(data);
      setFilteredOfficers(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch clearing officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  /** 🔹 Filter officers based on search */
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = officers.filter(
      (officer) =>
        officer.firstName.toLowerCase().includes(term) ||
        officer.lastName.toLowerCase().includes(term) ||
        (officer.department?.toLowerCase().includes(term) ?? false) ||
        (officer.email?.toLowerCase().includes(term) ?? false)
    );
    setFilteredOfficers(filtered);
  }, [searchTerm, officers]);

  /** 🔹 Handle form submission (create or update) */
  const handleSubmit = async (
    values: Omit<ClearingOfficer, "id" | "createdAt" | "password" | "role">
  ) => {
    try {
      console.log("Submitting officer data:", values);

      if (selectedOfficer) {
        await clearingOfficerService.update(selectedOfficer.id, values);
        message.success("Officer updated successfully");
      } else {
        const result = await clearingOfficerService.create(values);
        console.log("Created officer:", result);
        message.success("Officer added successfully");
      }
      setFormVisible(false);
      setSelectedOfficer(null);
      fetchOfficers();
    } catch (error: unknown) {
      console.error("Error details:", error);
      const errorObj = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      console.error("Error response:", errorObj.response?.data);
      console.error("Error status:", errorObj.response?.status);

      const errorMessage =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "Failed to save officer";
      message.error(`Error: ${errorMessage}`);
    }
  };

  /** 🔹 Handle officer deletion */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await clearingOfficerService.delete(deleteTarget.id);
      message.success("Officer deleted successfully");
      setConfirmVisible(false);
      fetchOfficers();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete officer");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-300 flex items-center gap-3">
            <UserOutlined className="text-blue-600" />
            Clearing Officer Management
          </h1>
          <p className="text-gray-500 mt-2">
            Add, edit, and manage clearing officer accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search officer..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedOfficer(null);
              setFormVisible(true);
            }}
          >
            Add Officer
          </Button>
        </div>
      </div>

      {/* Officer Table */}
      <OfficerTable
        data={filteredOfficers}
        loading={loading}
        onEdit={(record) => {
          setSelectedOfficer(record);
          setFormVisible(true);
        }}
        onDelete={(record) => {
          setDeleteTarget(record);
          setConfirmVisible(true);
        }}
      />

      {/* Officer Form (Add / Edit) */}
      <OfficerForm
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedOfficer(null);
        }}
        onSubmit={handleSubmit}
        initialValues={selectedOfficer ?? undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmVisible}
        title="Delete Officer"
        content={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}?`
            : ""
        }
        onOk={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
};

export default ClearingOfficerManagement;
