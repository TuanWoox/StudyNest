import React, { forwardRef, useImperativeHandle, useState } from "react";
import ModalConfirm from "@/components/ModalConfirm/ModalConfirm";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import useDeleteFeedBack from "@/hooks/feedbackHook/useDeleteFeedBack";

export interface FeedBackDeleteRef {
    open: (feedback: FeedBackDTO) => void;
    close: () => void;
}

interface FeedBackDeleteModalProps {
    tableControls: any;
    currentPageItemCount: number | undefined;
}

const FeedBackDeleteModal = forwardRef<FeedBackDeleteRef, FeedBackDeleteModalProps>(
    ({ tableControls, currentPageItemCount }, ref) => {
        const { deleteFeedback, isLoading: deleting } = useDeleteFeedBack();
        const [visible, setVisible] = useState(false);
        const [current, setCurrent] = useState<FeedBackDTO | null>(null);

        useImperativeHandle(ref, () => ({
            open: (feedback: FeedBackDTO) => {
                setCurrent(feedback);
                setVisible(true);
            },
            close: () => setVisible(false),
        }));

        const handleDelete = () => {
            if (!current) return;

            try {
                deleteFeedback(current.id, {
                    onSuccess: () => {
                        setVisible(false);

                        // Adjust page number if deleting the last item on the page
                        const isLastItemOnPage = currentPageItemCount === 1;
                        const isNotFirstPage = tableControls.pageNumber > 1;

                        if (isLastItemOnPage && isNotFirstPage) {
                            tableControls.setPageNumber(tableControls.pageNumber - 1);
                        }
                    },
                });
            } catch (error) {
                console.error("Delete failed", error);
            }
        };

        return (
            <ModalConfirm
                open={visible}
                title="Confirm Feedback Deletion"
                content={
                    <>
                        Are you sure you want to <b style={{ color: "#DC2626" }}>permanently delete</b> this feedback?
                        <br />
                        This action cannot be undone.
                    </>
                }
                okText={deleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                danger
                loading={deleting}
                onOk={handleDelete}
                onCancel={() => setVisible(false)}
            />
        );
    }
);

FeedBackDeleteModal.displayName = "FeedBackDeleteModal";

export default FeedBackDeleteModal;
