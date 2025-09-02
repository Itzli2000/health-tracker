import { ModeToggle } from "@/shared/components/mode-toggle";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

function Header() {
  return (
    <div className="flex items-center justify-start bg-background gap-2">
      <SidebarTrigger />
      <ModeToggle />
    </div>
  );
}

export default Header;
