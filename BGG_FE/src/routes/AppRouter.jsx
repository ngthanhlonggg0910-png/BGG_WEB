import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import AccountInfo from "../pages/AccountInfo/AccountInfo";
import WarehouseList from "../pages/Warehouse/WarehouseList";
import WarehouseDetail from "../pages/Warehouse/WarehouseDetail";
import MaterialLocationUpdate from "../pages/Material/MaterialLocationUpdate";

// Kiểm tra user đã đăng nhập chưa
function PrivateRoute({ children }) {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Khi mở app tại "/"
function StartRoute() {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mở app */}
        <Route path="/" element={<StartRoute />} />

        {/* Login không cần bảo vệ */}
        <Route path="/login" element={<Login />} />

        {/* Các trang phải đăng nhập */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/infor"
          element={
            <PrivateRoute>
              <AccountInfo />
            </PrivateRoute>
          }
        />

        <Route path="/basket-detail" element={<WarehouseDetail />} />

        <Route
          path="/warehouse"
          element={
            <PrivateRoute>
              <WarehouseList />
            </PrivateRoute>
          }
        />

        <Route
          path="/warehouse/:warehouseCode"
          element={
            <PrivateRoute>
              <WarehouseDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/material-location-update"
          element={
            <PrivateRoute>
              <MaterialLocationUpdate />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
