import React, { useState } from "react";
import { Button, Space, Modal, Tooltip, theme } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { useToken } = theme;

interface QuestionActionsProps {
  questionId: string;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  isDeleting: boolean;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  questionId,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  const showDeleteModal = () => {
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(questionId);
    setIsModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Space size={isMobile ? 4 : 8}>
        <Tooltip title="Edit question" placement="top">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(questionId)}
            size={isMobile ? "small" : "middle"}
            style={{
              color: token.colorPrimary,
              borderRadius: 0,
              fontFamily: "monospace",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {!isMobile && "Edit"}
          </Button>
        </Tooltip>

        <Tooltip title="Delete question" placement="top">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={showDeleteModal}
            size={isMobile ? "small" : "middle"}
            style={{
              borderRadius: 0,
              fontFamily: "monospace",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {!isMobile && "Delete"}
          </Button>
        </Tooltip>
      </Space>

      <Modal
        title={
          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
            Delete Question
          </span>
        }
        open={isModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: isDeleting,
          size: "large",
          style: {
            fontWeight: 600,
            fontFamily: "monospace",
            borderRadius: 0,
          },
        }}
        cancelButtonProps={{
          size: "large",
          style: { fontFamily: "monospace", borderRadius: 0 },
        }}
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            padding: "16px 0",
          }}
        >
          <ExclamationCircleOutlined
            style={{
              fontSize: 24,
              color: token.colorError,
              marginTop: 4,
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              Are you sure you want to delete this question?
            </p>
            <p
              style={{
                margin: 0,
                color: token.colorTextSecondary,
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
