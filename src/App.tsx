import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import Layout from "./components/Layout";
import Split from "./pages/Split";
import Merge from "./pages/Merge";

import "./App.css";

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/split" replace />} />
            <Route path="/split" element={<Split />} />
            <Route path="/merge" element={<Merge />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
