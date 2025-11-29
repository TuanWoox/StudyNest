import {
    DashboardOutlined,
    UserOutlined,
    MessageOutlined,
    FileTextOutlined,
    EditOutlined,
    SettingOutlined,
} from '@ant-design/icons';

export const adminMenus = [
    { path: '/admin/settings', name: 'Settings', icon: <SettingOutlined /> },
    { path: '/admin/feedbacks', name: 'Feedback', icon: <MessageOutlined /> },

];

export const userMenus = [
    { path: '/user/notes', name: 'Notes', icon: <FileTextOutlined /> },
    { path: '/user/quiz', name: 'Quiz', icon: <EditOutlined /> },
    { path: '/user/feedbacks', name: 'Feedback', icon: <MessageOutlined /> },
];
