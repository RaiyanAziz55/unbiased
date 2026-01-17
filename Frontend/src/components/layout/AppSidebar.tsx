import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Users,
  Target,
  Sparkles,
  Shield,
  Building2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analyze Post", url: "/analyze", icon: Search },
  { title: "Track Pages", url: "/track", icon: Users },
];

const insightsItems = [
  { title: "Balance Tuner", url: "/balance", icon: Target },
  { title: "Opposing Views", url: "/opposing", icon: Sparkles },
];

const transparencyItems = [
  { title: "Funding & Entities", url: "/funding", icon: Building2, placeholder: true },
  { title: "High Profiles", url: "/profiles", icon: Shield, placeholder: true },
];

const footerItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: { title: string; url: string; icon: any; placeholder?: boolean }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.url === "/"}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-sidebar-accent",
            item.placeholder && "opacity-60"
          )}
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {item.title}
              {item.placeholder && (
                <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
              )}
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CL</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-semibold text-lg tracking-tight">ClearLens</h1>
                <p className="text-xs text-muted-foreground">Media Clarity</p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <Separator className="mx-4 w-auto" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn("px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {insightsItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn("px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", collapsed && "sr-only")}>
            Transparency
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {transparencyItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto px-2 pb-4">
        <Separator className="mx-2 mb-4 w-auto" />
        <SidebarMenu className="space-y-1">
          {footerItems.map(renderNavItem)}
        </SidebarMenu>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mt-4 mx-auto w-8 h-8 rounded-full hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
