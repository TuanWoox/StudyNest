import { useAntDesignTheme } from "@/hooks/common";
import { Card } from "antd";
import { CardProps } from "antd/lib";
import React from "react";

interface StudyNestCardProps {
    children: React.ReactNode;
    customCardStyles?: {
        style: CardProps["style"];
        bodyStyle: CardProps["bodyStyle"];
        hoverShadow: string;
        hoverTransform: string;
        defaultShadow: string;
        defaultTransform: string;
    }
}

const StudyNestCard: React.FC<StudyNestCardProps> = ({ children, customCardStyles }) => {
    const { cardStyles } = useAntDesignTheme();
    const appliedStyles = customCardStyles ? customCardStyles : cardStyles;

    return (
        <Card
            hoverable
            style={appliedStyles?.style}
            styles={{ body: appliedStyles?.bodyStyle }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = appliedStyles?.hoverShadow ?? "";
                e.currentTarget.style.transform = appliedStyles?.hoverTransform ?? "";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = appliedStyles?.defaultShadow ?? "";
                e.currentTarget.style.transform = appliedStyles?.defaultTransform ?? "";
            }}
        >
            {children}
        </Card>
    );
};

export default StudyNestCard;