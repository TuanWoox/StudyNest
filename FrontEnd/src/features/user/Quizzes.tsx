import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Flex,
  Card,
  Typography,
  Skeleton,
  Empty,
  Row,
  Col,
  Pagination,
  Input,
  theme,
} from "antd";
import { QuizList } from "@/types/quiz/quiz";
import {
  PlusOutlined,
  WarningOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useGetAllQuiz from "@/hooks/quizHook/useGetAllQuiz";
import useDeleteQuiz from "@/hooks/quizHook/useDeleteQuiz";
import { QuizCard } from "./quizzes/components";
import useDebounce from "@/hooks/common/useDebounce";

const { Title, Text } = Typography;
const { useToken } = theme;

const Quizzes: React.FC = () => {
  const { token } = useToken();

  // Pagination state
  const [page, setPage] = useState(1); // UI uses 1-based indexing
  const [pageSize, setPageSize] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Add custom styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (min-width: 768px) {
        .quiz-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .quiz-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
        }
        
        .quiz-view-btn {
          transition: all 0.3s ease;
        }
        
        .quiz-view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px ${token.colorPrimaryBgHover} !important;
        }
        
        .quiz-start-btn {
          transition: all 0.3s ease;
        }
        
        .quiz-start-btn:hover {
          transform: translateY(-2px);
        }
      }
      
      .quiz-card .quiz-title {
        transition: color 0.3s ease;
      }
      
      .quiz-card .quiz-title:hover {
        color: var(--ant-color-primary);
      }
      
      .quiz-card .quiz-more-btn {
        transition: all 0.3s ease;
      }
      
      .quiz-card .quiz-more-btn:hover {
        color: var(--ant-color-primary) !important;
        background-color: var(--ant-color-primary-bg) !important;
        transform: rotate(90deg);
      }
      
      @media (max-width: 767px) {
        .quiz-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }
      }
      
      .quiz-info-item {
        transition: all 0.3s ease;
      }
      
      .quiz-info-item:hover {
        transform: translateX(4px);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [token.colorPrimaryBgHover]);

  // Pass pagination parameters to the hook
  const {
    data: quizData,
    isPending,
    isError,
    error,
    refetch,
  } = useGetAllQuiz({
    pageNumber: page - 1, // Convert to 0-based for API
    pageSize,
    sortByNewest: true,
    searchTerm: debouncedSearchTerm,
  });

  const { deleteQuizAsync, isLoading } = useDeleteQuiz();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract quizzes from the paged data structure
  const quizzes = quizData?.data || [];
  const totalElements = quizData?.page.totalElements || 0;

  // Check if there are no quizzes
  const hasQuizzes = quizzes && quizzes.length > 0;

  // Handle pagination change
  const handleTableChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // Handle quiz deletion
  const handleDelete = async (quizId: string) => {
    setDeletingId(quizId);
    try {
      await deleteQuizAsync(quizId);
      // Check if we're deleting the last item on the current page
      const currentPageItemCount = quizzes.length;
      const isLastItemOnPage = currentPageItemCount === 1;
      const isNotFirstPage = page > 1;

      if (isLastItemOnPage && isNotFirstPage) {
        setPage(page - 1);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Render error state
  if (isError || (!isPending && !quizData)) {
    return (
      <Card
        style={{
          width: "100%",
          height: "100%",
          boxShadow: token.boxShadowSecondary,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{
          padding: window.innerWidth < 768 ? 16 : 32,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
        }}
      >
        <Empty
          image={
            <WarningOutlined
              style={{
                fontSize: window.innerWidth < 576 ? 36 : 48,
                color: token.colorError,
              }}
            />
          }
          description={
            <Text
              type="danger"
              style={{ fontSize: window.innerWidth < 576 ? 13 : 14 }}
            >
              {error?.message || "Failed to load quizzes"}
            </Text>
          }
        >
          <Button
            type="primary"
            onClick={() => refetch()}
            size={window.innerWidth < 576 ? "middle" : "large"}
          >
            Try Again
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      style={{
        width: "100%",
        height: "100%",
        boxShadow: token.boxShadowSecondary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: token.borderRadiusLG,
      }}
      bodyStyle={{
        padding: window.innerWidth < 768 ? 20 : 40,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{
          marginBottom: window.innerWidth < 768 ? 32 : 20,
          paddingBottom: window.innerWidth < 768 ? 24 : 12,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{ flex: window.innerWidth < 576 ? "1 1 100%" : "0 1 auto" }}
        >
          <Title
            level={window.innerWidth < 576 ? 3 : 2}
            style={{
              margin: 0,
              fontWeight: 700,
            }}
          >
            📚 AI Quiz Generator
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: window.innerWidth < 576 ? 13 : 15,
              fontWeight: 500,
              marginTop: 8,
              display: "block",
            }}
          >
            Create, take and manage your quizzes with ease.
          </Text>
        </div>
        <Flex gap={8} wrap="wrap">
          <Input
            placeholder="Search quizzes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: 220,
              borderRadius: token.borderRadius,
            }}
            size="large"
            allowClear
          />
          <Link to="/user/quiz/generate">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{
                borderRadius: token.borderRadius,
                fontWeight: 600,
                height: 40,
              }}
            >
              Generate Quiz
            </Button>
          </Link>
        </Flex>
      </Flex>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingTop: "10px",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
        }}
      >
        {isPending ? (
          // Loading skeleton cards
          <Row
            gutter={[
              window.innerWidth < 576 ? 12 : 20,
              window.innerWidth < 576 ? 12 : 20,
            ]}
            style={{
              marginBottom: window.innerWidth < 768 ? 16 : 24,
            }}
          >
            {[...Array(pageSize)].map((_, index) => (
              <Col key={index} xs={24} sm={12} md={12} lg={8} xl={6} xxl={4.8}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : hasQuizzes ? (
          <>
            {/* Quiz Cards Grid */}
            <Row
              gutter={[
                window.innerWidth < 576 ? 12 : 20,
                window.innerWidth < 576 ? 12 : 20,
              ]}
              style={{
                marginBottom: window.innerWidth < 768 ? 16 : 24,
                scrollbarWidth: "thin",
              }}
            >
              {quizzes.map((quiz, index) => (
                <Col
                  key={quiz.id}
                  xs={24}
                  sm={12}
                  md={12}
                  lg={8}
                  xl={6}
                  xxl={4.8}
                >
                  <QuizCard
                    quiz={quiz}
                    index={index}
                    page={page}
                    pageSize={pageSize}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    isDeleting={isLoading}
                  />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <Flex
              justify="center"
              style={{
                paddingTop: window.innerWidth < 768 ? 8 : 16,
                paddingBottom: window.innerWidth < 768 ? 8 : 16,
                position: "sticky",
                bottom: 0,
                zIndex: 10,
              }}
            >
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalElements}
                onChange={handleTableChange}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} quizzes`
                }
              />
            </Flex>
          </>
        ) : (
          <Empty
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
            description="No quizzes found. Generate your first quiz!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/user/quiz/generate">
              <Button type="primary" icon={<PlusOutlined />}>
                Generate Quiz
              </Button>
            </Link>
          </Empty>
        )}
      </div>
    </Card>
  );
};

export default Quizzes;
