import React from "react";
import { Card, Typography, theme } from "antd";
import { Note } from "@/types/note/notes";
import NoteCard from "@/features/user/notes/Notes/components/NoteCard";

const { Title, Text } = Typography;
const { useToken } = theme;

interface SelectedNotePreviewProps {
  selectedNote?: Note;
}

export const SelectedNotePreview: React.FC<SelectedNotePreviewProps> = ({
  selectedNote,
}) => {
  const { token } = useToken();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <div>
      <Title level={4} style={{ fontFamily: "monospace", fontWeight: 700 }}>
        Selected Note
      </Title>
      <Text
        type="secondary"
        style={{
          display: "block",
          marginBottom: 16,
          fontFamily: "monospace",
        }}
      >
        The source material for your quiz
      </Text>
      {selectedNote ? (
        <NoteCard
          note={selectedNote}
          isSelected={true}
          onSelect={() => {}}
          isDeleteAvailable={false}
        />
      ) : (
        <Card
          style={{
            textAlign: "center",
            padding: 24,
            borderRadius: 0,
            border: borderColor,
            boxShadow: shadowColor,
          }}
        >
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            No note selected.
          </Text>
        </Card>
      )}
    </div>
  );
};
