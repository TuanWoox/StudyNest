import React from "react";
import { Card, Space, Divider } from "antd";
import { Note } from "@/types/note/notes";
import type { CreateQuizDTO } from "@/types/quiz/createQuizDTO";
import { SelectedNotePreview, QuizConfigSummary } from "../components";

interface ReviewPanelProps {
  selectedNote?: Note;
  quizOptions?: CreateQuizDTO;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  selectedNote,
  quizOptions,
}) => {
  return (
    <div style={{ margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={28} style={{ width: "100%" }}>
          <SelectedNotePreview selectedNote={selectedNote} />

          <Divider style={{ margin: 0 }} />

          {quizOptions && <QuizConfigSummary quizOptions={quizOptions} />}
        </Space>
      </Card>
    </div>
  );
};
