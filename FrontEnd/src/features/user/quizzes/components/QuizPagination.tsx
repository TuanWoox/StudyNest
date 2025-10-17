import { Flex, Pagination, Grid, theme } from "antd";

export default function QuizPagination({
  page,
  pageSize,
  totalElements,
  handleTableChange,
}: {
  page: number;
  pageSize: number;
  totalElements: number;
  handleTableChange: (page: number, pageSize: number) => void;
}) {
  const screens = Grid.useBreakpoint(); // xs, sm, md, lg, ...
  const { token } = theme.useToken();
  const isMobile = !screens.md; // < md

  return (
    <Flex
      justify="center"
      style={{
        paddingTop: isMobile ? 8 : 16,
        paddingBottom: isMobile ? 8 : 16,
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        background: "transparent",
      }}
    >
      <div
        style={{
          maxWidth: isMobile ? 560 : 960, // keep it comfy
          margin: "0 auto",
          padding: isMobile ? "6px 10px" : "8px 16px",
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: isMobile ? 8 : 12,
          boxShadow: isMobile
            ? "0 2px 8px rgba(0,0,0,0.15)"
            : "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <Pagination
          current={page}
          pageSize={pageSize}
          total={totalElements}
          onChange={handleTableChange}
          showSizeChanger={false}
          size={isMobile ? "small" : "default"}
          responsive
          showLessItems={isMobile}
          simple={false}
          showTotal={(total, range) => (
            <span
              style={{
                color: token.colorTextSecondary,
                fontWeight: 500,
                fontSize: isMobile ? 12 : 14,
              }}
            >
              {range[0]}–{range[1]} of <b>{total}</b> quizzes
            </span>
          )}
        />
      </div>
    </Flex>
  );
}
