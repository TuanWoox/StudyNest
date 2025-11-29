import { Badge, Card, InputNumber, Typography, theme } from "antd";
const { Text } = Typography;
const { useToken } = theme;

const QuestionTypeCard = ({ config, count, percentage, max, onChange }) => {
  const { token } = useToken();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <Card
      hoverable
      style={{
        textAlign: "center",
        borderRadius: 0,
        border: borderColor,
        background: count > 0 ? config.bg : token.colorBgContainer,
        boxShadow: shadowColor,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 40,
            fontWeight: "bold",
            color: config.color,
            marginBottom: 4,
            fontFamily: "monospace",
          }}
        >
          {count}
        </div>
        <Text strong style={{ fontSize: 16, fontFamily: "monospace" }}>
          {config.title}
        </Text>
        <div style={{ marginTop: 4 }}>
          <Badge
            count={`${Math.round(percentage)}%`}
            style={{ backgroundColor: config.color, fontFamily: "monospace" }}
          />
        </div>
      </div>
      <InputNumber
        min={0}
        max={max}
        value={count}
        onChange={onChange}
        style={{ width: "100%", fontFamily: "monospace" }}
        size="large"
      />
    </Card>
  );
};

export default QuestionTypeCard;
