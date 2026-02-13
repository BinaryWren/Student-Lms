"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { StudentSidebar } from "@/components/student-sidebar"
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
import { NotificationBell } from "@/components/notification-bell"
import { ChatBot } from "@/components/chatbot"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Allow STUDENT and ALUMNI
        if (!isLoading && (!user || (user.role !== 'STUDENT' && user.role !== 'ALUMNI'))) {
            if (user?.role === 'INSTRUCTOR') {
                router.push('/instructor/dashboard');
            } else if (user?.role === 'INSTITUTE_ADMIN') {
                router.push(`/institutes/${user.institute}/dashboard`);
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading Student Portal...</div>;
    // Render blank while redirecting if unauthorized
    if (!user || (user.role !== 'STUDENT' && user.role !== 'ALUMNI')) return null;
    return (
        <SidebarProvider>
            <StudentSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/student/dashboard">
                                        Student
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto px-4">
                        <NotificationBell />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
                <ChatBot />
            </SidebarInset>
        </SidebarProvider>
    )
}
