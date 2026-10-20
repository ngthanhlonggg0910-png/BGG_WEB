import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { getCurrentUser } from "../shared/auth/session";

import Login from "../features/auth/pages/LoginPage";
import Home from "../features/home/pages/HomePage";
import AccountInfo from "../features/account/pages/AccountInfoPage";
import WarehouseList from "../features/warehouse/pages/WarehouseListPage";
import MaterialLocationUpdate from "../features/material-location/pages/MaterialLocationUpdatePage";
import PickingOrderList from "../features/picking-order/pages/PickingOrderList";
import PickingOrderDetail from "../features/picking-order/pages/PickingOrderDetail";
import PickingOrderScan from "../features/picking-order/pages/PickingOrderScan";
import PickingOrderMaterialList from "../features/picking-order/pages/PickingOrderMaterialList";
import FabricInspectionList from "../features/fabric-inspection/pages/FabricInspectionList";
import FabricInspectionRollListPage from "../features/fabric-inspection/pages/FabricInspectionRollList";

// Kiểm tra user đã đăng nhập chưa
function PrivateRoute({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Khi mở app tại "/"
function StartRoute() {
  const user = getCurrentUser();

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
          path="/picking-orders"
          element={
            <PrivateRoute>
              <PickingOrderList />
            </PrivateRoute>
          }
        />

        <Route
          path="/picking-order-detail"
          element={
            <PrivateRoute>
              <PickingOrderDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/picking-order-scan"
          element={
            <PrivateRoute>
              <PickingOrderScan />
            </PrivateRoute>
          }
        />

        <Route
          path="/picking-order-materials"
          element={
            <PrivateRoute>
              <PickingOrderMaterialList />
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

        <Route
          path="/warehouse"
          element={
            <PrivateRoute>
              <WarehouseList />
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

        <Route
          path="/fabric-inspection"
          element={
            <PrivateRoute>
              <FabricInspectionList />
            </PrivateRoute>
          }
        />

        <Route
          path="/fabric-inspection/:pkvId/rolls"
          element={
            <PrivateRoute>
              <FabricInspectionRollListPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
