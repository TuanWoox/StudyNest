import { useAntDesignTheme } from "@/hooks/common";
import { DatePicker, Divider, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface QuizStatisticsHeaderProps {
    dateFilter: [Dayjs | null, Dayjs | null];
    setDateFilter: (dates: [Dayjs | null, Dayjs | null]) => void;
}

const QuizStatisticsHeader: React.FC<QuizStatisticsHeaderProps> = ({ dateFilter, setDateFilter }) => {
    const defaultRange: [Dayjs, Dayjs] = [dayjs().subtract(7, "day"), dayjs()];
    const { shadowColor } = useAntDesignTheme();
    return (
        <div className="mb-6">
            <div className="flex flex-row justify-between items-center">
                <div>
                    <Title level={3}>Quiz Statistics</Title>
                    <Title level={5} type="secondary" style={{ marginTop: 0 }}>
                        Detailed analytics for this quiz attempt performance.
                    </Title>
                </div>
                <RangePicker
                    value={dateFilter || defaultRange}
                    onChange={(dates) => {
                        // Only set the date when both dates are not null
                        if (dates?.[0] && dates?.[1]) {
                            setDateFilter(dates as [Dayjs | null, Dayjs | null])

                        }
                    }}
                    disabledDate={(currentDate) => {
                        if (!currentDate) return false
                        const startOfMonth = dayjs().startOf("month");
                        const endOfMonth = dayjs().endOf("month");
                        // Disable if date is outside the current month
                        return currentDate.isBefore(startOfMonth, "day") || currentDate.isAfter(endOfMonth, "day");
                    }}
                    style={{ boxShadow: `2px 2px 0 ${shadowColor}` }}
                />
            </div>
            <Divider />
        </div>
    );
};

export default QuizStatisticsHeader;
