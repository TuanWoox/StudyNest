import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTerminateQuizSession } from '@/hooks/quizSessionHook/useTerminateQuizSession';
import { useNavigate } from 'react-router-dom';

export interface TerminateQuizSessionModalRef {
  open: (sessionId: string) => void;
  close: () => void;
}

interface TerminateQuizSessionModalProps {
  onSuccess?: () => void;
}

const TerminateQuizSessionModal = forwardRef<TerminateQuizSessionModalRef, TerminateQuizSessionModalProps>(
  ({ onSuccess }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string>('');
    const { terminateQuizSessionAsync, isLoading } = useTerminateQuizSession();
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
      open: (sessionId: string) => {
        setCurrentSessionId(sessionId);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    }));

    const handleOk = async () => {
      if (currentSessionId) {
        try {
          await terminateQuizSessionAsync(currentSessionId);
          setIsOpen(false);
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/user/quiz');
          }
        } catch (error) {
          console.error('Terminate session error:', error);
        }
      }
    };

    const handleCancel = () => {
      setIsOpen(false);
    };

    return (
      <Modal
        title={
          <span style={{ fontFamily: '"Courier New", monospace', fontWeight: 'bold' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Terminate Quiz Session
          </span>
        }
        open={isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Terminate"
        cancelText="Cancel"
        centered
        okButtonProps={{
          danger: true,
          loading: isLoading,
          style: {
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            borderRadius: 0,
          },
        }}
        cancelButtonProps={{
          style: {
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            borderRadius: 0,
          },
        }}
        style={{
          fontFamily: '"Courier New", monospace',
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontFamily: '"Courier New", monospace', marginBottom: 8 }}>
            Are you sure you want to terminate this quiz session?
          </p>
          <p style={{ fontFamily: '"Courier New", monospace', color: '#ff4d4f', marginBottom: 0 }}>
            All players will be disconnected and the session will end permanently.
          </p>
        </div>
      </Modal>
    );
  }
);

TerminateQuizSessionModal.displayName = 'TerminateQuizSessionModal';

export default TerminateQuizSessionModal;
