import { 
  LayoutDashboard, 
  FileText, 
  Workflow, 
  Send, 
  BarChart3, 
  Settings,
  ChevronDown,
  Leaf
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockData } from "@/hooks/use-api";
import { useState } from "react";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Content", url: "/content", icon: FileText },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Posting", url: "/posting", icon: Send },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { workspaces } = useMockData();
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow animate-glow">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-gradient-emerald">MCP Hub</span>
        </div>
        
        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors border border-sidebar-border">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {selectedWorkspace.name}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {workspaces.map((workspace) => (
              <DropdownMenuItem 
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className="cursor-pointer"
              >
                {workspace.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary font-medium">Master Control Program</p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
