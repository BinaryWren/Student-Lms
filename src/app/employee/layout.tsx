"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== 'EMPLOYEE' && user.role !== 'HR'))) {
            // Redirect if not employee/hr
            if (user?.role === 'STUDENT') router.push('/student/dashboard')
            else if (user?.role === 'INSTRUCTOR') router.push('/instructor/dashboard')
            else router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading) return <div>Loading...</div>
    if (!user) return null

    return (
        <SidebarProvider>
            {/* Can add Employee Sidebar here later if needed */}
            <SidebarInset className="bg-slate-50 min-h-screen">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
