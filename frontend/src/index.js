import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// router
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// redux
import { Provider } from "react-redux";
import { store } from "./store";

// components
import DefaultLayout from "./layouts/dashboard/default";
import Dashboard from "./views/dashboard";

import { IndexRouters } from "./router";
import { SimpleRouter } from "./router/simple-router";
import { DefaultRouter } from "./router/default-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true, // == path: ""
        element: <Dashboard />,
      },
      // 기존 라우터도 이 children 배열에 추가할 수 있음
      ...DefaultRouter,
      ...IndexRouters,
      ...SimpleRouter,
    ],
  },
], { basename: process.env.PUBLIC_URL });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App>
        <RouterProvider router={router} />
      </App>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
