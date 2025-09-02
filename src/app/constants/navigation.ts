import { LayoutDashboard, Home } from "lucide-react";
import { ROUTES } from "./routes";

export const SIDEBAR_NAVIGATION = [
  {
    label: "Inicio",
    path: ROUTES.HOME,
    icon: Home,
  },
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
];
