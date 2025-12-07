import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, message } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAntDesignTheme } from '@/hooks/common';

const { Title, Text } = Typography;

interface GamePinEntryProps {
    onJoinSession: (pin: string) => Promise<void>;
}

const GamePinEntry: React.FC<GamePinEntryProps> = ({ onJoinSession }) => {
    const [inputPin, setInputPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { token, cardBorderStyle, cardShadowStyle, primaryColor, bgColor } = useAntDesignTheme();

    const handleJoin = async () => {
        if (!inputPin.trim()) {
            message.error("Please enter the game PIN");
            return;
        }

        setIsLoading(true);
        try {
            await onJoinSession(inputPin);
        } catch (error) {
            // Error handling is done in parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: bgColor }}
        >
            <Card
                className="text-center max-w-md w-full"
                style={{
                    border: cardBorderStyle,
                    borderRadius: 0,
                    boxShadow: cardShadowStyle,
                }}
            >
                <Space direction="vertical" size="large" className="w-full">
                    <div>
                        <Title level={1} className="mb-2" style={{ fontFamily: '"Courier New", monospace' }}>
                            Join Quiz Session
                        </Title>
                        <Text type="secondary" className="text-lg">
                            Enter the game PIN to join
                        </Text>
                    </div>

                    <Input
                        size="large"
                        placeholder="ENTER PIN"
                        value={inputPin}
                        onChange={(e) => setInputPin(e.target.value.toUpperCase())}
                        onPressEnter={handleJoin}
                        maxLength={6}
                        disabled={isLoading}
                        style={{
                            fontSize: 32,
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            fontFamily: '"Courier New", monospace',
                            fontWeight: 'bold',
                            border: `2px solid ${primaryColor}E0`,
                            borderRadius: 0,
                        }}
                    />

                    <Button
                        type="primary"
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={handleJoin}
                        loading={isLoading}
                        block
                        style={{
                            height: 50,
                            fontSize: 18,
                            fontFamily: '"Courier New", monospace',
                            fontWeight: 'bold'
                        }}
                    >
                        Join Session
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default GamePinEntry;
