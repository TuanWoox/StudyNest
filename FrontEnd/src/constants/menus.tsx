import {
    MessageOutlined,
    FileTextOutlined,
    EditOutlined,
    SettingOutlined,
    GlobalOutlined,
    ReconciliationOutlined,
} from '@ant-design/icons';

export const adminMenus = [
    { path: '/admin/settings', name: 'Settings', icon: <SettingOutlined /> },
    { path: '/admin/feedbacks', name: 'Feedback', icon: <MessageOutlined /> },

];

export const userMenus = [
    { path: '/user/notes', name: 'Notes', icon: <FileTextOutlined /> },
    {
        name: 'Quiz',
        icon: <EditOutlined />,
        children: [
            { path: '/user/quiz', name: 'My Quizzes', key: '/user/quiz', icon: <ReconciliationOutlined /> },
            { path: '/user/exploreQuiz', name: 'Explore', key: '/exploreQuiz', icon: <GlobalOutlined /> },
        ]
    },
    { path: '/user/feedbacks', name: 'Feedback', icon: <MessageOutlined /> },
];
