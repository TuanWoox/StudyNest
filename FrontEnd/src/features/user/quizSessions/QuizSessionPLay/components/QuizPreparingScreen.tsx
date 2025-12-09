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
            style={{ 
                minHeight: '100vh',
                backgroundColor: bgColor,
                padding: '24px',
                overflow: 'auto',
                
            }}
            className='mx-auto'
        >
            <Card
                style={{
                    border: `3px solid ${primaryColor}`,
                    borderRadius: 0,
                    boxShadow: `12px 12px 0px ${primaryColor}40`,
                    maxWidth: '900px',
                    width: '100%',
                    padding: '24px',
                    margin: '0 auto',
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '48px',
                    padding: '32px 16px'
                }}>
                    {/* Animated Icon */}
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div
                            style={{
                                position: 'absolute',
                                backgroundColor: primaryColor,
                                borderRadius: '50%',
                                width: '140px',
                                height: '140px',
                                opacity: 0.2,
                                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                            }}
                        />
                        <div style={{ animation: 'bounce 1s infinite', fontSize: '100px', lineHeight: 1 }}>
                            {steps[currentStep].icon}
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                        <Title
                            level={1}
                            style={{ 
                                fontFamily: '"Courier New", monospace', 
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                margin: 0,
                                marginBottom: '16px',
                                fontWeight: 'bold',
                                color: primaryColor,
                            }}
                        >
                            Preparing Your Quiz
                        </Title>
                        <Text
                            style={{ 
                                fontFamily: '"Courier New", monospace',
                                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                                display: 'block',
                            }}
                        >
                            {steps[currentStep].text}
                        </Text>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', maxWidth: '600px' }}>
                        <Progress
                            percent={progress}
                            strokeColor={{
                                '0%': primaryColor,
                                '100%': primaryColor,
                            }}
                            trailColor={`${primaryColor}20`}
                            showInfo={false}
                            strokeWidth={20}
                        />
                    </div>

                    {/* Loading Dots Animation */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: primaryColor,
                                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                    animationDelay: `${i * 150}ms`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Additional Info */}
                    <Card
                        style={{
                            border: `2px solid ${primaryColor}40`,
                            borderRadius: 0,
                            backgroundColor: `${primaryColor}10`,
                            width: '100%',
                            maxWidth: '700px',
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '12px',
                            padding: '8px',
                            flexWrap: 'wrap',
                        }}>
                            <LoadingOutlined
                                style={{
                                    fontSize: 28,
                                    color: primaryColor
                                }}
                                spin
                            />
                            <Text
                                type="secondary"
                                style={{ 
                                    fontFamily: '"Courier New", monospace',
                                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                                    textAlign: 'center',
                                }}
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
