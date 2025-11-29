import { useAntDesignTheme } from "@/hooks/common";
import FeedBacksHeader from "./component/FeedbacksHeader";
import { ColumnsType } from "antd/es/table";
import { SortOrder } from "antd/es/table/interface";
import CustomFilterDropDown from "@/components/CustomFilterDropDown/CustomFilterDropDown";
import { getFilteredValue } from "@/utils/getFilteredValue";
import { useTableControls } from "@/hooks/common/useTableControls";
import { Button, Select, Skeleton, Space, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import useGetAllFeedBackHook from "@/hooks/feedbackHook/useGetAllFeedBackHook";
import SmartTable from "@/components/SmartTable/SmartTable";
import { useEffect, useRef, useState } from "react";
import { SortOrderType } from "@/constants/sortOrderType";
import { EFeedBackStatus } from "@/utils/enums/EFeedBackStatus";
import FeedBackCreateEdit, { FeedBackCreateEditRef } from "./component/FeedBackCreateEdit";
import useUpdateFeedback from "@/hooks/feedbackHook/useUpdateFeedBack";
import FeedBackDeleteModal, { FeedBackDeleteRef } from "./component/FeedBackDeleteModal";
import FeedBackBulkDeleteModal, { FeedBackBulkDeleteRef } from "./component/FeedBackBulkDeleteModal";

const { Option } = Select;

const Feedbacks = () => {
    const { borderColor, shadowColor, bgColor } = useAntDesignTheme();

    /** ---------------- STATE ---------------- */
    const [total, setTotal] = useState(0);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const tableControls = useTableControls();

    const createEditModalRef = useRef<FeedBackCreateEditRef>(null);
    const deleteRef = useRef<FeedBackDeleteRef>(null);
    const bulkDeleteRef = useRef<FeedBackBulkDeleteRef>(null);

    /** ---------------- DATA FETCH ---------------- */
    const { data: settingData, isLoading, refetch } = useGetAllFeedBackHook({
        pageNumber: tableControls.pageNumber,
        pageSize: tableControls.pageSize,
        sorts: tableControls.sorts,
        filters: tableControls.filters,
    });

    useEffect(() => {
        if (settingData?.page?.totalElements != null) {
            setTotal(settingData.page.totalElements);
        }
    }, [settingData]);

    /** ---------------- TABLE COLUMNS ---------------- */
    const columns: ColumnsType<FeedBackDTO> = [
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 240,
            sorter: (a, b) => a.category.localeCompare(b.category),
            sortDirections: ["ascend", "descend"] as SortOrder[],
            filterDropdown: (props) => <CustomFilterDropDown {...props} dataIndex="category" />,
            filteredValue: getFilteredValue(tableControls.filters, "category"),
            render: (text: string) => {
                const needsTooltip = text && text.length > 30;
                return (
                    <Tooltip
                        title={needsTooltip ? text : null}
                        overlayStyle={{ maxWidth: '400px', wordWrap: 'break-word' }}
                    >
                        <div style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "220px"
                        }}>
                            {text}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            width: 160,
            sorter: (a, b) => a.rating - b.rating,
            sortDirections: ["ascend", "descend"] as SortOrder[],
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            sorter: (a, b) => a.description.localeCompare(b.description),
            sortDirections: ["ascend", "descend"] as SortOrder[],
            filterDropdown: (props) => <CustomFilterDropDown {...props} dataIndex="description" />,
            filteredValue: getFilteredValue(tableControls.filters, "description"),
            render: (text: string) => {
                const needsTooltip = text && text.length > 40;
                return (
                    <Tooltip
                        title={needsTooltip ? text : null}
                        overlayStyle={{ maxWidth: '500px', wordWrap: 'break-word' }}
                    >
                        <div style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "300px"
                        }}>
                            {text}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "From",
            dataIndex: "user.email",
            key: "user.email",
            sorter: (a, b) => a.user.email.localeCompare(b.user.email),
            sortDirections: ["ascend", "descend"] as SortOrder[],
            render: (_: any, record: FeedBackDTO) => record.user.email,
            filterDropdown: (props) => <CustomFilterDropDown {...props} dataIndex="user.email" />,
            filteredValue: getFilteredValue(tableControls.filters, "user.email"),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => a.status - b.status,
            sortDirections: ["ascend", "descend"] as SortOrder[],
            render: (status: EFeedBackStatus, record: FeedBackDTO) => {
                return (
                    <Select value={status} style={{ width: 120 }} disabled={true}>
                        <Option value={EFeedBackStatus.Pending}>Pending</Option>
                        <Option value={EFeedBackStatus.InQueue}>In Queue</Option>
                        <Option value={EFeedBackStatus.Done}>Done</Option>
                        <Option value={EFeedBackStatus.Rejected}>Rejected</Option>
                    </Select>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: 160,
            render: (_: any, record: FeedBackDTO) => (
                <Space>
                    <Tooltip title="Edit Feedback">
                        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    </Tooltip>
                    {record.status === EFeedBackStatus.Pending && (
                        <Space>
                            <Tooltip title="Delete Feedback">
                                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => openDeleteConfirm(record)} />
                            </Tooltip>
                        </Space>
                    )}
                </Space>
            ),
        },
    ];

    /** ---------------- CRUD HANDLERS ---------------- */
    // Open single delete
    const openDeleteConfirm = (record: FeedBackDTO) => deleteRef.current?.open(record);

    // Open bulk delete
    const openBulkDelete = () => bulkDeleteRef.current?.open(selectedRowKeys);

    const openCreate = () => {
        createEditModalRef.current?.open(); // <-- use the ref to open
    };

    const openEdit = (record: FeedBackDTO) => {
        createEditModalRef.current?.open(record); // <-- pass the record to open in edit mode
    };


    /** ---------------- RENDER ---------------- */
    return (
        <div className="w-full h-full overflow-y-auto px-6 pt-4 pb-5" style={{ backgroundColor: bgColor }}>
            <FeedBacksHeader
                onRefresh={() => {
                    refetch();
                    tableControls.setSorts([{ sort: "dateCreated", sortDir: SortOrderType.DESC }]);
                }}
                onCreate={openCreate}
                selectedCount={selectedRowKeys.length}
                onBulkDelete={openBulkDelete}
            />

            {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
                <SmartTable
                    columns={columns}
                    data={settingData?.data ?? []}
                    total={settingData?.page?.totalElements ?? 0}
                    loading={isLoading}
                    tableControls={tableControls}
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    style={{ border: `2px solid ${borderColor}`, boxShadow: `4px 4px 0px ${shadowColor}` }}
                />
            )}

            <FeedBackCreateEdit
                ref={createEditModalRef}
            />

            <FeedBackDeleteModal
                ref={deleteRef}
                currentPageItemCount={settingData?.page.totalElements}
                tableControls={tableControls}
            />
            <FeedBackBulkDeleteModal
                ref={bulkDeleteRef}
                totalItems={total}
                tableControls={tableControls}
            />
        </div>
    );
};

export default Feedbacks;
