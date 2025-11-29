import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

const HeaderStep = ({ icon, title, subtitle }) => {
  return (
    <div style={{ textAlign: "center" }}>
      {React.cloneElement(icon, {
        style: {
          ...icon.props.style,
          fontSize: 32,
          color: icon.props.style?.color || "#1890ff",
          marginBottom: 8,
        },
      })}
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>
      <Text type="secondary">{subtitle}</Text>
    </div>
  );
};

export default HeaderStep;
