import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '../views/dashboard/index';
import UserInputPage from '../views/userinput';
import DefaultLayout from '../layouts/dashboard/default'; // ✅ 여기!

const HorizontalRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <DefaultLayout>
            <Index />
          </DefaultLayout>
        }
      />
      <Route
        path="/userinput"
        element={
          <DefaultLayout>
            <UserInputPage />
          </DefaultLayout>
        }
      />
    </Routes>
  );
};

export default HorizontalRouter;


// 이 컴포넌트는 React Router를 사용하여 대시보드와 사용자 입력 페이지를 라우팅합니다.
// /dashboard 경로는 대시보드 컴포넌트를 렌더링하고,
// /userinput 경로는 사용자 입력 페이지 컴포넌트를 렌더링합니다.
// 이 구조는 애플리케이션의 주요 라우팅을 관리하며, 각  경로에 해당하는 컴포넌트를 렌더링합니다.
// HorizontalRouter 컴포넌트는 애플리케이션의 주요 라우팅을 담당합니다.
// 이 컴포넌트는 React Router의 Routes와 Route를 사용하여 대시보드와 사용자 입력 페이지를 정의합니다.