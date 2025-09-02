import { SidebarComponent } from "@components/SidebarComponent";
import { SidebarProvider } from "@components/ui/sidebar";
import { Outlet, useLocation } from "react-router";
import Header from "../components/header";
import { SIDEBAR_NAVIGATION } from "../constants/navigation";

function MainLayout() {
  const location = useLocation();
  return (
    <SidebarProvider>
      <SidebarComponent
        navigation={SIDEBAR_NAVIGATION}
        currentPath={location.pathname}
      />
      <main className="min-h-screen w-full bg-background p-4">
        <Header />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default MainLayout;
