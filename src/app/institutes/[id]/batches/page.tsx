"use client"

import { useState, useEffect, use } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, Plus, Pencil, Trash2, Search, Users, Rocket, Target, BookOpen } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function BatchesPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const instituteId = params.id;

    const [batches, setBatches] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        program: "",
        start_date: "",
        end_date: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchRes, programRes] = await Promise.all([
                api.get('/batches/'),
                api.get('/programs/')
            ]);
            setBatches(batchRes.data);
            setPrograms(programRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (batch?: any) => {
        if (batch) {
            setEditingBatch(batch);
            setFormData({
                name: batch.name,
                program: batch.program.toString(),
                start_date: batch.start_date,
                end_date: batch.end_date
            });
        } else {
            setEditingBatch(null);
            setFormData({
                name: "",
                program: "",
                start_date: "",
                end_date: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.program || !formData.start_date || !formData.end_date) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            if (editingBatch) {
                await api.patch(`/batches/${editingBatch.id}/`, formData);
                toast.success("Batch updated successfully");
            } else {
                await api.post('/batches/', formData);
                toast.success("Batch created successfully");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save batch");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this batch?")) return;
        try {
            await api.delete(`/batches/${id}/`);
            toast.success("Batch deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete batch");
        }
    };

    const filteredBatches = batches.filter(batch =>
        batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.program_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 container mx-auto py-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Target className="h-10 w-10 text-primary" />
                        Batch Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Update existing batches or launch new cohorts for your programs.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all font-bold">
                    <Plus className="mr-2 h-5 w-5" /> Start New Batch
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/30 pb-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" /> Active Cohorts
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search batches..."
                                className="pl-9 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/10 font-black">
                                <TableHead className="w-[300px] font-bold">Batch Name & Program</TableHead>
                                <TableHead className="font-bold">Timeline</TableHead>
                                <TableHead className="font-bold text-center">Status</TableHead>
                                <TableHead className="text-right font-bold pr-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground animate-pulse">
                                        Loading academic records...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBatches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                        No batches found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBatches.map((batch) => {
                                    const isUpcoming = new Date(batch.start_date) > new Date();
                                    const isEnded = new Date(batch.end_date) < new Date();

                                    return (
                                        <TableRow key={batch.id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-bold">
                                                <div className="flex flex-col">
                                                    <span className="text-base text-slate-900">{batch.name}</span>
                                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" /> {batch.program_name || `Program ID: ${batch.program}`}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                                    {format(new Date(batch.start_date), "MMM d, yyyy")}
                                                    <span className="text-slate-300">→</span>
                                                    {format(new Date(batch.end_date), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isUpcoming ? (
                                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-black">UPCOMING</Badge>
                                                ) : isEnded ? (
                                                    <Badge className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 font-black">COMPLETED</Badge>
                                                ) : (
                                                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-black">ACTIVE</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(batch)} className="h-8 w-8 text-primary hover:bg-primary/10">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingBatch ? "Update Batch" : "Launch New Batch"}</DialogTitle>
                        <DialogDescription>Define the timeline and program for this cohort.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="batch-name" className="font-bold">Batch Label / Name</Label>
                            <Input
                                id="batch-name"
                                placeholder="e.g. Winter 2024 (Cohort A)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="program" className="font-bold">Academic Program</Label>
                            <Select value={formData.program} onValueChange={(v) => setFormData({ ...formData, program: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-date" className="font-bold">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date" className="font-bold">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-slate-900 text-white font-bold">
                            {editingBatch ? "Update Batch" : "Create Batch"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
