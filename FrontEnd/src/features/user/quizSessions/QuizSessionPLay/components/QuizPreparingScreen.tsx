import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress } from 'antd';
import {
    RocketOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { useAntDesignTheme } from '@/hooks/common';

const { Title, Text } = Typography;

interface PreparationStep {
    icon: React.ReactNode;
    text: string;
    duration: number;
}

const QuizPreparingScreen: React.FC = () => {
    const { primaryColor, bgColor, cardBorderStyle, cardShadowStyle } = useAntDesignTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const steps: PreparationStep[] = [
        {
            icon: <FileTextOutlined style={{ fontSize: 80, color: primaryColor }} />,
            text: 'Loading quiz questions...',
            duration: 33,
        },
        {
            icon: <CheckCircleOutlined style={{ fontSize: 80, color: primaryColor }} />,
            text: 'Preparing your attempt...',
            duration: 66,
        },
        {
            icon: <RocketOutlined style={{ fontSize: 80, color: primaryColor }} />,
            text: 'Almost ready to start!',
            duration: 100,
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + 1;

                // Update step based on progress
                if (newProgress >= 66 && currentStep < 2) {
                    setCurrentStep(2);
                } else if (newProgress >= 33 && currentStep < 1) {
                    setCurrentStep(1);
                }

                // Reset at 100 to create continuous animation
                if (newProgress >= 100) {
                    return 0;
                }

                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [currentStep]);

    return (
        <div
            className="fixed inset-0 w-screen h-screen flex items-center justify-center p-6"
            style={{ backgroundColor: bgColor }}
        >
            <Card
                className="w-full max-w-4xl"
                style={{
                    border: cardBorderStyle,
                    borderRadius: 0,
                    boxShadow: cardShadowStyle,
                }}
            >
                <div className="flex flex-col items-center gap-12 py-16">
                    {/* Animated Icon */}
                    <div className="relative">
                        <div
                            className="absolute inset-0 animate-ping opacity-20"
                            style={{
                                backgroundColor: primaryColor,
                                borderRadius: '50%',
                                width: '120px',
                                height: '120px',
                            }}
                        />
                        <div
                            className="relative animate-bounce"
                            style={{
                                animation: 'bounce 1s infinite',
                                fontSize: '80px',
                            }}
                        >
                            {steps[currentStep].icon}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <Title
                            level={1}
                            className="mb-4"
                            style={{ fontFamily: '"Courier New", monospace', fontSize: '3rem' }}
                        >
                            Preparing Your Quiz
                        </Title>
                        <Text
                            className="text-2xl"
                            style={{ fontFamily: '"Courier New", monospace' }}
                        >
                            {steps[currentStep].text}
                        </Text>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-2xl">
                        <Progress
                            percent={progress}
                            strokeColor={{
                                '0%': primaryColor,
                                '100%': primaryColor,
                            }}
                            trailColor={`${primaryColor}20`}
                            showInfo={false}
                            strokeWidth={16}
                        />
                    </div>

                    {/* Loading Dots Animation */}
                    <div className="flex gap-3">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full animate-pulse"
                                style={{
                                    backgroundColor: primaryColor,
                                    animationDelay: `${i * 150}ms`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Additional Info */}
                    <Card
                        className="w-full"
                        style={{
                            border: `2px solid ${primaryColor}40`,
                            borderRadius: 0,
                            backgroundColor: `${primaryColor}10`,
                        }}
                    >
                        <div className="flex items-center justify-center gap-3 py-2">
                            <LoadingOutlined
                                style={{
                                    fontSize: 24,
                                    color: primaryColor
                                }}
                                spin
                            />
                            <Text
                                type="secondary"
                                className="text-lg"
                                style={{ fontFamily: '"Courier New", monospace' }}
                            >
                                Please wait while we set everything up for you...
                            </Text>
                        </div>
                    </Card>
                </div>
            </Card>
        </div>
    );
};

export default QuizPreparingScreen;
