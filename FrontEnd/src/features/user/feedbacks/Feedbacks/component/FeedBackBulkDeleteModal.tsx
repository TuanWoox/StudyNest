import React, { forwardRef, useImperativeHandle, useState } from "react";
import ModalConfirm from "@/components/ModalConfirm/ModalConfirm";
import useDeleteSelectedFeedbacks from "@/hooks/feedbackHook/useDeleteSelectedFeedBacks";
import { Page } from "@/types/common/page";

export interface FeedBackBulkDeleteRef {
    open: (selected: string[]) => void;
    close: () => void;
}

interface FeedBackBulkDeleteModalProps {
    tableControls: any; // <-- pass tableControls
    totalItems: number;
}

const FeedBackBulkDeleteModal = forwardRef<FeedBackBulkDeleteRef, FeedBackBulkDeleteModalProps>(
    ({ tableControls, totalItems }, ref) => {
        const { deleteFeedbacksAsync, isLoading: deleting } = useDeleteSelectedFeedbacks();
        const [visible, setVisible] = useState(false);
        const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

        useImperativeHandle(ref, () => ({
            open: (selected: string[]) => {
                setSelectedKeys(selected);
                setVisible(true);
            },
            close: () => setVisible(false),
        }));

        const handleBulkDelete = async () => {
            if (!selectedKeys.length) return;

            try {
                const payload: Page<string> = {
                    size: selectedKeys.length,
                    pageNumber: tableControls.pageNumber,
                    totalElements: selectedKeys.length,
                    orders: [],
                    filter: [],
                    selected: selectedKeys,
                };

                await deleteFeedbacksAsync(payload);

                // Recalculate page number if needed
                const remainingItems = totalItems - selectedKeys.length;
                const newPageNumber =
                    remainingItems > 0
                        ? Math.min(
                            tableControls.pageNumber,
                            Math.floor((remainingItems - 1) / tableControls.pageSize)
                        )
                        : 0;

                tableControls.setPageNumber(newPageNumber);

                setSelectedKeys([]);
                setVisible(false);
            } catch (error) {
                console.error("Bulk delete failed", error);
            }
        };

        return (
            <ModalConfirm
                open={visible}
                title={`Delete ${selectedKeys.length} feedback(s)?`}
                content={
                    <>
                        Are you sure you want to <b style={{ color: "#DC2626" }}>permanently delete</b> these feedbacks?
                        <br />
                        This action cannot be undone.
                    </>
                }
                okText="Delete"
                cancelText="Cancel"
                danger
                loading={deleting}
                onOk={handleBulkDelete}
                onCancel={() => setVisible(false)}
            />
        );
    }
);

FeedBackBulkDeleteModal.displayName = "FeedBackBulkDeleteModal";

export default FeedBackBulkDeleteModal;
