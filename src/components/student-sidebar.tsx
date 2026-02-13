"use client"

import * as React from "react"
import {
    BookOpen,
    LayoutDashboard,
    Calendar,
    FileText,
    GraduationCap,
    MessageSquare,
    Trophy,
    Clock,
    Star,
    Briefcase
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/providers/auth-provider"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import Link from "next/link"

// Mock Data for Student
const data = {
    user: {
        name: "Alex Student",
        email: "alex@university.edu",
        avatar: "/avatars/04.png",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/student/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                { title: "Overview", url: "/student/dashboard" },
            ]
        },
        {
            title: "My Courses",
            url: "/student/courses",
            icon: BookOpen,
            items: [
                { title: "All Courses", url: "/student/courses" },
            ],
        },
        {
            title: "Leaderboard",
            url: "/student/leaderboard",
            icon: Trophy,
            items: [
                { title: "Global Ranks", url: "/student/leaderboard" },
                { title: "Achievements", url: "/student/badges" },
            ]
        },
        {
            title: "CodeLab",
            url: "/student/codelab",
            icon: Star,
            items: [
                { title: "Problems", url: "/student/codelab" },
            ]
        },
        {
            title: "Quizzes & Exams",
            url: "/student/quizzes",
            icon: FileText,
            items: [
                { title: "Available Quizzes", url: "/student/quizzes" }
            ]
        },
        {
            title: "Community",
            url: "/student/community/forums",
            icon: MessageSquare,
            items: [
                { title: "Forums", url: "/student/community/forums" },
            ]
        },
        {
            title: "Certificates",
            url: "/student/certificates",
            icon: Trophy,
            items: [
                { title: "My Certificates", url: "/student/certificates" }
            ]
        },
        {
            title: "Careers & Alumni",
            url: "/student/careers",
            icon: Briefcase,
            items: [
                { title: "Job Board", url: "/student/careers/jobs" },
                { title: "My Profile", url: "/student/careers/profile" },
            ]
        },
        {
            title: "Calendar",
            url: "/student/calendar",
            icon: Calendar,
            items: [
                { title: "My Schedule", url: "/student/calendar" }
            ]
        },
        {
            title: "Documents Gallery",
            url: "/student/gallery",
            icon: FileText,
            items: [
                { title: "Resources", url: "/student/gallery" }
            ]
        }
    ],
}

import { GamificationWidget } from "@/components/gamification/gamification-widget"

export function StudentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    // Filter navMain based on role and course mode
    const filteredNavMain = React.useMemo(() => {
        let items = [...data.navMain]

        if (user?.course_mode === 'ONLINE') {
            // Online students only get these sections
            const allowedTitles = ["Dashboard", "My Courses", "CodeLab", "Quizzes & Exams", "Certificates", "Calendar", "Documents Gallery"]
            items = items.filter(item => allowedTitles.includes(item.title))
        }

        return items
    }, [user])

    const displayUser = {
        name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || "Student",
        email: user?.email || "",
        avatar: "/avatars/04.png",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Link href="/student/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500 text-sidebar-primary-foreground">
                                    <GraduationCap className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-emerald-600">Student Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.course_mode === 'ONLINE' ? 'Online Learning' : 'Campus Learning'}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredNavMain} />
                <div className="p-4 mt-auto">
                    <GamificationWidget />
                </div>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={displayUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
