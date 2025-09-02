import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "../constants/routes";

const Home = () => {
  return <div>Home</div>;
};

const Login = () => {
  return <div>Login</div>;
};

const Dashboard = () => {
  return <div>Dashboard</div>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default AppRoutes;
