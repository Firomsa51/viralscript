import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import {
  Library,
  Sparkles,
  BarChart3,
  Zap,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { href: "/generate", label: "Generator", icon: Sparkles },
    { href: "/library", label: "Library", icon: Library },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"
    : "U";

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto px-3 py-2 w-full justify-start hover:bg-muted">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{user?.fullName ?? user?.emailAddresses[0]?.emailAddress}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-medium">{user?.fullName ?? "My Account"}</span>
            <span className="text-xs text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col bg-background border-r border-border">
      <div className="p-6 flex items-center gap-3 text-primary font-bold text-xl tracking-tight uppercase">
        <Zap className="w-6 h-6 fill-primary" />
        ViralScript
      </div>
      <div className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:bg-muted ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <UserMenu />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex dark">
      {isMobile ? (
        <Sheet>
          <div className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-50 flex items-center px-4 md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight uppercase">
              <Zap className="w-5 h-5 fill-primary" />
              ViralScript
            </div>
          </div>
          <SheetContent side="left" className="p-0 w-[280px] bg-background border-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-[280px] h-screen sticky top-0">
          <SidebarContent />
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-screen max-w-full md:max-w-[calc(100vw-280px)] pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
