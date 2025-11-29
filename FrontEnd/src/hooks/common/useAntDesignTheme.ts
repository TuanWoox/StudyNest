import { theme } from "antd";
import type { ModalProps, CardProps } from "antd";

const useAntDesignTheme = () => {
    const { token } = theme.useToken();

    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88%
    const shadowColor = `${primaryColor}55`; // 33%
    const bgColor = token.colorBgLayout;
    const textColor = token.colorText;

    // === CARD styles ===
    const cardBorderStyle = `2px solid ${borderColor}`;
    const cardShadowStyle = `4px 4px 0px ${shadowColor}`;
    const cardHoverShadowStyle = `6px 6px 0px ${shadowColor}`;
    const cardHoverTransform = "translate(-2px, -2px)";
    const cardDefaultTransform = "translate(0, 0)";

    const cardStyles: {
        style: CardProps["style"];
        bodyStyle: CardProps["bodyStyle"];
        hoverShadow: string;
        hoverTransform: string;
        defaultShadow: string;
        defaultTransform: string;
    } = {
        style: {
            border: cardBorderStyle,
            borderRadius: 0,
            boxShadow: cardShadowStyle,
            transition: "all 0.3s ease",
        },
        bodyStyle: {
            padding: "16px",
        },
        hoverShadow: cardHoverShadowStyle,
        hoverTransform: cardHoverTransform,
        defaultShadow: cardShadowStyle,
        defaultTransform: cardDefaultTransform,
    };

    // === MODAL styles ===
    const modalStyles: ModalProps["styles"] = {
        content: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            border: `1.5px solid ${borderColor}`,
            backgroundColor: bgColor,
            boxShadow: `6px 6px 0 ${shadowColor}`,
            color: textColor,
            transition: "all 0.3s ease",
            fontFamily: '"Courier New", monospace',
            maxHeight: '90dvh',
        },
        body: {
            padding: 0,
            flex: 1,
            minHeight: 0,
            overflowY: "hidden",
            scrollbarWidth: 'none'
        },
        mask: {
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
        }
    };

    // === COLLAPSABLE styles
    const collapsableStyle = {
        backgroundColor: "transparent",
        border: "none",
        alignItems: "center",
        paddingRight: "4px",
        marginTop: token.marginLG,
    }

    // PIE CHART
    const pieChart = {
        rightColor: "#10b981",
        wrongColor: "#ef4444"
    }

    return {
        token,
        primaryColor,
        borderColor,
        shadowColor,
        bgColor,
        textColor,
        cardBorderStyle,
        cardShadowStyle,
        cardStyles,
        modalStyles,
        collapsableStyle,
        pieChart
    };
}

export default useAntDesignTheme;