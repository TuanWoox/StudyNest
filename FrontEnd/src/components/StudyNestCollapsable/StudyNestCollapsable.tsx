import React from "react";
import { Collapse } from "antd";
import { CollapseProps } from "antd";
import { useAntDesignTheme } from "@/hooks/common";


const StudyNestCollapsable: React.FC<CollapseProps> = (props) => {
    const { collapsableStyle } = useAntDesignTheme();

    return (
        <Collapse
            expandIconPosition="end"
            style={{
                ...collapsableStyle,
                margin: 0,
                padding: 0,
            }}
            {...props} // allow override
        />
    );
};

export default StudyNestCollapsable;
