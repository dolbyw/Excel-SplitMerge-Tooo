import React from "react";
import { Layout as AntLayout, Typography, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileExcelOutlined,
  SplitCellsOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/split",
      icon: <SplitCellsOutlined />,
      label: "Excel拆分",
    },
    {
      key: "/merge",
      icon: <MergeCellsOutlined />,
      label: "Excel合并",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <FileExcelOutlined
            style={{
              fontSize: 28,
              color: "white",
              marginRight: 12,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
          <Title
            level={3}
            style={{
              color: "white",
              margin: 0,
              fontWeight: 700,
              fontSize: 24,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              letterSpacing: "-0.5px",
            }}
          >
            Excel处理工具
          </Title>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 16,
            fontWeight: 500,
          }}
          theme="dark"
        />
      </Header>

      <Content
        style={{
          padding: "32px",
          background: "linear-gradient(180deg, #fafafa 0%, #f0f2f5 100%)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;
