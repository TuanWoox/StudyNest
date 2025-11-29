import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { Modal, Select, Button, Alert } from 'antd';

interface QuizTimeLimitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (timeLimit: number) => void;
}

const timeOptions = [
    { value: -1, label: "No limit" },
    { value: 300, label: "5 minutes" },
    { value: 600, label: "10 minutes" },
    { value: 900, label: "15 minutes" },
    { value: 1200, label: "20 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 2700, label: "45 minutes" },
    { value: 3600, label: "60 minutes" },
];

export function QuizTimeLimitModal({ open, onOpenChange, onConfirm }: QuizTimeLimitModalProps) {
    const [selectedTime, setSelectedTime] = useState(-1);

    const handleConfirm = () => {
        onConfirm(selectedTime);
        onOpenChange(false);
    };

    return (
        <Modal
            open={open}
            onCancel={() => onOpenChange(false)}
            title={
                <div className="flex items-center gap-2 text-lg">
                    <Clock className="w-6 h-6" />
                    <span>Set Quiz Time Limit</span>
                </div>
            }
            footer={[
                <Button
                    key="cancel"
                    size="large"
                    icon={<X className="w-5 h-5" />}
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    size="large"
                    icon={<Clock className="w-5 h-5" />}
                    onClick={handleConfirm}
                >
                    Start
                </Button>,
            ]}
            centered
            width={600}
        >
            <div className="space-y-6 py-4">
                <p className="text-base text-gray-600">
                    Choose the time you want to spend completing this quiz. You can change your selection before starting.
                </p>

                <div className="space-y-4">
                    <label className="text-base font-medium block">Time limit</label>
                    <Select
                        value={selectedTime}
                        onChange={setSelectedTime}
                        size="large"
                        className="w-full"
                        options={timeOptions}
                    />
                </div>

                <Alert
                    message={
                        <span className="text-base">
                            <strong>Tip:</strong> You will be reminded when 1 minute remains. Choose a time that suits your ability.
                        </span>
                    }
                    type="info"
                    showIcon
                />
            </div>
        </Modal>
    );
}