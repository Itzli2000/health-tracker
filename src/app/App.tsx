import { ThemeProvider } from "@/app/providers/theme-provider";
import { ModeToggle } from "@components/mode-toggle";
import { Button } from "@components/ui/button";
import { BrowserRouter } from "react-router";
import "./App.css";
import AppRoutes from "./components/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <div className="flex flex-col items-center justify-center h-screen bg-background">
          <ModeToggle />
          <h1>Hello World</h1>
          <Button>Click me</Button>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
