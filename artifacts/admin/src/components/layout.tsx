import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Users, Award, ShieldCheck, Menu, BookOpen } from "lucide-react";
import { clearToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/content", label: "Content", icon: BookOpen },
  ];

  const NavLinks = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b">
        <ShieldCheck className="h-6 w-6 text-primary mr-2" />
        <span className="font-semibold text-lg tracking-tight">InternTrain</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 border-r bg-card flex-col hidden md:flex">
        <NavLinks />
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center">
            <ShieldCheck className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">InternTrain</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col w-64">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}