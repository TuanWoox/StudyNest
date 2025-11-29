import { Spin } from 'antd';

const SpinnerFull = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Spin size="large" />
        </div>
    )
};

export default SpinnerFull;