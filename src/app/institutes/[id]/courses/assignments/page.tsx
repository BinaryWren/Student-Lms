"use client"

import * as React from "react"
import { Search, Filter, Plus, MoreHorizontal, Calendar as CalendarIcon, FileText } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock Data
const assignments = [
    {
        id: 1,
        title: "Project Proposal",
        course: "CS101 - Intro to CS",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        points: 50,
        submissions: 12,
        status: "Active"
    },
    {
        id: 2,
        title: "Algorithm Analysis Report",
        course: "CS201 - Data Structures",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
        points: 100,
        submissions: 5,
        status: "Draft"
    },
    {
        id: 3,
        title: "Portfolio Website",
        course: "CS105 - Web Development",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        points: 75,
        submissions: 28,
        status: "Closed"
    },
]

export default function AssignmentsPage() {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
                    <p className="text-muted-foreground">Manage course assignments and track submissions.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Assignment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                            <DialogDescription>Set up a new assignment for your students.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="e.g. Final Project" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Course</Label>
                                <Input id="course" placeholder="Select course..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Instructions for the assignment..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="points">Points</Label>
                                    <Input id="points" type="number" defaultValue={100} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input id="dueDate" type="datetime-local" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={() => setIsCreateOpen(false)}>Create Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 border p-4 rounded-lg bg-muted/20">
                <div className="grid gap-2 w-full md:w-auto">
                    <label className="text-sm font-medium">Filter by Course</label>
                    <Select>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            <SelectItem value="cs101">CS101 - Intro to CS</SelectItem>
                            <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 w-full md:w-auto">
                    <label className="text-sm font-medium">Status</label>
                    <Select>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative flex-1 w-full mt-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search assignments..." className="pl-8 w-full" />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Submissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{assignment.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{assignment.course}</TableCell>
                                <TableCell>
                                    <div className="flex items-center text-muted-foreground">
                                        <CalendarIcon className="mr-2 h-3 w-3" />
                                        <span className="text-sm">{format(assignment.dueDate, "PP p")}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{assignment.points}</TableCell>
                                <TableCell>{assignment.submissions}</TableCell>
                                <TableCell>
                                    <Badge variant={assignment.status === 'Active' ? 'default' : assignment.status === 'Closed' ? 'secondary' : 'outline'}>
                                        {assignment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                                            <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
