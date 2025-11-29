import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input } from "antd";
import StudynestModal from "@/components/StudyNestModal/StudynestModal";
import ActionButtons from "@/features/user/notes/NoteEditor/components/ActionButtons";
import { useAntDesignTheme } from "@/hooks/common";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import { UpdateFeedBackDTO } from "@/types/feedback/updateFeedBackDTO";
import useUpdateFeedback from "@/hooks/feedbackHook/useUpdateFeedBack";
import { EFeedBackStatus } from "@/utils/enums/EFeedBackStatus";

export interface FeedBackRejectModalRef {
    open: (feedback: FeedBackDTO) => void;
    close: () => void;
}

const FeedBackRejectModal = forwardRef<FeedBackRejectModalRef>((_, ref) => {
    const { bgColor, borderColor, shadowColor, textColor } = useAntDesignTheme();
    const { updateFeedback } = useUpdateFeedback();

    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState<FeedBackDTO | null>(null);

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        open: (feedback: FeedBackDTO) => {
            setCurrent(feedback);
            form.setFieldsValue({ rejectedReason: feedback.rejectedReason || "" });
            setVisible(true);
        },
        close: () => setVisible(false),
    }));

    const handleSave = () => {
        form.validateFields().then((values) => {
            if (!current) return;

            const payload: UpdateFeedBackDTO = {
                ...current,
                status: EFeedBackStatus.Rejected,
                rejectedReason: values.rejectedReason,
            };

            updateFeedback(payload);
            setVisible(false);
        });
    };

    const customStyles = {
        mask: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        content: {
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            boxShadow: `4px 4px 0 ${shadowColor}`,
            padding: 20,
            fontFamily: '"Courier New", monospace',
            color: textColor,
            maxWidth: "50vw",
        },
    };

    return (
        <StudynestModal
            visible={visible}
            title="Reject Feedback"
            onClose={() => setVisible(false)}
            customFooter={
                <div className="mt-2 flex justify-end">
                    <ActionButtons onSave={handleSave} onClose={() => setVisible(false)} confirmBeforeClose />
                </div>
            }
            customStyles={customStyles}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="rejectedReason"
                    label="Reason for Rejection"
                    rules={[{ required: true, message: "Please provide a reason" }]}
                >
                    <Input.TextArea rows={4} placeholder="Enter reason for rejecting this feedback" />
                </Form.Item>
            </Form>
        </StudynestModal>
    );
});

FeedBackRejectModal.displayName = "FeedBackRejectModal";

export default FeedBackRejectModal;
