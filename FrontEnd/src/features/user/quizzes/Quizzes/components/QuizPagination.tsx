import React from "react";
import { Pagination, Grid } from "antd";


interface QuizPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const QuizPagination: React.FC<QuizPaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
}) => {
  const screens = Grid.useBreakpoint();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={!screens.xs}
        simple={screens.xs}
        showTotal={!screens.xs ? (total, range) => (
          <span style={{ fontFamily: "monospace" }}>
            {screens.md ? `${range[0]}-${range[1]} of ${total} quizzes` : `${total} quizzes`}
          </span>
        ) : undefined}
        pageSizeOptions={[6, 9, 15, 30]}

        style={{
          fontFamily: "monospace",
        }}
      />
    </div>
  );
};

export default QuizPagination;
