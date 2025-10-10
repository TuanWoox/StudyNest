import React from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Note } from "@/types/note/notes";
import type { CreateQuizDTO } from "@/types/quiz/createQuizDTO";
import NoteCard from "@/features/user/notes/NoteSidebar/NoteCard";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { HeaderStep } from "../components";

const { Title, Text } = Typography;

interface ReviewPanelProps {
  selectedNote?: Note;
  quizOptions?: CreateQuizDTO;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  selectedNote,
  quizOptions,
}) => {
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const darkMode = useReduxSelector((state) => state.theme.mode === "dark");

  const totalQuestions =
    (quizOptions?.count_Mcq || 0) +
    (quizOptions?.count_Msq || 0) +
    (quizOptions?.count_Tf || 0);

  return (
    <div style={{ margin: "0 auto" }}>
      <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Space direction="vertical" size={28} style={{ width: "100%" }}>
          <div>
            <Title level={4}>Selected Note</Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              The source material for your quiz
            </Text>
            {selectedNote ? (
              <NoteCard
                note={selectedNote}
                darkMode={darkMode}
                isSelected={true}
                onSelect={() => { }}
                onDelete={() => { }}
              />
            ) : (
              <Card style={{ textAlign: "center", padding: 24 }}>
                <Text type="secondary">No note selected.</Text>
              </Card>
            )}
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Quiz Configuration Section */}
          {quizOptions && (
            <div>
              <Title level={4}>Quiz Configuration</Title>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                Your quiz will be generated with these settings
              </Text>

              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {/* Settings Cards */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#f0f5ff",
                        borderRadius: 8,
                        border: "1px solid #d6e4ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#1890ff",
                        }}
                      >
                        {totalQuestions}
                      </div>
                      <Text type="secondary">Total Questions</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fff7e6",
                        borderRadius: 8,
                        border: "1px solid #ffe7ba",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#faad14",
                        }}
                      >
                        {cap(quizOptions.difficulty)}
                      </div>
                      <Text type="secondary">Difficulty</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#f6ffed",
                        borderRadius: 8,
                        border: "1px solid #d9f7be",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#52c41a",
                        }}
                      >
                        {quizOptions.language}
                      </div>
                      <Text type="secondary">Language</Text>
                    </Card>
                  </Col>
                </Row>

                {/* Question Distribution */}
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    Question Distribution
                  </Text>
                  <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                    <Col xs={24} sm={8}>
                      <Card
                        size="small"
                        style={{
                          textAlign: "center",
                          background: "#e6f7ff",
                          borderRadius: 8,
                          border: "1px solid #bae7ff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          {quizOptions.count_Mcq}
                        </div>
                        <Text>Multiple Choice</Text>
                      </Card>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Card
                        size="small"
                        style={{
                          textAlign: "center",
                          background: "#f9f0ff",
                          borderRadius: 8,
                          border: "1px solid #efdbff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: "#722ed1",
                          }}
                        >
                          {quizOptions.count_Msq}
                        </div>
                        <Text>Multi-Select</Text>
                      </Card>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Card
                        size="small"
                        style={{
                          textAlign: "center",
                          background: "#f6ffed",
                          borderRadius: 8,
                          border: "1px solid #d9f7be",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: "#52c41a",
                          }}
                        >
                          {quizOptions.count_Tf}
                        </div>
                        <Text>True/False</Text>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Space>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};
