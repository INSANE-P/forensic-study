import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// ──────────────────────────────────────────────────────────────────────────
// GitHub Pages 배포 설정
// 레포를 https://<유저명>.github.io/<레포명>/ 형태(프로젝트 페이지)로 배포하면
// 자산 경로가 서브경로(/<레포명>/) 아래에 위치해야 한다.
//
// ✅ 레포 이름을 바꾸면 아래 REPO_NAME 한 곳만 수정하면 된다.
//    예) 레포명이 "dbsec-study" 이면 그대로, "my-study" 면 "my-study" 로.
//
// 만약 사용자 페이지(https://<유저명>.github.io/) 루트에 배포한다면 BASE를 "/" 로.
// ──────────────────────────────────────────────────────────────────────────
const REPO_NAME = "forensic-study";
const BASE = process.env.GITHUB_ACTIONS ? `/${REPO_NAME}/` : "/";

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
