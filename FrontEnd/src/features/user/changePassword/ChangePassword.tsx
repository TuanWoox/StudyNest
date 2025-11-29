import React from "react";
import { Form, Input, Button, Typography, Space, Grid, Divider, Spin } from "antd";
import useChangePassword from "@/hooks/authHook/useChangePassword";
import useHasPassword from "@/hooks/authHook/useHasPassword";
import { UserChangePassword, UserSetPassword } from "@/types/auth/userChangePassword";
import { useAntDesignTheme } from "@/hooks/common";
import useSetPassword from "@/hooks/authHook/useSetPassword";

const { Title, Text } = Typography;

const ChangePassword: React.FC = () => {
    const screens = Grid.useBreakpoint();
    const { shadowColor, bgColor } = useAntDesignTheme();
    const [form] = Form.useForm<UserChangePassword & { confirmPassword?: string }>();
    const { changePasswordAsync, isLoading: changing } = useChangePassword();
    const { setPasswordAsync, isLoading: setting } = useSetPassword();
    const { data: hasData, isLoading: checking } = useHasPassword();
    const hasPassword = !!hasData?.result;

    const onFinish = async (values: any) => {
        if (hasPassword) {
            const payload: UserChangePassword = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            };
            try {
                await changePasswordAsync(payload);
                form.resetFields();
            } catch {
                // error handled in hook
            }
        } else {
            const payload: UserSetPassword = { newPassword: values.newPassword };
            try {
                await setPasswordAsync(payload);
                form.resetFields();
            } catch {
                // error handled in mutation
            }
        }
    };

    if (checking) {
        return (
            <div className="w-full h-full overflow-y-auto px-6 pt-4 pb-5" style={{ backgroundColor: bgColor }}>
                <Spin tip="Checking account..." />
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto px-6 pt-4 pb-5"
            style={{
                backgroundColor: bgColor,
                scrollbarWidth: "none",
            }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ flex: screens.xs ? "1 1 100%" : "0 0 auto", minWidth: screens.xs ? "100%" : 250 }}>
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            fontWeight: 700,
                        }}
                    >
                        {hasPassword ? "Change Password" : "Set Password"}
                    </Title>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 15,
                            marginTop: 4,
                            display: "block",
                        }}
                    >
                        {hasPassword
                            ? "Update your password to keep your account secure"
                            : "You don't have a password yet — create one now"}
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
                >
                    {hasPassword && (
                        <Form.Item
                            name="currentPassword"
                            label="Current password"
                            rules={[{ required: true, message: "Please enter your current password" }]}
                        >
                            <Input.Password placeholder="Current password" />
                        </Form.Item>
                    )}

                    <Divider style={{
                        backgroundColor: shadowColor
                    }} />

                    <Form.Item
                        name="newPassword"
                        label={hasPassword ? "New password" : "New password (create)"}
                        rules={[
                            { required: true, message: "Please enter a new password" },
                            { min: 6, message: "Password should be at least 6 characters" },
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="New password" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm new password"
                        dependencies={["newPassword"]}
                        hasFeedback
                        rules={[
                            { required: true, message: "Please confirm your new password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm new password" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={changing || setting}
                            >
                                {hasPassword ? "Change password" : "Set password"}
                            </Button>
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </div>
    );
};

export default ChangePassword;
