import React, { useState, useEffect } from "react";
import { Card, Space, Divider, theme } from "antd";
import {
  QuestionCountSlider,
  QuestionTypeDistribution,
  QuizLanguageSelect,
  QuizDifficultySelect,
} from "../components";

const { useToken } = theme;

// --- Constants and Configuration ---
const MAX_QUESTIONS = 20;
const DEFAULT_TOTAL = 10;

const LANGUAGES = [
  { value: "English", label: "🇬🇧 English" },
  { value: "Vietnamese", label: "🇻🇳 Vietnamese" },
  { value: "Chinese", label: "🇨🇳 Chinese" },
  { value: "Russian", label: "🇷🇺 Russian" },
  { value: "Japanese", label: "🇯🇵 Japanese" },
];

interface OptionsPanelProps {
  initial: any;
  setCreateQuiz: (quiz: any) => void;
}

export function OptionsPanel({ initial, setCreateQuiz }: OptionsPanelProps) {
  const { token } = useToken();

  // Question type configuration with token colors
  const QUESTION_TYPE_CONFIG = [
    {
      key: "mcq",
      title: "Multiple Choice",
      color: token.colorPrimary,
      bg: token.colorPrimaryBg,
      border: token.colorPrimaryBorder,
    },
    {
      key: "msq",
      title: "Multi-Select",
      color: token.colorInfo,
      bg: token.colorInfoBg,
      border: token.colorInfoBorder,
    },
    {
      key: "tf",
      title: "True/False",
      color: token.colorSuccess,
      bg: token.colorSuccessBg,
      border: token.colorSuccessBorder,
    },
  ];

  // Difficulty options with token colors
  const DIFFICULTY_OPTIONS = [
    {
      value: "easy",
      label: "Easy",
      desc: "Recall & basic understanding",
      tooltip: (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 600, color: token.colorSuccess }}>Easy Level</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Direct questions from note content</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Definitions, keywords, basic concepts</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• No traps or complex reasoning</div>
        </div>
      ),
      color: token.colorSuccess,
    },
    {
      value: "medium",
      label: "Medium",
      desc: "Understanding & application",
      tooltip: (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 600, color: token.colorWarning }}>Medium Level</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Requires understanding & applying</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• One-step reasoning needed</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Reasonable distractors included</div>
        </div>
      ),
      color: token.colorWarning,
    },
    {
      value: "hard",
      label: "Hard",
      desc: "Analysis & multi-step reasoning",
      tooltip: (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 600, color: token.colorError }}>Hard Level</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Analysis & synthesis required</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Scenario-based questions</div>
          <div style={{ marginBottom: 4, fontSize: 12, color: token.colorText }}>• Similar distractors (deep understanding)</div>
        </div>
      ),
      color: token.colorError,
    },
  ];

  const initialTotal = initial.count_Mcq + initial.count_Msq + initial.count_Tf;
  const [totalQuestions, setTotalQuestions] = useState(
    initialTotal || DEFAULT_TOTAL
  );
  const [distribution, setDistribution] = useState(() => {
    if (initialTotal === 0) return { mcq: 30, msq: 40, tf: 30 };
    return {
      mcq: (initial.count_Mcq / initialTotal) * 100,
      msq: (initial.count_Msq / initialTotal) * 100,
      tf: (initial.count_Tf / initialTotal) * 100,
    };
  });

  useEffect(() => {
    const mcqCount = Math.round((distribution.mcq / 100) * totalQuestions);
    const msqCount = Math.round((distribution.msq / 100) * totalQuestions);
    const tfCount = Math.max(0, totalQuestions - mcqCount - msqCount);
    setCreateQuiz((prev) => ({
      ...prev,
      count_Mcq: mcqCount,
      count_Msq: msqCount,
      count_Tf: tfCount,
    }));
  }, [distribution, totalQuestions, setCreateQuiz]);

  const updateDistribution = (type: string, value: number) => {
    // This complex logic remains unchanged as it's core to the functionality
    const diff = value - distribution[type];
    const otherTypes = Object.keys(distribution).filter((t) => t !== type);
    const otherTotal = otherTypes.reduce((sum, t) => sum + distribution[t], 0);
    const newDistribution = { ...distribution, [type]: value };
    if (otherTotal > 0) {
      otherTypes.forEach((t) => {
        const ratio = distribution[t] / otherTotal;
        newDistribution[t] = Math.max(0, distribution[t] - diff * ratio);
      });
    }
    const newTotal = Object.values(newDistribution).reduce(
      (sum, val) => sum + val,
      0
    );
    if (newTotal !== 100) {
      const scaleFactor = 100 / newTotal;
      Object.keys(newDistribution).forEach((k) => {
        newDistribution[k] *= scaleFactor;
      });
    }
    setDistribution(newDistribution);
  };

  const onCountChange = (type: string, val: number) => {
    const count = Math.max(0, Math.min(val ?? 0, totalQuestions));
    const percentage = (count / totalQuestions) * 100;
    updateDistribution(type, percentage);
  };

  const handleStateChange = (key: string, value: any) => {
    setCreateQuiz((prev: any) => ({ ...prev, [key]: value }));
  };

  // Prepare counts for question type distribution
  const questionCounts = {
    mcq: initial.count_Mcq,
    msq: initial.count_Msq,
    tf: initial.count_Tf,
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={28} style={{ width: "100%" }}>
          <QuestionCountSlider
            value={totalQuestions}
            max={MAX_QUESTIONS}
            onChange={setTotalQuestions}
          />

          <QuestionTypeDistribution
            configs={QUESTION_TYPE_CONFIG}
            counts={questionCounts}
            distribution={distribution}
            totalQuestions={totalQuestions}
            onChange={onCountChange}
          />

          <Divider style={{ margin: 0 }} />

          <QuizLanguageSelect
            value={initial.language}
            languages={LANGUAGES}
            onChange={(value) => handleStateChange("language", value)}
          />

          <QuizDifficultySelect
            value={initial.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(value) => handleStateChange("difficulty", value)}
          />
        </Space>
      </Card>
    </div>
  );
}
