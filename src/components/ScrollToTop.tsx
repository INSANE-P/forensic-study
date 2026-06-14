import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// 라우트가 바뀔 때마다 스크롤을 맨 위로 (긴 페이지 간 이동 시 위치 유지 방지)
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
