import StudyNestCard from "@/components/StudyNestCard/StudyNestCard";
import { ReturnResult } from "@/types/common/return-result";
import { QuizStatisticsDTO } from "@/types/quizStatistics/QuizStatisticsDTO";
import { Typography } from "antd";
import React from "react";
const { Text, Title } = Typography;

interface QuizStatisticsSummaryProps {
    data: ReturnResult<QuizStatisticsDTO> | undefined | null;
}

const QuizStatisticsSummary: React.FC<QuizStatisticsSummaryProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div>
            <div className="mb-4">
                <Title level={4}>Quiz Performance Summary</Title>
                <Text type="secondary">A quick overview of your quiz progress</Text>
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StudyNestCard>
                    <p className="text-3xl font-bold">{data?.result?.attemptSummary?.totalAttempts}</p>
                    <Text type="secondary" className="mt-1 block">Total Attempts</Text>
                </StudyNestCard>

                <StudyNestCard>
                    <p className="text-3xl font-bold">{data?.result?.scoreStatistics?.averageScore.toFixed(1)}</p>
                    <Text type="secondary" className="mt-1 block">Average Score</Text>
                </StudyNestCard>

                <StudyNestCard>
                    <p className="text-3xl font-bold">{data?.result?.scoreStatistics?.bestScore}%</p>
                    <Text type="secondary" className="mt-1 block">Highest Score</Text>
                </StudyNestCard>

                <StudyNestCard>
                    <p className="text-3xl font-bold">{data?.result?.scoreStatistics?.worstScore}%</p>
                    <Text type="secondary" className="mt-1 block">Lowest Score</Text>
                </StudyNestCard>
            </div>
        </div>
    );
};

export default QuizStatisticsSummary;
