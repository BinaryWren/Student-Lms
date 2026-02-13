"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/providers/auth-provider"

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'INSTRUCTOR')) {
            if (user?.role === 'STUDENT') {
                router.push('/student/dashboard');
            } else if (user?.role === 'INSTITUTE_ADMIN') {
                router.push(`/institutes/${user.institute}/dashboard`);
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading Instructor Portal...</div>;
    if (!user || user.role !== 'INSTRUCTOR') return null;

    const displayUser = {
        name: user?.username || "Instructor",
        email: "instructor@portal.com",
        avatar: "/avatars/shadcn.jpg",
    }

    return (
        <SidebarProvider>
            {/* We reuse AppSidebar but arguably should have a strict "InstructorSidebar" 
          if the menu items differ significantly. 
          For MVC, let's assume AppSidebar handles roles or we create a specific one.
          For now, reusing the main sidebar which has "Playground", "Models" etc mocks.
          I'll create a dedicated InstructorSidebar later.
      */}
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
                    <div className="flex items-center gap-2 flex-1">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/instructor/dashboard">Instructor Portal</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Add Create Button or similar actions here */}
                        <NavUser user={displayUser} />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
