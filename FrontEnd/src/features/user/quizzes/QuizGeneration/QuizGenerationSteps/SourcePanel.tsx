import React, { useEffect, useMemo } from "react";
import { Card, Space, Typography, Divider } from "antd";
import type { FormInstance } from "antd";
import useGetAllNote from "@/hooks/noteHook/useGetAllNote";
import { NoteSearchBar, NoteGrid } from "../components";

const { Title, Text } = Typography;

interface SourcePanelProps {
  selectedNoteId?: string;
  query: string;
  form: FormInstance;
  setQuery: (query: string) => void;
  setSelectedNoteId: (id: string) => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  selectedNoteId,
  query,
  form,
  setQuery,
  setSelectedNoteId,
}) => {
  // Fetch notes from API
  const { data: notesData, isLoading } = useGetAllNote();

  // Transform and filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!notesData?.data) return [];

    const q = query.trim().toLowerCase();
    if (!q) return notesData.data;

    return notesData.data.filter((note) => {
      const inTitle = note.title.toLowerCase().includes(q);
      const inTags = note.noteTags?.some((nt) =>
        nt.tag?.name.toLowerCase().includes(q)
      );
      return inTitle || inTags;
    });
  }, [notesData, query]);

  // Keep hidden form field in sync with external selectedNoteId
  useEffect(() => {
    if (selectedNoteId) {
      form.setFieldsValue({ noteId: selectedNoteId });
    } else {
      form.resetFields(["noteId"]);
    }
  }, [selectedNoteId, form]);

  // Auto-select first note when data loads and no selection exists
  useEffect(() => {
    if (notesData?.data?.length && !selectedNoteId) {
      const firstNoteId = notesData.data[0].id;
      setSelectedNoteId(firstNoteId);
      form.setFieldsValue({ noteId: firstNoteId });
    }
  }, [notesData, selectedNoteId, form, setSelectedNoteId]);

  return (
    <div style={{ margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={28} style={{ width: "100%" }}>
          <div>
            <Title
              level={4}
              style={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              Search Notes
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 16,
                fontFamily: "monospace",
              }}
            >
              Find notes by title or tag
            </Text>
            <NoteSearchBar value={query} onChange={setQuery} />
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Notes Grid Section */}
          <div>
            <Title
              level={4}
              style={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              Available Notes
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 16,
                fontFamily: "monospace",
              }}
            >
              {filteredNotes.length > 0
                ? `${filteredNotes.length} note${
                    filteredNotes.length !== 1 ? "s" : ""
                  } found`
                : "No notes available"}
            </Text>

            <NoteGrid
              notes={filteredNotes}
              isLoading={isLoading}
              selectedNoteId={selectedNoteId}
              form={form}
              onSelectNote={setSelectedNoteId}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};
