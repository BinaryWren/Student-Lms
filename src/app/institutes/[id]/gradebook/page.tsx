"use client"

import * as React from "react"
import { Search, Filter, Download, FileSpreadsheet } from "lucide-react"

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

// Mock Data
const grades = [
    {
        student: "Alice Johnson",
        studentId: "STU001",
        course: "CS101 - Intro to CS",
        assessment: "Mid-term Exam",
        type: "Exam",
        score: 85,
        maxScore: 100,
        status: "Pass"
    },
    {
        student: "Bob Smith",
        studentId: "STU002",
        course: "CS101 - Intro to CS",
        assessment: "Mid-term Exam",
        type: "Exam",
        score: 92,
        maxScore: 100,
        status: "Pass"
    },
    {
        student: "Charlie Brown",
        studentId: "STU003",
        course: "CS101 - Intro to CS",
        assessment: "Assignment 1",
        type: "Assignment",
        score: 45,
        maxScore: 50,
        status: "Pass"
    },
    {
        student: "Alice Johnson",
        studentId: "STU001",
        course: "CS201 - Data Structures",
        assessment: "Quiz 1",
        type: "Quiz",
        score: 8,
        maxScore: 10,
        status: "Pass"
    },
]

export default function GradebookPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gradebook</h2>
                    <p className="text-muted-foreground">View and manage student grades across all courses.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
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
                    <label className="text-sm font-medium">Filter by Assessment</label>
                    <Select>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative flex-1 w-full mt-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search student name..." className="pl-8 w-full" />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Assessment</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.map((grade, idx) => {
                            const percentage = Math.round((grade.score / grade.maxScore) * 100);
                            return (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <div className="font-medium">{grade.student}</div>
                                        <div className="text-xs text-muted-foreground">{grade.studentId}</div>
                                    </TableCell>
                                    <TableCell>{grade.course}</TableCell>
                                    <TableCell>{grade.assessment}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{grade.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {grade.score} / {grade.maxScore}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={percentage < 50 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                            {percentage}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={grade.status === 'Pass' ? 'default' : 'destructive'}>
                                            {grade.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
