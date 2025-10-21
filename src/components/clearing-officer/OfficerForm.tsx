import React, { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import type { ClearingOfficer } from "@/types/enrollment";
import { departments } from "@/data/subData";

interface OfficerFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (
    values: Omit<ClearingOfficer, "id" | "createdAt" | "password" | "role">
  ) => void;
  initialValues?: ClearingOfficer | null;
}

const OfficerForm: React.FC<OfficerFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Edit Clearing Officer" : "Add Clearing Officer"}
      okText={initialValues ? "Update" : "Create"}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="schoolId"
          label="School ID"
          rules={[{ required: true, message: "Enter school ID" }]}
        >
          <Input placeholder="Enter school ID" />
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

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, type: "email", message: "Enter valid email" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[{ required: true, message: "Enter phone number" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: "Enter department" }]}
        >
          <Select placeholder="Select year level" allowClear>
            {departments.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: "Enter position" }]}
        >
          <Input placeholder="Enter position" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OfficerForm;
