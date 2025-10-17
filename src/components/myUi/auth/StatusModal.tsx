import React from "react";
import { Modal } from "antd";

interface StatusModalProps {
  isOpen: boolean;
  onOk: () => void;
  role: string;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onOk,
  role,
  successTitle,
  successMessage,
  errorTitle,
  errorMessage,
}) => {
  const isError = role === "student";

  return (
    <Modal
      title={isError ? errorTitle : successTitle}
      open={isOpen}
      onOk={onOk}
    >
      <p>{isError ? errorMessage : successMessage}</p>
    </Modal>
  );
};

export default StatusModal;
