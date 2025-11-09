"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast, setPosition } from "@/registry/shadcn/toast/store"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Promise örneği için
  const simulateApiCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Success!")
        } else {
          reject("Failed!")
        }
      }, 2000)
    })
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />

        {/* Toast Demo Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Toast Demo</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-2 px-2 py-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Success!", "This is a success message")}
                className="justify-start"
              >
                Success Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.error("Error!", "Something went wrong")}
                className="justify-start"
              >
                Error Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Info", "This is an info message")}
                className="justify-start"
              >
                Info Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.warning("Warning", "This is a warning message")}
                className="justify-start"
              >
                Warning Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const id = toast.loading("Loading...", "Please wait")
                  setTimeout(() => {
                    toast.update(id, {
                      type: "success",
                      title: "Done!",
                      description: "Loading complete",
                      duration: 3000,
                    })
                  }, 2000)
                }}
                className="justify-start"
              >
                Loading Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.promise(
                  simulateApiCall(),
                  {
                    loading: "Sending request...",
                    success: "Request completed!",
                    error: "Request failed!",
                  }
                )}
                className="justify-start"
              >
                Promise Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.custom({
                  title: "Custom Toast",
                  description: "With custom action",
                  type: "default",
                  action: {
                    label: "Undo",
                    onClick: () => console.log("Undo clicked"),
                  },
                })}
                className="justify-start"
              >
                Custom Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.success("Toast 1")
                  setTimeout(() => toast.info("Toast 2"), 200)
                  setTimeout(() => toast.warning("Toast 3"), 400)
                  setTimeout(() => toast.error("Toast 4"), 600)
                }}
                className="justify-start"
              >
                Multiple Toasts
              </Button>

              <div className="h-px bg-border my-1" />

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPosition("top-right")
                  toast.info("Position", "Changed to top-right")
                }}
                className="justify-start text-xs"
              >
                Top Right Position
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPosition("bottom-center")
                  toast.info("Position", "Changed to bottom-center")
                }}
                className="justify-start text-xs"
              >
                Bottom Center
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
