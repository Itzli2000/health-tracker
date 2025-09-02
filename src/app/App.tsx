import { ThemeProvider } from "@/app/providers/theme-provider";
import { BrowserRouter } from "react-router";
import "./App.css";
import AppRoutes from "./components/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
