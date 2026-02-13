"use client"

import * as React from "react"
import {
    BookOpen,
    Bot,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    Send,
    GraduationCap,
    Users,
    UserCog,
    LayoutDashboard,
    Calendar,
    FileText,
    Briefcase,
    CheckCircle,
    DollarSign
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

import { useParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import api from "@/lib/api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const params = useParams()
    const { user } = useAuth()
    const instituteId = params?.id as string
    const isInstituteView = !!instituteId

    const [instituteName, setInstituteName] = React.useState("Acme Institute")
    const [teams, setTeams] = React.useState<any[]>([
        {
            id: 0,
            name: "Loading...",
            logo: GraduationCap,
            plan: "LMS",
        }
    ])

    const fetchInstitutes = React.useCallback(async () => {
        try {
            const res = await api.get('/institutes/')
            const insts = Array.isArray(res.data) ? res.data : (res.data.results || [])

            if (insts.length > 0) {
                setTeams(insts.map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    logo: GraduationCap,
                    plan: "Education Plan",
                })))

                if (instituteId) {
                    const current = insts.find((i: any) => i.id.toString() === instituteId)
                    if (current) setInstituteName(current.name)
                } else if (insts[0]) {
                    setInstituteName(insts[0].name)
                }
            }
        } catch (e) {
            console.error("Sidebar: Failed to fetch institutes", e)
        }
    }, [instituteId])

    React.useEffect(() => {
        fetchInstitutes()

        const handleUpdate = () => fetchInstitutes()
        window.addEventListener('instituteUpdate', handleUpdate)
        return () => window.removeEventListener('instituteUpdate', handleUpdate)
    }, [fetchInstitutes])

    const navMain = [
        {
            title: "Dashboard",
            url: isInstituteView ? `/institutes/${instituteId}/dashboard` : "/instructor/dashboard",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: isInstituteView ? `/institutes/${instituteId}/dashboard` : "/instructor/dashboard",
                },
                ...(user?.role !== 'HR' ? [{
                    title: "Analytics",
                    url: isInstituteView ? `/institutes/${instituteId}/analytics` : "/instructor/analytics",
                }] : []),
            ],
        },
        // Only show Courses to non-HR
        ...(user?.role !== 'HR' ? [{
            title: "Courses",
            url: isInstituteView ? `/institutes/${instituteId}/courses` : "/instructor/courses",
            icon: BookOpen,
            items: [
                {
                    title: "All Courses",
                    url: isInstituteView ? `/institutes/${instituteId}/courses` : "/instructor/courses",
                },
                ...(isInstituteView ? [{
                    title: "Manage Batches",
                    url: `/institutes/${instituteId}/batches`,
                }] : []),
                ...(isInstituteView ? [{
                    title: "Course Builder",
                    url: `/institutes/${instituteId}/courses/create`,
                }] : []),
                ...(isInstituteView ? [] : [{
                    title: "Assignments",
                    url: "/instructor/assignments",
                    icon: FileText
                },
                {
                    title: "Assessments",
                    url: "/instructor/assessments",
                },
                {
                    title: "Gradebook",
                    url: "/instructor/gradebook",
                }]),
            ],
        }] : []),

        // Only show Students to non-HR
        ...(user?.role !== 'HR' ? [{
            title: "Students",
            url: isInstituteView ? `/institutes/${instituteId}/students` : "/instructor/students",
            icon: Users,
            items: [
                {
                    title: "Enrollments",
                    url: isInstituteView ? `/institutes/${instituteId}/students/enrollments` : "/instructor/enrollments"
                },
                ...(isInstituteView ? [{
                    title: "Admissions",
                    url: `/institutes/${instituteId}/admissions`
                }] : []),
                ...(isInstituteView ? [{
                    title: "Student Access",
                    url: `/institutes/${instituteId}/students/access`
                }] : []),
                {
                    title: "Attendance",
                    url: isInstituteView ? `/institutes/${instituteId}/attendance` : "/instructor/attendance"
                }
            ]
        }] : []),

        // Only show Instructors to non-HR
        ...(user?.role !== 'HR' && isInstituteView ? [{
            title: "Instructors",
            url: `/institutes/${instituteId}/instructors`,
            icon: GraduationCap,
            items: [
                {
                    title: "All Instructors",
                    url: `/institutes/${instituteId}/instructors`,
                }
            ]
        }] : []),

        // My Workplace for Employees
        ...(user?.role === 'EMPLOYEE' ? [{
            title: "My Workplace",
            url: isInstituteView ? `/institutes/${instituteId}/dashboard` : "/dashboard",
            icon: Briefcase,
            items: [
                {
                    title: "Dashboard",
                    url: isInstituteView ? `/institutes/${instituteId}/dashboard` : "/dashboard",
                },
                {
                    title: "My Leave",
                    url: "#", // Handled in dashboard
                },
                {
                    title: "My Tasks",
                    url: "#", // Handled in dashboard
                }
            ]
        }] : []),

        // Finance Management - show to Admin
        ...(isInstituteView && (user?.role === 'INSTITUTE_ADMIN' || user?.role === 'SUPER_ADMIN') ? [{
            title: "Finance",
            url: `/institutes/${instituteId}/finance`,
            icon: DollarSign,
            items: [
                {
                    title: "Fee Management",
                    url: `/institutes/${instituteId}/finance?tab=fees`,
                },
                {
                    title: "Salary Management",
                    url: `/institutes/${instituteId}/finance?tab=salaries`,
                }
            ]
        }] : []),
        // Hide Careers/Placement from HR
        ...(user?.role !== 'HR' && isInstituteView ? [{
            title: "Careers & Placement",
            url: `/institutes/${instituteId}/careers`,
            icon: Briefcase,
            items: [
                {
                    title: "Alumni Directory",
                    url: `/institutes/${instituteId}/careers/alumni`
                },
                {
                    title: "Graduate Students",
                    url: `/institutes/${instituteId}/careers/graduates`,
                },
                {
                    title: "Employer Directory",
                    url: `/institutes/${instituteId}/careers/employers`,
                },
                {
                    title: "Job Postings",
                    url: `/institutes/${instituteId}/careers/jobs`
                },
                {
                    title: "Employers",
                    url: `/institutes/${instituteId}/careers/employers`
                }
            ]
        }] : []),

        // Hide Calendar from HR
        ...(user?.role !== 'HR' ? [{
            title: "Calendar",
            url: isInstituteView ? `/institutes/${instituteId}/calendar` : "/instructor/calendar",
            icon: Calendar,
            items: [
                {
                    title: "Calendar View",
                    url: isInstituteView ? `/institutes/${instituteId}/calendar` : "/instructor/calendar",
                },
                {
                    title: "Manage Events",
                    url: isInstituteView ? `/institutes/${instituteId}/events` : "/instructor/events",
                },
            ]
        }] : []),

        // Hide Gallery/Approvals from HR
        ...(user?.role !== 'HR' && isInstituteView ? [
            {
                title: "Documents Gallery",
                url: `/institutes/${instituteId}/gallery`,
                icon: FileText,
                items: [
                    {
                        title: "All Documents",
                        url: `/institutes/${instituteId}/gallery`,
                    },
                ]
            },
            {
                title: "Approvals",
                url: "#",
                icon: CheckCircle,
                items: [
                    {
                        title: "Grade Requests",
                        url: `/institutes/${instituteId}/approvals`,
                    }
                ]
            }
        ] : []),
        ...(user?.role !== 'HR' ? [{
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: isInstituteView ? `/institutes/${instituteId}/settings/general` : "/instructor/settings/general",
                },
                {
                    title: "Branding",
                    url: isInstituteView ? `/institutes/${instituteId}/settings/branding` : "/instructor/settings/branding",
                },
                {
                    title: "Billing",
                    url: isInstituteView ? `/institutes/${instituteId}/settings/billing` : "/instructor/billing",
                }
            ],
        }] : []),
    ]

    const sidebarUser = {
        name: user?.username || "Loading...",
        email: user?.email || "",
        avatar: "/avatars/shadcn.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={sidebarUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
