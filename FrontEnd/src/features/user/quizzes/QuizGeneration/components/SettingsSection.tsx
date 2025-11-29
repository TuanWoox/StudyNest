import { Space, Typography } from "antd";
const { Text, Title } = Typography;

const SettingsSection = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string; // The '?' makes this prop optional
  children: React.ReactNode;
}) => (
  <div>
    <Space
      align="center"
      style={{ width: "100%", justifyContent: "space-between" }}
    >
      <div>
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 4,
            fontFamily: "monospace",
            fontWeight: 700,
          }}
        >
          {title}
        </Title>
        {/* This now only renders the Text component if a subtitle is actually provided */}
        {subtitle && (
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            {subtitle}
          </Text>
        )}
      </div>
      {icon}
    </Space>
    <div style={{ marginTop: 12 }}>{children}</div>
  </div>
);

export default SettingsSection;
