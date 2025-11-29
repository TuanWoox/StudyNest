import { Table, Grid } from "antd";

const SmartTable = ({
    columns,
    data,
    total,
    loading,
    tableControls,
    rowKey = "id",
    rowSelection,
    scroll = { x: 1100 },   // 👈 default
    style = {},             // 👈 default
}) => {
    const screens = Grid.useBreakpoint();
    const { pageNumber, pageSize, filters, handleTableChange } = tableControls;

    // // Inject filteredValue vào columns
    // const enhancedColumns = columns.map((col) => ({
    //     ...col,
    //     filteredValue:
    //         filters.find((f) => f.prop === col.dataIndex)
    //             ? [filters.find((f) => f.prop === col.dataIndex).value]
    //             : null,
    // }));

    return (
        <Table
            rowKey={rowKey}
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{
                current: pageNumber + 1,
                pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: !screens.xs
                    ? (total, range) => (
                        <span style={{ fontFamily: "monospace" }}>
                            {screens.md
                                ? `${range[0]}-${range[1]} of ${total} settings`
                                : `${total} settings`}
                        </span>
                    )
                    : undefined,
                style: {
                    justifyContent: "center"
                }
            }}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            scroll={scroll}
            style={style}
        />
    );
};

export default SmartTable;
