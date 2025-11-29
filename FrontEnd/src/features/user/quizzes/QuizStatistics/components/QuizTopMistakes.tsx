import React, { useState } from "react";
import { ReturnResult } from "@/types/common/return-result";
import { QuizStatisticsDTO } from "@/types/quizStatistics/QuizStatisticsDTO";
import { QuestionItem } from "../../QuizDetailPage/components";
import { Question } from "@/types/quiz/quiz";
import { useAntDesignTheme } from "@/hooks/common";
import StudyNestCollapsable from "@/components/StudyNestCollapsable/StudyNestCollapsable";
import QuizPagination from "../../Quizzes/components/QuizPagination";

const QuizTopMistakes: React.FC<{
    data: ReturnResult<QuizStatisticsDTO> | null | undefined;
}> = ({ data }) => {
    const { token, cardBorderStyle, cardShadowStyle } = useAntDesignTheme();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const questionErrorCounts =
        data?.result?.attemptSummary?.questionErrorCounts || [];

    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    if (!data || !questionErrorCounts.length) return null;

    const handleCollapseChange = (keys: string | string[]) => {
        setExpandedKeys(Array.isArray(keys) ? keys : [keys]);
    };

    const startIndex = (page - 1) * pageSize;
    const pagedData = questionErrorCounts.slice(
        startIndex,
        startIndex + pageSize
    );

    return (
        <div>

            {/* Section Header */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Top Mistakes</h2>
                <p className="text-sm text-gray-500">
                    Review the questions you struggled with the most
                </p>
            </div>

            {/* Collapsable items with pagination applied */}
            <StudyNestCollapsable
                activeKey={expandedKeys}
                onChange={handleCollapseChange}
                accordion={false}
                items={pagedData.map((item, index) => {
                    const q = item.question as Question;
                    return {
                        key: q.id,
                        label: (
                            <div
                                style={{
                                    padding: isMobile
                                        ? `${token.marginXXS}px 0`
                                        : `${token.marginXS}px 0`,
                                    fontSize: isMobile ? 14 : 15,
                                    fontWeight: 600,
                                    fontFamily: "monospace",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <div>❌ Mistake {startIndex + index + 1}: {q.name}</div>
                                <div style={{ opacity: 0.6, fontSize: 13, marginLeft: 8 }}>
                                    Errors: {item.wrongCounts}
                                </div>
                            </div>
                        ),
                        children: <QuestionItem question={q} index={index} />,
                        style: {
                            marginBottom: token.margin,
                            backgroundColor: token.colorBgContainer,
                            borderRadius: 0,
                            border: cardBorderStyle,
                            boxShadow: cardShadowStyle,
                            overflow: "hidden",
                        },
                    };
                })}
            />

            {/* Pagination */}
            <div className="mt-4">
                <QuizPagination
                    current={page}
                    pageSize={pageSize}
                    total={questionErrorCounts.length}
                    onChange={(p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    }}
                />
            </div>
        </div>
    );
};

export default QuizTopMistakes;
