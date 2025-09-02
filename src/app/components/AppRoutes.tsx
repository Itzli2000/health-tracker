import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "../constants/routes";
import MainLayout from "../layouts/mainLayout";
import { lazy } from "react";

const Login = () => {
  return <div>Login</div>;
};

const DashboardComponent = lazy(() => import("@/domains/dashboard"));

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.HOME} element={<MainLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardComponent />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
