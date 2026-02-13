"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Ban, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

// We can reuse Enrollment interface if it's exported, or define locally
interface Enrollment {
    id: number;
    student: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    batch: {
        id: number;
        name: string;
        program: {
            name: string;
        }
    };
    active: boolean;
    enrolled_at: string;
}

export default function EnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async (query = "") => {
        setLoading(true);
        try {
            // Backend filtering might need update to support ?search= on enrollments or handled here
            // For now, let's fetch all (filtered by institute by backend viewset)
            const res = await api.get('/enrollments/');
            let data = res.data;

            // Client-side search if backend doesn't support deep search yet
            if (query) {
                const lowerQ = query.toLowerCase();
                data = data.filter((e: Enrollment) =>
                    e.student.username.toLowerCase().includes(lowerQ) ||
                    e.student.first_name.toLowerCase().includes(lowerQ) ||
                    e.student.last_name.toLowerCase().includes(lowerQ) ||
                    e.student.email.toLowerCase().includes(lowerQ)
                );
            }
            setEnrollments(data);
        } catch (error) {
            toast.error("Failed to fetch enrollments");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`/enrollments/${id}/`, { active: !currentStatus });
            toast.success(`Enrollment ${currentStatus ? "deactivated" : "activated"} successfully`);
            fetchEnrollments(search);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEnrollments(search);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Enrollments</h2>
                    <p className="text-muted-foreground">Monitor student batch assignments.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Enrollments</CardTitle>
                        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="Search student name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Program / Batch</TableHead>
                                    <TableHead>Enrolled Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No enrollments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    enrollments.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {item.student.first_name} {item.student.last_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.student.username}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.batch.program.name}</span>
                                                    <span className="text-xs text-muted-foreground">{item.batch.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(item.enrolled_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.active ? "default" : "secondary"} className={item.active ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {item.active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => toggleStatus(item.id, item.active)}
                                                    className={item.active ? "text-destructive hover:bg-destructive/10" : "text-green-600 hover:bg-green-50"}
                                                    title={item.active ? "Deactivate" : "Activate"}
                                                >
                                                    {item.active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}
