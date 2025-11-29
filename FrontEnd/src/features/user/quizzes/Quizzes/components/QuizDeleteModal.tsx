import React from "react";
import { Modal, theme } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { useToken } = theme;

interface QuizDeleteModalProps {
  visible: boolean;
  quizTitle?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const QuizDeleteModal: React.FC<QuizDeleteModalProps> = ({
  visible,
  quizTitle,
  loading,
  onConfirm,
  onCancel,
}) => {
  const { token } = useToken();
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <Modal
      title="Delete Quiz"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      confirmLoading={loading}
      centered
      styles={{
        content: {
          background: token.colorBgElevated,
          border: borderColor,
          boxShadow: shadowColor,
          fontFamily: "monospace",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ExclamationCircleOutlined
          style={{ fontSize: 24, color: token.colorError }}
        />
        <div>
          <p style={{ margin: 0, fontFamily: "monospace" }}>
            Are you sure you want to delete quiz "{quizTitle}"?
          </p>
          <p
            style={{
              margin: "8px 0 0 0",
              color: token.colorTextSecondary,
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          >
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default QuizDeleteModal;
