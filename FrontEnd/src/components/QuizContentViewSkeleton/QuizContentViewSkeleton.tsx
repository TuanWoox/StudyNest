import { Skeleton } from "antd";


const QuizContentViewSkeleton = () => {
    return (
        <div className="w-full lg:max-w-5xl m-auto p-4">
            <Skeleton active paragraph={{ rows: 2 }} className="mb-6" />
            <Skeleton active paragraph={{ rows: 1 }} className="mb-6" />
            <Skeleton active paragraph={{ rows: 8 }} className="mb-6" />
            <Skeleton.Button active size="large" block className="mb-4" />
        </div>
    );

};

export default QuizContentViewSkeleton;
