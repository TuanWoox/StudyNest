import React from "react";
import { Pagination, theme, Grid } from "antd";

const { useToken } = theme;

interface QuizHistoryPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const QuizHistoryPagination: React.FC<QuizHistoryPaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
}) => {
  const { token } = useToken();
  const screens = Grid.useBreakpoint();

  return (
    <div
      style={{
        marginTop: 32,
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
            {screens.md ? `${range[0]}-${range[1]} of ${total} attempts` : `${total} attempts`}
          </span>
        ) : undefined}
        pageSizeOptions={[5, 10, 20, 50]}
        style={{
          fontFamily: "monospace",
        }}
      />
    </div>
  );
};

export default QuizHistoryPagination;
