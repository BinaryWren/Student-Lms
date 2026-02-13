"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function CodeLabDashboard() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all problems available to the student (filtered by institute/batch in backend)
        api.get('/problems/').then(res => {
            setProblems(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">CodeLab</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/student/codelab/compiler" target="_blank">Open Compiler</Link>
                    </Button>
                    <Button>My Submissions</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Problem Set</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {problems.map((problem) => (
                                <TableRow key={problem.id}>
                                    <TableCell className="font-medium">#{problem.id}</TableCell>
                                    <TableCell>{problem.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={problem.difficulty === 'EASY' ? 'secondary' : 'destructive'}>
                                            {problem.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild size="sm">
                                            <Link href={`/student/codelab/${problem.id}`}>Solve</Link>
                                        </Button>
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
