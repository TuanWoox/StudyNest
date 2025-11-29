import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input, Rate, Select, ModalProps } from "antd";
import ActionButtons from "@/features/user/notes/NoteEditor/components/ActionButtons";
import { CreateFeedBackDTO } from "@/types/feedback/createFeedBackDTO";
import { UpdateFeedBackDTO } from "@/types/feedback/updateFeedBackDTO";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import { useAntDesignTheme } from "@/hooks/common";
import StudynestModal from "@/components/StudyNestModal/StudynestModal";
import useCreateFeedback from "@/hooks/feedbackHook/useCreateFeedBack";
import useUpdateFeedback from "@/hooks/feedbackHook/useUpdateFeedBack";
import { EFeedBackStatus } from "@/utils/enums/EFeedBackStatus";

interface FeedBackCreateEditRef {
    open: (editing?: FeedBackDTO | null) => void;
    close: () => void;
}

interface FeedBackCreateEditProps {
    categories?: string[];
}

const FeedBackCreateEdit = forwardRef<FeedBackCreateEditRef, FeedBackCreateEditProps>(
    ({ categories = ["UI", "UX", "Performance", "Bug"] }, ref) => {
        const { bgColor, borderColor, shadowColor, textColor } = useAntDesignTheme();
        const [visible, setVisible] = useState(false);
        const [currentEditing, setCurrentEditing] = useState<FeedBackDTO | null>(null);
        const [status, setStatus] = useState<EFeedBackStatus>(EFeedBackStatus.Pending);
        const [form] = Form.useForm();
        const [initialFormValues, setInitialFormValues] = useState<any>(null);

        const { createFeedback, isLoading: isCreating } = useCreateFeedback();
        const { updateFeedback, isLoading: isUpdating } = useUpdateFeedback();

        const customStyles: ModalProps["styles"] = {
            mask: {
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
            },
            content: {
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                padding: 20,
                fontFamily: '"Courier New", monospace',
                color: textColor,
                maxWidth: "70vw",
            },
        };

        useImperativeHandle(ref, () => ({
            open: (record?: FeedBackDTO | null) => {
                const defaultValue = { rating: 0 };
                setCurrentEditing(record || null);
                form.resetFields();
                form.setFieldsValue(record || defaultValue);
                setInitialFormValues(record || defaultValue);
                setStatus(record?.status ?? EFeedBackStatus.Pending);
                setVisible(true);
            },
            close: () => {
                setInitialFormValues(null);
                setVisible(false);
            },
        }));

        const handleSave = async () => {
            try {
                const values = await form.validateFields();

                if (currentEditing) {
                    const payload: UpdateFeedBackDTO = {
                        id: currentEditing.id,
                        ...values
                    };
                    updateFeedback(payload, {
                        onSuccess: () => {
                            setInitialFormValues(null);
                            setVisible(false);
                        }
                    });
                } else {
                    const payload: CreateFeedBackDTO = {
                        id: "",
                        ...values
                    };
                    createFeedback(payload, {
                        onSuccess: () => {
                            setInitialFormValues(null);
                            setVisible(false);
                        }
                    });
                }
            } catch (error) {
                console.error("Validation failed:", error);
            }
        };

        const hasUnsavedChanges = () => {
            if (!initialFormValues) return false;
            const currentValues = form.getFieldsValue();
            const fieldsToCompare = ['category', 'rating', 'description', 'status'];

            return fieldsToCompare.some(field =>
                initialFormValues[field] !== currentValues[field]
            );
        };


        return (
            <StudynestModal
                title={currentEditing ? "Edit Feedback" : "Create New Feedback"}
                visible={visible}
                onClose={() => setVisible(false)}
                customFooter={
                    <ActionButtons
                        onSave={handleSave}
                        onClose={() => setVisible(false)}
                        isCreating={isCreating}
                        isUpdating={isUpdating}
                        confirmBeforeClose={hasUnsavedChanges}
                    />
                }
                customStyles={customStyles}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: "Please select a category" }]}
                    >
                        <Select placeholder="Select a category">
                            {categories.map((cat) => (
                                <Select.Option key={cat} value={cat}>
                                    {cat}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Rating"
                        name="rating"
                        rules={[{ required: true, message: "Please provide a rating" }]}
                    >
                        <Rate />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: "Please enter a description" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter feedback description" />
                    </Form.Item>

                    {currentEditing && (
                        <>
                            <Form.Item label="Status" name="status">
                                <Select
                                    value={status}
                                    onChange={(value: EFeedBackStatus) => setStatus(value)}
                                    placeholder="Select status"
                                >
                                    <Select.Option value={EFeedBackStatus.Pending}>Pending</Select.Option>
                                    <Select.Option value={EFeedBackStatus.InQueue}>In Queue</Select.Option>
                                    <Select.Option value={EFeedBackStatus.Done}>Done</Select.Option>
                                    <Select.Option value={EFeedBackStatus.Rejected}>Rejected</Select.Option>
                                </Select>
                            </Form.Item>

                            {status === EFeedBackStatus.Rejected && (
                                <Form.Item
                                    label="Rejected Reason"
                                    name="rejectedReason"
                                    rules={[{ required: true, message: "Please provide a rejected reason" }]}
                                >
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="Enter rejected reason"
                                        style={{ color: "#DC2626" }}
                                    />
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form>
            </StudynestModal>
        );
    }
);

FeedBackCreateEdit.displayName = "FeedBackCreateEdit";

export default FeedBackCreateEdit;
export type { FeedBackCreateEditRef };
