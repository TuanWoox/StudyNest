import StudyNestCard from "@/components/StudyNestCard/StudyNestCard";
import { useAntDesignTheme } from "@/hooks/common";
import { ReturnResult } from "@/types/common/return-result";
import { QuizStatisticsDTO } from "@/types/quizStatistics/QuizStatisticsDTO";
import { Typography } from "antd";
import dayjs from "dayjs";
import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Pie,
    Cell,
    PieChart,
} from "recharts";

const { Text, Title } = Typography;

interface QuizStatisticsChartProps {
    data: ReturnResult<QuizStatisticsDTO> | null | undefined;
}

const QuizStatisticsChart: React.FC<QuizStatisticsChartProps> = ({ data }) => {
    const formattedScores = data?.result?.attemptSummary.scores?.map((item) => ({
        ...item,
        dateCreated: dayjs(item.dateCreated).format("DD/MM"),
    })) || [];

    const formattedRightWrong = [
        { name: "Right Answers", value: data?.result?.attemptSummary?.totalRightQuestion || 0 },
        { name: "Wrong Answers", value: data?.result?.attemptSummary?.totalWrongQuestion || 0 }
    ];

    const { cardStyles, pieChart } = useAntDesignTheme();

    const customCardStyles = {
        ...cardStyles,
        style: {
            ...cardStyles.style,
            flex: 1,
        }
    };

    if (!data) return null;

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Quiz Performance Charts</h2>
                <p className="text-sm text-gray-500">Visual overview of your quiz results</p>
            </div>

            {/* Charts Grid */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left: Progress Line Chart */}
                <StudyNestCard customCardStyles={customCardStyles}>
                    <div className="mb-4">
                        <Title level={5} className="mb-1">
                            Score Progress
                        </Title>
                        <Text type="secondary">
                            Track your quiz performance over time
                        </Text>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formattedScores}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="dateCreated" stroke="var(--muted-foreground)" />
                            <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={{ fill: "var(--primary)", r: 4 }}
                                name="Score"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </StudyNestCard>

                {/* Right: Pie Chart */}
                <StudyNestCard customCardStyles={customCardStyles}>
                    <div className="mb-4">
                        <Title level={5} className="mb-1">
                            Answer Distribution
                        </Title>
                        <Text type="secondary">
                            Overall right vs wrong answers
                        </Text>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={formattedRightWrong}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {formattedRightWrong.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.name === "Right Answers" ? pieChart.rightColor : pieChart.wrongColor}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </StudyNestCard>
            </div>
        </div>
    );
};

export default QuizStatisticsChart;
