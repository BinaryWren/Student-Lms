"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Clock, CheckCircle2, XCircle, Search, Filter, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const mockEnrollments = [
    { id: 1, student: "Alice Johnson", course: "Advanced React", date: "2024-01-20", status: "Active" },
    { id: 2, student: "Bob Smith", course: "Python Masterclass", date: "2024-01-21", status: "Pending" },
    { id: 3, student: "Charlie Brown", course: "SQL Foundations", date: "2024-01-19", status: "Cancelled" },
    { id: 4, student: "Diana Prince", course: "UI/UX Design", date: "2024-01-21", status: "Active" },
]

export default function EnrollmentsPage() {
    const [search, setSearch] = useState("")

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon.`);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Enrollment Requests</h2>
                    <p className="text-muted-foreground">Manage and track student enrollment status.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,240</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-500/20 bg-orange-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">12</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-500/20 bg-green-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">New Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">+5</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student or course..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleAction("Filter")}>
                            <Filter className="size-4 mr-2" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockEnrollments.map((enr) => (
                                <TableRow key={enr.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-bold">{enr.student}</TableCell>
                                    <TableCell>{enr.course}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{enr.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            enr.status === "Active" ? "default" :
                                                enr.status === "Pending" ? "secondary" : "destructive"
                                        } className="font-black flex w-fit items-center gap-1 uppercase text-[10px]">
                                            {enr.status === "Active" && <CheckCircle2 className="size-3" />}
                                            {enr.status === "Pending" && <Clock className="size-3" />}
                                            {enr.status === "Cancelled" && <XCircle className="size-3" />}
                                            {enr.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {enr.status === "Pending" ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="h-8 text-green-500 hover:text-green-600 border-green-500/20" onClick={() => toast.success("Enrollment approved!")}>Approve</Button>
                                                    <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-600 border-red-500/20" onClick={() => toast.error("Enrollment rejected.")}>Reject</Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="h-8" onClick={() => handleAction("View Details")}>
                                                    Details <ArrowUpRight className="size-3 ml-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
