"use client"

import * as React from "react"
import { Plus, Search, MoreHorizontal, FileText, Clock, Trophy } from "lucide-react"

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock Data
const quizzes = [
    {
        id: 1,
        title: "Introduction to Computer Science",
        course: "CS101",
        questions: 15,
        duration: 30,
        status: "Active",
        attempts: 45
    },
    {
        id: 2,
        title: "Data Structures Mid-term",
        course: "CS201",
        questions: 25,
        duration: 60,
        status: "Draft",
        attempts: 0
    },
    {
        id: 3,
        title: "Web Development Basics",
        course: "CS105",
        questions: 10,
        duration: 20,
        status: "Active",
        attempts: 120
    },
]

export default function QuizBankPage() {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quiz Bank</h2>
                    <p className="text-muted-foreground">Manage quizzes, exams, and question banks.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Quiz
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Quiz</DialogTitle>
                            <DialogDescription>Setup the basic details for your new quiz.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Quiz Title</Label>
                                <Input id="title" placeholder="e.g. Final Exam 2024" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Course</Label>
                                <Input id="course" placeholder="Select course..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Time Limit (mins)</Label>
                                    <Input id="duration" type="number" defaultValue={60} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="passing">Passing Score (%)</Label>
                                    <Input id="passing" type="number" defaultValue={50} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={() => setIsCreateOpen(false)}>Create & Add Questions</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quizzes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {quizzes.filter(q => q.status === "Active").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {quizzes.reduce((acc, q) => acc + q.attempts, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and List */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search quizzes..." className="pl-8" />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quizzes.map((quiz) => (
                            <TableRow key={quiz.id}>
                                <TableCell className="font-medium">{quiz.title}</TableCell>
                                <TableCell>{quiz.course}</TableCell>
                                <TableCell>{quiz.questions}</TableCell>
                                <TableCell>{quiz.duration} mins</TableCell>
                                <TableCell>
                                    <Badge variant={quiz.status === 'Active' ? 'default' : 'secondary'}>
                                        {quiz.status}
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
                                            <DropdownMenuItem>Edit Quiz</DropdownMenuItem>
                                            <DropdownMenuItem>View Questions</DropdownMenuItem>
                                            <DropdownMenuItem>Preview</DropdownMenuItem>
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
