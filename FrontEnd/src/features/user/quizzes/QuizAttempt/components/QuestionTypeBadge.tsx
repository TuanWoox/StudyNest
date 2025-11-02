import { CheckCircleOutlined, CheckSquareOutlined, SwapOutlined } from "@ant-design/icons";
import { theme } from "antd";

interface QuestionTypeBadgeProps {
    type: string;
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
    const { token } = theme.useToken();
    const config = {
        "mcq": {
            label: "Single Choice",
            icon: CheckCircleOutlined, // Ant Design icon
            color: "text-mcq bg-mcq/10 border-mcq/20",
        },
        "msq": {
            label: "Multiple Answers",
            icon: CheckSquareOutlined, // Ant Design icon
            color: "text-multi bg-multi/10 border-multi/20",
        },
        "tf": {
            label: "True or False",
            icon: SwapOutlined, // Ant Design icon
            color: "text-truefalse bg-truefalse/10 border-truefalse/20",
        },
    };

    const { label, icon: Icon, color } = config[type];

    // 🎨 Tông màu LearnHub Retro
    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88% opacity
    const shadowColor = `${primaryColor}55`; // 33% opacity

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border ${color}`}
            style={{
                boxShadow: `3px 3px 0 ${shadowColor}`,
                border: `1px solid ${borderColor}`,
            }}>
            <Icon className="w-4 h-4" />
            {label}
        </span>
    );
}
