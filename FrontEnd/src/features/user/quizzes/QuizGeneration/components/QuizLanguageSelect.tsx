import React from "react";
import { Select } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import SettingsSection from "./SettingsSection";

const { Option } = Select;

interface Language {
  value: string;
  label: string;
}

interface QuizLanguageSelectProps {
  value: string;
  languages: Language[];
  onChange: (value: string) => void;
}

export const QuizLanguageSelect: React.FC<QuizLanguageSelectProps> = ({
  value,
  languages,
  onChange,
}) => {
  return (
    <SettingsSection icon={<GlobalOutlined />} title="Language">
      <Select
        size="large"
        style={{ width: "100%", fontFamily: "monospace" }}
        value={value}
        onChange={onChange}
      >
        {languages.map((lang) => (
          <Option key={lang.value} value={lang.value}>
            {lang.label}
          </Option>
        ))}
      </Select>
    </SettingsSection>
  );
};
