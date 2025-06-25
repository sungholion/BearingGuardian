import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

//scss
import "./assets/scss/hope-ui.scss";
import "./assets/scss/custom.scss";
import "./assets/scss/dark.scss";
import "./assets/scss/rtl.scss";
import "./assets/scss/customizer.scss";

// Redux
import { useDispatch } from "react-redux";
import { setSetting } from "./store/setting/actions";

// Router
import HorizontalRouter from "./router/horizontal-router";  // ⬅️ 라우터 임포트

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSetting());
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <HorizontalRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
// 이 컴포넌트는 애플리케이션의 메인 컴포넌트로, 전체 구조를 정의합니다.
// - React Router를 사용하여 라우팅을 설정하고,
// - Redux를 사용하여 전역 상태 관리를 설정합니다.
// - SCSS 파일을 임포트하여 스타일을 적용합니다.
// - `HorizontalRouter` 컴포넌트를 사용하여 애플리케이션의 주요 라우팅을 관리합니다.
// - `useEffect` 훅을 사용하여 컴포넌트가 마운트될 때 Redux 설정을 초기화합니다.
// - `BrowserRouter`를 사용하여 SPA(Single Page Application) 라우팅을 구현합니다.
// - 이 구조는 애플리케이션의 전반적인 레이아웃과 라우팅을 관리합니다.
// - `useDispatch` 훅을 사용하여 Redux 액션을 디스패치하고, `setSetting` 액션을 통해 초기 설정을 불러옵니다.
// - 이 컴포넌트는 애플리케이션의 진입점 역할
