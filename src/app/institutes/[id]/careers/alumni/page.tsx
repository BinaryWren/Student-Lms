"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface AlumniProfile {
    id: number;
    user: {
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    graduation_date: string;
    current_role: string;
    current_company: string;
    skills: string[];
    is_public: boolean;
}

export default function AlumniPage() {
    const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async (query = "") => {
        setLoading(true);
        try {
            const params = query ? { search: query } : {};
            const res = await api.get('/careers/alumni/', { params });
            setAlumni(res.data);
        } catch (error) {
            toast.error("Failed to fetch alumni directory");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAlumni(search);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Alumni Directory</h2>
                    <p className="text-muted-foreground">Manage and view your institute's alumni network.</p>
                </div>
                <Button onClick={() => toast.info("Export feature coming soon")}>Export CSV</Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Alumni List</CardTitle>
                        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="Search alumni..."
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Graduated</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead>Skills</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alumni.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No alumni found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    alumni.map((alum) => (
                                        <TableRow key={alum.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {alum.user.first_name} {alum.user.last_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{alum.user.email}</div>
                                            </TableCell>
                                            <TableCell>{new Date(alum.graduation_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {alum.current_role ? (
                                                    <div className="flex flex-col">
                                                        <span>{alum.current_role}</span>
                                                        <span className="text-xs text-muted-foreground">{alum.current_company}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {alum.skills.slice(0, 3).map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px]">{skill}</Badge>
                                                    ))}
                                                    {alum.skills.length > 3 && (
                                                        <span className="text-[10px] text-muted-foreground">+{alum.skills.length - 3}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={alum.is_public ? "default" : "secondary"}>
                                                    {alum.is_public ? "Public" : "Private"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
