import React from "react";
import { Input, Button, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";

interface Props extends FilterDropdownProps {
    dataIndex: string;
}

const CustomFilterDropDown: React.FC<Props> = ({
    dataIndex,
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
}) => {
    return (
        <div style={{ padding: 8 }}>
            <Input
                placeholder={`Search ${dataIndex}`}
                value={selectedKeys?.[0] as string}
                onChange={(e) =>
                    setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() => confirm()}
                style={{ width: 188, marginBottom: 8, display: "block" }}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => confirm()}
                    size="small"
                    style={{ width: 90 }}
                >
                    Search
                </Button>

                <Button
                    onClick={() => {
                        clearFilters?.();
                        confirm();
                    }}
                    size="small"
                    style={{ width: 90 }}
                >
                    Reset
                </Button>
            </Space>
        </div>
    );
};

export default CustomFilterDropDown;