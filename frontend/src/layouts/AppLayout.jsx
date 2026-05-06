import { BarChart3, FolderKanban, KanbanSquare, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: KanbanSquare },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.theme === "dark");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.theme = dark ? "dark" : "light";
  }, [dark]);

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r bg-card px-4 py-5">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Team Task Manager</p>
          <p className="text-sm text-muted-foreground">{user?.role || "Member"}</p>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-accent text-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-2">
        <Button variant="outline" className="w-full justify-start" onClick={() => setDark((value) => !value)}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? "Light mode" : "Dark mode"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        {sidebar}
      </div>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">{user?.first_name || user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
