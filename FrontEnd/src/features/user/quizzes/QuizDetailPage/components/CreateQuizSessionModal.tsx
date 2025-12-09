import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import useCreateQuizSession from "@/hooks/quizSessionHook/useCreateQuizSession";
import { useNavigate } from "react-router-dom";

export interface CreateQuizSessionModalRef {
  open: (quizId: string) => void;
  close: () => void;
}

interface CreateQuizSessionModalProps {}

const CreateQuizSessionModal = forwardRef<CreateQuizSessionModalRef, CreateQuizSessionModalProps>(
  (props, ref) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quizId, setQuizId] = useState<string>("");
    const [form] = Form.useForm();
    const { createQuizSessionAsync, isLoading } = useCreateQuizSession();

    useImperativeHandle(ref, () => ({
      open: (id: string) => {
        setQuizId(id);
        // Generate a random 6-digit game PIN as default
        const defaultGamePin = Math.floor(100000 + Math.random() * 900000).toString();
        
        form.setFieldsValue({
          gamePin: defaultGamePin,
          timeForEachQuestion: 30,
        });
        
        setIsModalOpen(true);
      },
      close: () => {
        setIsModalOpen(false);
        form.resetFields();
      },
    }));

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        
        const session = await createQuizSessionAsync({
          quizId: quizId,
          gamePin: values.gamePin,
          timeForEachQuestion: values.timeForEachQuestion,
        });
        
        if (session) {
          message.success("Quiz session created successfully!");
          setIsModalOpen(false);
          form.resetFields();
          navigate(`/user/quizSession/play/${session.id}`);
        }
      } catch (error) {
        console.error("Failed to create quiz session:", error);
      }
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      form.resetFields();
    };

    return (
      <Modal
        title="Create Quiz Session"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        centered
        okText="Create Session"
        cancelText="Cancel"
        styles={{
          header: { fontFamily: '"Courier New", monospace', fontWeight: 'bold' },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ fontFamily: '"Courier New", monospace' }}
        >
          <Form.Item
            label="Game PIN"
            name="gamePin"
            rules={[
              { required: true, message: 'Please enter a game PIN' },
              { len: 6, message: 'Game PIN must be exactly 6 digits' },
              { pattern: /^\d{6}$/, message: 'Game PIN must contain only numbers' },
            ]}
          >
            <Input
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              style={{ fontFamily: '"Courier New", monospace', fontSize: '1.2rem', textAlign: 'center' }}
            />
          </Form.Item>

          <Form.Item
            label="Time per Question (seconds)"
            name="timeForEachQuestion"
            rules={[{ required: true, message: 'Please select time per question' }]}
          >
            <Select
              style={{ fontFamily: '"Courier New", monospace' }}
              options={[
                { label: '20 seconds', value: 20 },
                { label: '25 seconds', value: 25 },
                { label: '30 seconds', value: 30 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

CreateQuizSessionModal.displayName = "CreateQuizSessionModal";

export default CreateQuizSessionModal;
