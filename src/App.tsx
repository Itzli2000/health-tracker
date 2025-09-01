import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@components/ui/button";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <ModeToggle />
        <h1>Hello World</h1>
        <Button>Click me</Button>
      </div>
    </ThemeProvider>
  );
}

export default App;
