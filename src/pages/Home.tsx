import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { SplitCellsOutlined, MergeCellsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSplitClick = () => {
    navigate("/split");
  };

  const handleMergeClick = () => {
    navigate("/merge");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} lg={10}>
          <Card
            hoverable
            style={{
              textAlign: "center",
              border: "none",
              borderRadius: 16,
              height: 320,
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow:
                "0 4px 20px rgba(33, 150, 243, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 40 } }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(33, 150, 243, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(33, 150, 243, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <SplitCellsOutlined
              style={{
                fontSize: 48,
                color: "#2196F3",
                marginBottom: 16,
              }}
            />
            <Title
              level={3}
              style={{
                marginBottom: 16,
                background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.5px",
              }}
            >
              Excel拆分
            </Title>
            <Paragraph style={{ color: "#666", marginBottom: 24 }}>
              将大型Excel文件按指定行数拆分为多个小文件，支持保留原始格式或快速处理模式。
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={handleSplitClick}
              style={{
                background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                borderColor: "transparent",
                borderRadius: 12,
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(33, 150, 243, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(33, 150, 243, 0.3)";
              }}
            >
              开始拆分
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={10}>
          <Card
            hoverable
            style={{
              textAlign: "center",
              border: "none",
              borderRadius: 16,
              height: 320,
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow:
                "0 4px 20px rgba(76, 175, 80, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 40 } }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(76, 175, 80, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(76, 175, 80, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <MergeCellsOutlined
              style={{
                fontSize: 48,
                color: "#4CAF50",
                marginBottom: 16,
              }}
            />
            <Title
              level={3}
              style={{
                marginBottom: 16,
                background: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.5px",
              }}
            >
              Excel合并
            </Title>
            <Paragraph style={{ color: "#666", marginBottom: 24 }}>
              将多个Excel文件合并为一个文件，支持保留原始格式或快速处理模式。
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={handleMergeClick}
              style={{
                background: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
                borderColor: "transparent",
                borderRadius: 12,
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(76, 175, 80, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(76, 175, 80, 0.3)";
              }}
            >
              开始合并
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
