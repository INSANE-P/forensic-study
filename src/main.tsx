import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

// BrowserRouter 사용 (URL에 # 없음).
// GitHub Pages 서브경로 배포 시 basename = base 경로(import.meta.env.BASE_URL).
// 새로고침/딥링크 404는 public/404.html 의 SPA 폴백 스크립트가 처리한다.
const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
