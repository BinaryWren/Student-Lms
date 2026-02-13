"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function TeamSwitcher({
    teams,
}: {
    teams: {
        id: number
        name: string
        logo: React.ElementType
        plan: string
    }[]
}) {
    const router = useRouter()
    const params = useParams()
    const { user, isLoading } = useAuth()
    const { isMobile } = useSidebar()
    const [activeTeam, setActiveTeam] = React.useState(teams[0])
    const [showAddDialog, setShowAddDialog] = React.useState(false)
    const [newInstName, setNewInstName] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if (teams.length > 0) {
            const instituteId = params?.id?.toString()
            const currentTeam = teams.find(t => t.id?.toString() === instituteId)
            setActiveTeam(currentTeam || teams[0])
        }
    }, [teams, params.id])

    const handleAddInstitute = async () => {
        if (!newInstName) return toast.error("Name is required")
        setLoading(true)
        try {
            const res = await api.post('/institutes/', { name: newInstName })
            toast.success("Institute created successfully")
            setShowAddDialog(false)
            setNewInstName("")
            // Trigger refresh in sidebar
            window.dispatchEvent(new Event('instituteUpdate'))
            // Navigate to new institute
            router.push(`/institutes/${res.data.id}/dashboard`)
        } catch (e: any) {
            console.error("Create Institute Error:", e.response?.data || e)
            const errorMsg = e.response?.data?.name?.[0] || e.response?.data?.error || "Failed to create institute"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                                    {activeTeam && <activeTeam.logo className="size-4" />}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-primary">
                                        {activeTeam?.name || "Institute Management"}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">{activeTeam?.plan || "System Admin"}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Institutes
                            </DropdownMenuLabel>
                            {teams.map((team, index) => (
                                <DropdownMenuItem
                                    key={team.id}
                                    onClick={() => {
                                        setActiveTeam(team);
                                        router.push(`/institutes/${team.id}/dashboard`);
                                    }}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <team.logo className="size-4 shrink-0" />
                                    </div>
                                    {team.name}
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))}
                            {(user?.role === 'SUPER_ADMIN' || user?.role === 'INSTITUTE_ADMIN') && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="gap-2 p-2" onClick={() => setShowAddDialog(true)}>
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                            <Plus className="size-4" />
                                        </div>
                                        <div className="font-medium text-muted-foreground">Add Institute</div>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {isLoading && (
                                <div className="flex items-center justify-center p-2">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Institute</DialogTitle>
                        <DialogDescription>Create a new sub-institute. You can manage its students and courses separately.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Institute Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Science Academy"
                                value={newInstName}
                                onChange={e => setNewInstName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddInstitute} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
