"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { toast } from "sonner"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/providers/auth-provider"

export default function InstituteLayout({
    children,
    params: paramsPromise
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const params = use(paramsPromise)
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const isSuperAdmin = user?.role === 'SUPER_ADMIN';
        const isInstituteAdmin = user?.role === 'INSTITUTE_ADMIN' && user.institute?.toString() === params.id;
        const isHR = user?.role === 'HR' && user.institute?.toString() === params.id;
        const isEmployee = user?.role === 'EMPLOYEE' && user.institute?.toString() === params.id;
        const hasAccess = isSuperAdmin || isInstituteAdmin || isHR || isEmployee;

        if (!isLoading && (!user || !hasAccess)) {
            if (user?.role === 'STUDENT') {
                router.push('/student/dashboard');
            } else if (user?.role === 'INSTRUCTOR') {
                router.push('/instructor/dashboard');
            } else if (user && !hasAccess) {
                // If logged in but wrong role/institute for this page
                toast.error("You do not have access to this institute.");
                router.push('/');
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router, params.id]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading Management Portal...</div>;

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isInstituteAdmin = user?.role === 'INSTITUTE_ADMIN' && user.institute?.toString() === params.id;
    const isHR = user?.role === 'HR' && user.institute?.toString() === params.id;
    const isEmployee = user?.role === 'EMPLOYEE' && user.institute?.toString() === params.id;
    if (!user || (!isSuperAdmin && !isInstituteAdmin && !isHR && !isEmployee)) return null;

    const displayUser = {
        name: user?.username || "Admin",
        email: "admin@portal.com",
        avatar: "/avatars/01.png",
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
                    <div className="flex items-center gap-2 flex-1">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/institutes/${params.id}/dashboard`}>
                                        Institute Management
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        <NavUser user={displayUser} />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
