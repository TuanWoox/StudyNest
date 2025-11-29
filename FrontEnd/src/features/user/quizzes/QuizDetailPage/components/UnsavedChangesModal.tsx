import React from "react";
import { Modal, Space, Typography, theme } from "antd";
import { WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

interface UnsavedChangesModalProps {
  open: boolean;
  onDiscard: () => void;
  onContinue: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  open,
  onDiscard,
  onContinue,
}) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined
            style={{ color: token.colorWarning, fontSize: 20 }}
          />
          <span
            style={{ fontWeight: 600, fontSize: 16, fontFamily: "monospace" }}
          >
            Unsaved Changes
          </span>
        </Space>
      }
      open={open}
      onOk={onDiscard}
      onCancel={onContinue}
      okText="Discard Changes"
      cancelText="Continue Editing"
      okButtonProps={{
        danger: true,
        size: "large",
        style: { fontWeight: 500, fontFamily: "monospace", borderRadius: 0 },
      }}
      cancelButtonProps={{
        size: "large",
        style: { fontFamily: "monospace", borderRadius: 0 },
      }}
      centered
      width={isMobile ? 340 : 450}
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
      <div style={{ paddingTop: token.paddingSM }}>
        <p
          style={{
            fontSize: isMobile ? 14 : 15,
            marginBottom: token.marginSM,
            fontFamily: "monospace",
          }}
        >
          You have unsaved changes that will be lost.
        </p>
        <Text
          type="secondary"
          style={{ fontSize: isMobile ? 14 : 15, fontFamily: "monospace" }}
        >
          Do you want to discard your changes or continue editing?
        </Text>
      </div>
    </Modal>
  );
};
