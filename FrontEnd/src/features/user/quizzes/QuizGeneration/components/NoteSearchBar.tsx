import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface NoteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const NoteSearchBar: React.FC<NoteSearchBarProps> = ({
  value,
  onChange,
}) => {
  return (
    <Input
      allowClear
      size="large"
      placeholder="Search by title or tag (e.g., React, DB)"
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", fontFamily: "monospace" }}
    />
  );
};
