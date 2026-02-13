"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ApprovalsPage() {
    const params = useParams();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionOpen, setActionOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
    const [adminComment, setAdminComment] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Fetch PENDING requests for the institute
            // GradeChangeRequestViewSet filters by institute for INSTITUTE_ADMIN
            const res = await api.get('/grade-change-requests/');
            // Filter pending client-side if API returns all, but ideally backend filters.
            // My ViewSet returns history too. Let's filter client side for the main pending tab or just list all with status.
            setRequests(res.data.results || res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (req: any, type: "APPROVE" | "REJECT") => {
        setSelectedRequest(req);
        setActionType(type);
        setAdminComment("");
        setActionOpen(true);
    };

    const submitAction = async () => {
        if (!selectedRequest) return;
        try {
            const endpoint = `/grade-change-requests/${selectedRequest.id}/${actionType === "APPROVE" ? 'approve' : 'reject'}/`;
            await api.post(endpoint, {
                comment: adminComment
            });
            toast.success(`Request ${actionType === "APPROVE" ? 'Approved' : 'Rejected'}`);
            setActionOpen(false);
            fetchRequests();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const historyRequests = requests.filter(r => r.status !== 'PENDING');

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Grade Approvals</h1>
                <p className="text-muted-foreground">Manage grade change requests from instructors.</p>
            </div>

            <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                    <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
                    <CardDescription>Requests awaiting your action.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Current Grade</TableHead>
                                <TableHead>Proposed Grade</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.requested_by_name}</TableCell>
                                    <TableCell>{req.student_name}</TableCell>
                                    <TableCell>{req.submission_title}</TableCell>
                                    <TableCell>{req.current_grade}</TableCell>
                                    <TableCell className="font-bold text-blue-600">{req.new_grade}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={req.reason}>{req.reason}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-2" onClick={() => handleAction(req, "APPROVE")}>
                                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => handleAction(req, "REJECT")}>
                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pendingRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">All caught up! No pending requests.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Request History</CardTitle>
                    <CardDescription>Past approval actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Admin Comment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{req.requested_by_name}</TableCell>
                                    <TableCell>{req.student_name}</TableCell>
                                    <TableCell>{req.submission_title}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'APPROVED' ? 'default' : 'destructive'}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{req.admin_comment || "-"}</TableCell>
                                </TableRow>
                            ))}
                            {historyRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No history available.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={actionOpen} onOpenChange={setActionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === "APPROVE" ? "Approve Request" : "Reject Request"}</DialogTitle>
                        <DialogDescription>
                            {actionType === "APPROVE"
                                ? "This will update the student's grade immediately."
                                : "The grade will remain unchanged."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reason provided by Instructor:</Label>
                            <div className="p-3 bg-muted rounded-md text-sm italic">"{selectedRequest?.reason}"</div>
                        </div>
                        <div className="space-y-2">
                            <Label>Admin Comment (Optional)</Label>
                            <Textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="e.g. Verified with department head..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
                        <Button
                            variant={actionType === "APPROVE" ? "default" : "destructive"}
                            onClick={submitAction}
                        >
                            Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
