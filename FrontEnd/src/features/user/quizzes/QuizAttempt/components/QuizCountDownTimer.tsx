import { Card, Typography } from "antd";
import {
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { triggerSubmit } from "@/store/quizAttemptSlice";
import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";

const { Text } = Typography;

const QuizTimerCount = () => {
    const { borderColor, shadowColor, token } = useAntDesignTheme();
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const submitTriggeredRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!id) return -1;
        const saved = window.localStorage.getItem(id);
        const parsed = saved !== null ? Number(saved) : -1;
        return isNaN(parsed) ? -1 : parsed;
    });

    // ⏳ Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (next <= 0 && !submitTriggeredRef.current) {
                    submitTriggeredRef.current = true;
                    dispatch(triggerSubmit());
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60)
            .toString()
            .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    const isWarning = timeLeft <= 60 && timeLeft > 0;
    if (timeLeft === -1) return null;

    return (
        <Card
            size="small"
            style={{
                border: `1px solid ${borderColor}`,
                fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                boxShadow: `3px 3px 0 ${shadowColor}`,
                transition: "all 0.4s ease",
                margin: "12px auto 0 auto"
            }}
            className={isWarning ? "animate-pulse" : ""}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClockCircleOutlined
                        style={{
                            fontSize: 20,
                            transition: "color 0.3s ease",
                        }}
                    />
                    <div>
                        <Text
                            style={{
                                fontSize: 12,
                                letterSpacing: 0.5
                            }}
                        >
                            {timeLeft <= 0 ? "Time's Up" : "Time Left"}
                        </Text>
                        <div>
                            <Text
                                strong
                                style={{
                                    fontSize: 18,
                                    letterSpacing: "1px",
                                }}
                            >
                                {formatTime(timeLeft)}
                            </Text>
                        </div>
                    </div>
                </div>

                {isWarning && (
                    <ExclamationCircleOutlined
                        style={{
                            color: token.colorWarning,
                            fontSize: 18,
                            transition: "transform 0.3s ease",
                        }}
                        className="animate-bounce"
                    />
                )}
            </div>
        </Card>
    );
};

export default QuizTimerCount;
