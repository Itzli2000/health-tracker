import { ModeToggle } from "@components/mode-toggle";
import { SidebarTrigger } from "@components/ui/sidebar";

function Header() {
  return (
    <div className="flex items-center justify-start bg-background gap-2">
      <SidebarTrigger />
      <ModeToggle />
    </div>
  );
}

export default Header;
