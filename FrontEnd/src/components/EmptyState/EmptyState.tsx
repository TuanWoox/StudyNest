import React from "react";
import { Button, Space, Typography, theme, Grid } from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { useToken } = theme;

export interface EmptyStateProps {
  type?: "empty" | "error" | "info" | "warning";
  title?: string;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionType?: "primary" | "default" | "dashed";
  actionDanger?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  extra?: React.ReactNode;
  hideIcon?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "empty",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionIcon,
  actionType = "primary",
  actionDanger = false,
  secondaryActionLabel,
  onSecondaryAction,
  extra,
  hideIcon = false,
}) => {
  const { token } = useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !!screens.xs;

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  // Get default icon based on type
  const getDefaultIcon = () => {
    const iconSize = isMobile ? 48 : 64;
    const iconStyle = { fontSize: iconSize };

    switch (type) {
      case "error":
        return (
          <WarningOutlined
            style={{ ...iconStyle, color: token.colorError }}
          />
        );
      case "info":
        return (
          <InfoCircleOutlined
            style={{ ...iconStyle, color: token.colorInfo }}
          />
        );
      case "warning":
        return (
          <ExclamationCircleOutlined
            style={{ ...iconStyle, color: token.colorWarning }}
          />
        );
      case "empty":
      default:
        return (
          <InboxOutlined
            style={{ ...iconStyle, color: token.colorTextDisabled }}
          />
        );
    }
  };

  // Get button size based on screen
  const getButtonSize = () => {
    if (isMobile) return "middle";
    return "large";
  };

  // Get colors based on type
  const getTypeColors = () => {
    switch (type) {
      case "error":
        return { textColor: token.colorError, bgColor: `${token.colorError}10` };
      case "info":
        return { textColor: token.colorInfo, bgColor: `${token.colorInfo}10` };
      case "warning":
        return { textColor: token.colorWarning, bgColor: `${token.colorWarning}10` };
      case "empty":
      default:
        return { textColor: token.colorText, bgColor: token.colorBgLayout };
    }
  };

  const { textColor, bgColor } = getTypeColors();

  return (
    <div
      style={{
        padding: isMobile ? "40px 20px" : "60px 24px",
        backgroundColor: bgColor,
        borderRadius: 0,
        border: borderColor,
        boxShadow: shadowColor,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isMobile ? 300 : 400,
      }}
    >
      {!hideIcon && (
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          {icon || getDefaultIcon()}
        </div>
      )}

      <Space
        direction="vertical"
        size={isMobile ? 8 : 12}
        style={{ width: "100%", maxWidth: 500 }}
      >
        {title && (
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              fontWeight: 600,
              color: type === "error" ? token.colorError : textColor,
              fontFamily: "monospace",
            }}
          >
            {title}
          </Title>
        )}

        {description && (
          <Text
            type={type === "error" ? "danger" : "secondary"}
            style={{
              fontSize: isMobile ? 13 : 14,
              fontFamily: "monospace",
              display: "block",
            }}
          >
            {description}
          </Text>
        )}

        {(actionLabel || secondaryActionLabel || extra) && (
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            size={12}
            style={{
              marginTop: isMobile ? 16 : 24,
              width: isMobile ? "100%" : "auto",
            }}
          >
            {actionLabel && onAction && (
              <Button
                type={actionType}
                danger={actionDanger}
                icon={actionIcon}
                onClick={onAction}
                size={getButtonSize()}
                style={{
                  borderRadius: 0,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  width: isMobile ? "100%" : "auto",
                  minWidth: isMobile ? undefined : 160,
                }}
              >
                {actionLabel}
              </Button>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Button
                type="default"
                onClick={onSecondaryAction}
                size={getButtonSize()}
                style={{
                  borderRadius: 0,
                  fontFamily: "monospace",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {secondaryActionLabel}
              </Button>
            )}

            {extra}
          </Space>
        )}
      </Space>
    </div>
  );
};
