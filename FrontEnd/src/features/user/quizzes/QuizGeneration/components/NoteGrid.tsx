import React from "react";
import { Row, Col, Spin } from "antd";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Note } from "@/types/note/notes";
import type { FormInstance } from "antd";
import NoteCard from "@/features/user/notes/Notes/components/NoteCard";
import { useNavigate } from "react-router-dom";

interface NoteGridProps {
  notes: Note[];
  isLoading: boolean;
  selectedNoteId?: string;
  form: FormInstance;
  onSelectNote: (noteId: string) => void;
}

export const NoteGrid: React.FC<NoteGridProps> = ({
  notes,
  isLoading,
  selectedNoteId,
  form,
  onSelectNote,
}) => {
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        type="empty"
        title="No Notes Yet"
        description="No notes found. Please create a note first."
        actionLabel="Create Note Now"
        onAction={() => navigate(`/user/notes`)}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {notes.map((note) => {
        const isSelected = note.id === selectedNoteId;

        return (
          <Col xs={24} md={12} key={note.id}>
            <NoteCard
              note={note}
              isSelected={isSelected}
              onSelect={() => {
                onSelectNote(note.id);
                form.setFieldsValue({ noteId: note.id });
              }}
              isDeleteAvailable={false}
            />
          </Col>
        );
      })}
    </Row>
  );
};
