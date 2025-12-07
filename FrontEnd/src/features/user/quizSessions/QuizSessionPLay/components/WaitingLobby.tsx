import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { UserOutlined, PlayCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAntDesignTheme } from '@/hooks/common';

const { Title, Text } = Typography;

interface WaitingLobbyProps {
    gamePin?: string;
    players: string[];
    isHost: boolean;
    onStartGame?: () => void;
    onLeave?: () => void;
}
const WaitingLobby: React.FC<WaitingLobbyProps> = ({
    gamePin,
    players,
    isHost,
    onStartGame,
    onLeave,
}) => {
    const { token, cardBorderStyle, cardShadowStyle, primaryColor, shadowColor, bgColor } = useAntDesignTheme();

    return (
        <div className="w-full min-h-screen overflow-y-auto p-4" style={{ backgroundColor: bgColor }}>
            <div className="w-full max-w-full mx-auto">
                <Card
                    className="text-center w-full"
                    style={{
                        border: cardBorderStyle,
                        borderRadius: 0,
                        boxShadow: cardShadowStyle,
                    }}
                >
                    <Space direction="vertical" size="large" className="w-full">
                        <div>
                            <Title level={1} className="mb-2" style={{ fontFamily: '"Courier New", monospace' }}>
                                Quiz Session
                            </Title>
                            <Text type="secondary" className="text-lg">
                                Waiting for players to join...
                            </Text>
                        </div>

                        <Card
                            style={{
                                border: `2px solid ${primaryColor}40`,
                                borderRadius: 0,
                                backgroundColor: `${primaryColor}10`,
                            }}
                        >
                            <div>
                                <Text type="secondary">Game PIN</Text>
                                <Title
                                    level={2}
                                    className="mb-0 tracking-wider"
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        color: primaryColor
                                    }}
                                >
                                    {gamePin || '------'}
                                </Title>
                            </div>
                        </Card>

                        <div className="flex items-center justify-center gap-2 mb-4">
                            <UserOutlined style={{ fontSize: 24, color: primaryColor }} />
                            <Title level={3} className="mb-0" style={{ fontFamily: '"Courier New", monospace' }}>
                                {players.length} Player{players.length !== 1 ? 's' : ''} Joined
                            </Title>
                        </div>

                        {/* Player Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-2">
                            {players.map((playerName, index) => (
                                <Card
                                    key={index}
                                    hoverable
                                    className="text-center transition-all"
                                    style={{
                                        border: `2px solid ${primaryColor}E0`,
                                        borderRadius: 0,
                                        boxShadow: `2px 2px 0px ${shadowColor}`,
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = `4px 4px 0px ${shadowColor}`;
                                        e.currentTarget.style.transform = "translate(-2px, -2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = `2px 2px 0px ${shadowColor}`;
                                        e.currentTarget.style.transform = "translate(0, 0)";
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <UserOutlined style={{ fontSize: 24, color: primaryColor }} />
                                        <Text
                                            strong
                                            className="text-sm truncate w-full"
                                            title={playerName}
                                            style={{ fontFamily: '"Courier New", monospace' }}
                                        >
                                            {playerName}
                                        </Text>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {players.length === 0 && (
                            <Card
                                style={{
                                    border: `2px dashed ${primaryColor}40`,
                                    borderRadius: 0,
                                    backgroundColor: `${primaryColor}05`,
                                }}
                            >
                                <Text type="secondary" className="block text-center">
                                    No players yet. Share the game PIN to start!
                                </Text>
                            </Card>
                        )}                    {isHost && (
                            <>
                                <div className="flex gap-3 justify-center items-center">
                                    <Button
                                        type="primary"
                                        size="middle"
                                        icon={<PlayCircleOutlined />}
                                        onClick={onStartGame}
                                        disabled={players.length === 0}
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Start Game
                                    </Button>
                                    <Button
                                        danger
                                        size="middle"
                                        icon={<LogoutOutlined />}
                                        onClick={onLeave}
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Leave
                                    </Button>
                                </div>
                                {players.length === 0 && (
                                    <Text type="secondary">
                                        Waiting for at least 1 player to join
                                    </Text>
                                )}
                            </>
                        )}

                        {!isHost && (
                            <>
                                <div className="animate-pulse">
                                    <Text
                                        className="text-lg"
                                        style={{ fontFamily: '"Courier New", monospace' }}
                                    >
                                        Waiting for host to start the game...
                                    </Text>
                                </div>
                                <Button
                                    danger
                                    size="middle"
                                    icon={<LogoutOutlined />}
                                    onClick={onLeave}
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Leave Session
                                </Button>
                            </>
                        )}
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default WaitingLobby;
