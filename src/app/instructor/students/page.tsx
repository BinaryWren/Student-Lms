"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Search, UserPlus, Filter, MoreHorizontal, Mail, BookOpen } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const mockStudents = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", course: "Advanced React", joined: "2024-01-15" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", course: "Python Masterclass", joined: "2024-02-10" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", course: "SQL Foundations", joined: "2023-11-20" },
]

export default function InstructorStudentsPage() {
    const [search, setSearch] = useState("")

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon to your student directory.`);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">My Students</h2>
                    <p className="text-muted-foreground">Manage students enrolled in your courses.</p>
                </div>
                <Button onClick={() => handleAction("Invite Student")}>
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Student
                </Button>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={() => handleAction("Filter")}>
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Primary Course</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="font-bold">{student.name}</div>
                                        <div className="text-xs text-muted-foreground">{student.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="size-3 text-primary" />
                                            <span className="text-sm font-medium">{student.course}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{student.joined}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleAction("Send Message")}>
                                                    <Mail className="mr-2 h-4 w-4" /> Message
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction("View Progress")}>
                                                    View Progress
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
