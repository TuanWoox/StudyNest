import React, { useEffect, useState } from "react";
import { Modal, Select, Divider, Space, Button, DatePicker, theme, Grid } from "antd";
import {
    FilterOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { disabledFuture, getDisabledStartDate, getDisabledEndDate } from "@/utils/datePickerDisableHelpers";

const { useBreakpoint } = Grid;

interface Props {
    open: boolean;
    defaultSortBy?: string;
    defaultSortOrder?: "ASC" | "DESC";
    defaultCreatedRange?: [Dayjs | null, Dayjs | null] | undefined;
    defaultDifficulty?: string;
    onCancel: () => void;
    onApply: (payload: {
        sortBy?: string;
        sortOrder?: "ASC" | "DESC";
        createdRange?: [Dayjs | null, Dayjs | null];
        difficulty?: string;
    }) => void;
}

const QuizFilterModal: React.FC<Props> = ({
    open,
    defaultSortBy = "dateCreated",
    defaultSortOrder = "DESC",
    defaultCreatedRange,
    defaultDifficulty = "all",
    onCancel,
    onApply,
}) => {
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const pickerSize: "small" | "middle" | "large" = screens.md ? "middle" : "small";

    const [sortBy, setSortBy] = useState<string>(defaultSortBy);
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(defaultSortOrder);
    const [createdRange, setCreatedRange] = useState<[Dayjs | null, Dayjs | null]>(defaultCreatedRange ?? [null, null]);
    const [difficulty, setDifficulty] = useState<string>(defaultDifficulty);

    useEffect(() => {
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setCreatedRange(defaultCreatedRange ?? [null, null]);
        setDifficulty(defaultDifficulty);
    }, [defaultSortBy, defaultSortOrder, defaultCreatedRange, defaultDifficulty, open]);

    const borderColor = `${token.colorPrimary}55`;
    const shadowColor = `${token.colorPrimary}55`;
    const backgroundColor = token.colorBgElevated;

    const disabledCreatedStartDate = getDisabledStartDate(createdRange);
    const disabledCreatedEndDate = getDisabledEndDate(createdRange);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy':
                return token.colorSuccess;
            case 'medium':
                return token.colorWarning;
            case 'hard':
                return token.colorError;
            default:
                return token.colorPrimary;
        }
    };

    return (
        <Modal
            open={open}
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 700,
                        fontSize: 20,
                        background: backgroundColor,
                    }}
                >
                    <FilterOutlined /> Filter & Sort Quizzes
                </div>
            }
            centered
            onCancel={onCancel}
            footer={[
                <Button
                    key="clear"
                    onClick={() => {
                        setSortBy("dateCreated");
                        setSortOrder("DESC");
                        setCreatedRange([null, null]);
                        setDifficulty("all");
                    }}
                    style={{
                        borderColor,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                        fontFamily: '"Courier New", monospace',
                    }}
                >
                    Clear
                </Button>,
                <Button
                    key="cancel"
                    onClick={onCancel}
                    style={{
                        fontFamily: '"Courier New", monospace',
                        borderColor,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                    }}
                >
                    Cancel
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={() =>
                        onApply({
                            sortBy,
                            sortOrder,
                            createdRange,
                            difficulty: difficulty === "all" ? undefined : difficulty,
                        })
                    }
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                        boxShadow: `2px 2px 0 ${token.colorPrimaryBorder}`,
                        transition: "all 0.25s ease",
                    }}
                >
                    Apply
                </Button>,
            ]}
            closable={false}
            styles={{
                mask: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                },
                content: {
                    backgroundColor,
                    border: `1px solid ${borderColor}`,
                    boxShadow: `4px 4px 0 ${shadowColor}`,
                    padding: "28px 30px",
                    fontFamily: '"Courier New", monospace',
                    transition: "all 0.3s ease",
                },
            }}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Difficulty Filter */}
                <div>
                    <Divider
                        orientation="left"
                        orientationMargin="0"
                        style={{
                            fontWeight: 700,
                            borderColor,
                        }}
                    >
                        <FilterOutlined /> Filter by Difficulty
                    </Divider>
                    <Select
                        value={difficulty}
                        onChange={(v) => setDifficulty(v)}
                        style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                        options={[
                            { value: "all", label: "All Difficulties" },
                            { 
                                value: "easy", 
                                label: <span style={{ color: getDifficultyColor('easy'), fontWeight: 600 }}>Easy</span>
                            },
                            { 
                                value: "medium", 
                                label: <span style={{ color: getDifficultyColor('medium'), fontWeight: 600 }}>Medium</span>
                            },
                            { 
                                value: "hard", 
                                label: <span style={{ color: getDifficultyColor('hard'), fontWeight: 600 }}>Hard</span>
                            },
                        ]}
                    />
                </div>

                {/* Created Date Filter */}
                <div>
                    <Divider
                        orientation="left"
                        orientationMargin="0"
                        style={{
                            fontWeight: 700,
                            borderColor,
                        }}
                    >
                        <CalendarOutlined /> Filter by Date Created
                    </Divider>
                    {screens.md ? (
                        <DatePicker.RangePicker
                            value={createdRange}
                            disabledDate={disabledFuture}
                            size={pickerSize}
                            onChange={(values) =>
                                setCreatedRange((values as [Dayjs | null, Dayjs | null]) ?? [null, null])
                            }
                            style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    ) : (
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <DatePicker
                                placeholder="Start Date"
                                value={createdRange[0]}
                                disabledDate={disabledCreatedStartDate}
                                size={pickerSize}
                                onChange={(d) => setCreatedRange([d, createdRange[1]])}
                                style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                                format="YYYY-MM-DD"
                                allowClear
                            />
                            <DatePicker
                                placeholder="End Date"
                                value={createdRange[1]}
                                disabledDate={disabledCreatedEndDate}
                                size={pickerSize}
                                onChange={(d) => setCreatedRange([createdRange[0], d])}
                                style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                                format="YYYY-MM-DD"
                                allowClear
                            />
                        </Space>
                    )}
                </div>

                {/* Sort Section */}
                <div>
                    <Divider
                        orientation="left"
                        orientationMargin="0"
                        style={{
                            fontWeight: 700,
                            borderColor,
                        }}
                    >
                        {sortOrder === "ASC" ? (
                            <SortAscendingOutlined />
                        ) : (
                            <SortDescendingOutlined />
                        )}{" "}
                        Sort Quizzes
                    </Divider>
                    <Space style={{ width: "100%" }} direction="vertical" size="middle">
                        <Select
                            value={sortBy}
                            onChange={(v) => setSortBy(v)}
                            style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                            options={[
                                { value: "dateCreated", label: "Date Created" },
                                { value: "title", label: "Title" },
                            ]}
                        />
                        <Select
                            value={sortOrder}
                            onChange={(v) => setSortOrder(v)}
                            style={{ width: "100%", boxShadow: `2px 2px 0 ${shadowColor}` }}
                            options={[
                                { value: "ASC", label: "Ascending (A → Z / Oldest)" },
                                { value: "DESC", label: "Descending (Z → A / Newest)" },
                            ]}
                        />
                    </Space>
                </div>
            </Space>
        </Modal>
    );
};

export default QuizFilterModal;
