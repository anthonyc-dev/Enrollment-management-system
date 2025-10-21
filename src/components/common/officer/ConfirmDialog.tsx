import React from "react";
import { Modal } from "antd";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  content?: string;
  onOk: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  content = "Are you sure you want to continue?",
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Yes"
      cancelText="No"
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ConfirmDialog;
