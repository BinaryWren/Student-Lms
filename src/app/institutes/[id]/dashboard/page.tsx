"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, BookOpen, GraduationCap, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Calendar, Video } from "lucide-react"
import { toast } from "sonner"
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
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import { useParams } from "next/navigation"
import { Check, Edit, ShieldAlert, UserCheck } from "lucide-react"

export default function DashboardPage() {
    const { user } = useAuth();
    const params = useParams();
    const instituteId = params?.id as string;
    const [stats, setStats] = useState<any>({
        upcoming_live_classes: [],
        upcoming_exams: [],
        active_students: 0,
        total_revenue: 0,
        attendance_percentage: 0
    });
    const [employees, setEmployees] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [newRole, setNewRole] = useState("");

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskDue, setTaskDue] = useState("");

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveType, setLeaveType] = useState("CASUAL");
    const [leaveStart, setLeaveStart] = useState("");
    const [leaveEnd, setLeaveEnd] = useState("");
    const [leaveReason, setLeaveReason] = useState("");

    // Create Class State
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [classTopic, setClassTopic] = useState("");
    const [classTime, setClassTime] = useState("");
    const [classDuration, setClassDuration] = useState("60");

    useEffect(() => {
        if (user?.role === 'HR' || user?.role === 'INSTITUTE_ADMIN') {
            fetchHRData();
        } else if (user?.role === 'EMPLOYEE') {
            fetchEmployeeData();
        } else {
            fetchDashboardData();
        }
    }, [user?.role]);

    const fetchHRData = async () => {
        setLoading(true);
        try {
            const [empRes, attRes, leaveRes] = await Promise.all([
                api.get(`/hr/employees/?institute_id=${instituteId}`),
                api.get(`/hr/attendance/?institute_id=${instituteId}`),
                api.get(`/hr/leaves/?institute_id=${instituteId}`)
            ]);
            setEmployees(empRes.data);
            setAttendance(attRes.data);
            setLeaveRequests(leaveRes.data);
        } catch (e) {
            toast.error("Failed to load HR data");
        } finally {
            setLoading(false);
        }
    }

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            const [meRes, taskRes, leaveRes] = await Promise.all([
                api.get('/users/me/'),
                api.get(`/hr/tasks/?institute_id=${instituteId}`),
                api.get(`/hr/leaves/?institute_id=${instituteId}`)
            ]);
            // Filter tasks for self in frontend if backend doesn't list purely own
            setEmployees([meRes.data]); // Reuse employees state for self info
            setLeaveRequests(leaveRes.data);
        } catch (e) {
            toast.error("Failed to load employee data");
        } finally {
            setLoading(false);
        }
    }

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/institute/dashboard/');
            setStats(res.data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    }

    const handleMarkAttendance = async (empId: number, status: string) => {
        try {
            await api.post('/hr/attendance/', {
                employee: empId,
                date: new Date().toISOString().split('T')[0],
                status: status
            });
            toast.success("Attendance updated");
            fetchHRData();
        } catch (e) {
            toast.error("Failed to mark attendance");
        }
    }

    const handleLeaveAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await api.post(`/hr/leaves/${id}/${action}/`, { comments: "Processed by HR" });
            toast.success(`Leave request ${action}d`);
            fetchHRData();
        } catch (e) {
            toast.error(`Failed to ${action} leave`);
        }
    }

    const handleApplyLeave = async () => {
        if (!leaveStart || !leaveEnd || !leaveReason) {
            toast.error("All fields are required");
            return;
        }
        try {
            await api.post('/hr/leaves/', {
                leave_type: leaveType,
                start_date: leaveStart,
                end_date: leaveEnd,
                reason: leaveReason
            });
            toast.success("Leave application submitted");
            setIsLeaveModalOpen(false);
            fetchEmployeeData();
        } catch (e) {
            toast.error("Failed to apply for leave");
        }
    }

    const handleAssignRole = async () => {
        if (!selectedEmployee || !newRole) return;
        try {
            await api.patch(`/hr/employees/${selectedEmployee.id}/?institute_id=${instituteId}`, { role_type: newRole });
            toast.success(`Role updated for ${selectedEmployee.first_name}`);
            setIsRoleModalOpen(false);
            fetchHRData();
        } catch (e) {
            toast.error("Failed to update role");
        }
    }

    const handleAssignTask = async () => {
        if (!selectedEmployee || !taskTitle) {
            toast.error("Employee and Title are required");
            return;
        }
        try {
            await api.post('/hr/tasks/', {
                employee: selectedEmployee.id,
                title: taskTitle,
                description: taskDesc,
                due_date: taskDue || null
            });
            toast.success(`Task assigned to ${selectedEmployee.first_name}`);
            setIsTaskModalOpen(false);
            setTaskTitle(""); setTaskDesc(""); setTaskDue("");
            fetchHRData();
        } catch (e) {
            toast.error("Failed to assign task");
        }
    }

    const handleCreateClass = async () => {
        if (!classTopic || !classTime) {
            toast.error("Topic and Time are required");
            return;
        }
        try {
            await api.post('/live-classes/', {
                topic: classTopic,
                start_time: classTime,
                duration_minutes: parseInt(classDuration)
            });
            toast.success("Live Class Scheduled!");
            setIsClassOpen(false);
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to schedule class");
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard environment...</div>

    if (user?.role === 'HR' || user?.role === 'INSTITUTE_ADMIN') {
        return (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto py-8 px-4">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">HR Operations</h2>
                        <p className="text-gray-500">Managing staff, attendance, and leave cycles.</p>
                    </div>
                    <Badge className="bg-blue-600 text-white px-3 py-1 flex gap-2 items-center">
                        <ShieldAlert className="h-3 w-3" /> HR Management
                    </Badge>
                </div>

                <Tabs defaultValue="staff" className="w-full">
                    <TabsList className={`grid w-full ${user.role === 'INSTITUTE_ADMIN' ? 'grid-cols-4' : 'grid-cols-3'} mb-8`}>
                        <TabsTrigger value="staff">Staff Directory</TabsTrigger>
                        <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
                        <TabsTrigger value="leaves">Leave Management</TabsTrigger>
                        {user.role === 'INSTITUTE_ADMIN' && <TabsTrigger value="finance">Finance Summary</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="staff">
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card className="bg-white shadow-sm border-l-4 border-l-blue-600">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold text-gray-400 uppercase">Active Staff</CardTitle>
                                </CardHeader>
                                <CardContent><div className="text-3xl font-bold">{employees.length}</div></CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm border-l-4 border-l-purple-600">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold text-gray-400 uppercase">Tasks Pending</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{employees.reduce((acc, emp) => acc + (emp.tasks?.filter((t: any) => t.status === 'PENDING').length || 0), 0)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm border-l-4 border-l-amber-600">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold text-gray-400 uppercase">Leave Requests</CardTitle>
                                </CardHeader>
                                <CardContent><div className="text-3xl font-bold">{leaveRequests.filter(r => r.status === 'PENDING').length}</div></CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-lg border-0 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="px-6">Employee</TableHead>
                                        <TableHead className="text-center">Role</TableHead>
                                        <TableHead>Leave Bal.</TableHead>
                                        <TableHead className="text-right px-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((emp) => (
                                        <TableRow key={emp.id} className="hover:bg-blue-50/20">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-xs text-blue-600">{emp.employee_id}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{emp.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-bold">{emp.profile?.remaining_leaves || 0} / {emp.profile?.monthly_leave_quota || 2}</div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(emp); setIsTaskModalOpen(true); }}>Task</Button>
                                                    <Button variant="outline" size="sm" onClick={() => { setSelectedEmployee(emp); setNewRole(emp.role); setIsRoleModalOpen(true); }}>Auth</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance">
                        <Card className="p-0 overflow-hidden shadow-lg border-0">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="px-6">Staff Member</TableHead>
                                        <TableHead className="text-center">Today's Status</TableHead>
                                        <TableHead className="text-right px-6">Mark Attendance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map(emp => {
                                        const todayAtt = attendance.find(a => a.employee === emp.id && a.date === new Date().toISOString().split('T')[0]);
                                        return (
                                            <TableRow key={emp.id} className="hover:bg-green-50/10">
                                                <TableCell className="px-6 py-4 font-medium">{emp.first_name} {emp.last_name}</TableCell>
                                                <TableCell className="text-center">
                                                    {todayAtt ? (
                                                        <Badge className={todayAtt.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                            {todayAtt.status}
                                                        </Badge>
                                                    ) : <span className="text-gray-300 italic text-sm">Not Marked</span>}
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-600 hover:text-white" onClick={() => handleMarkAttendance(emp.id, 'PRESENT')}>Present</Button>
                                                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white" onClick={() => handleMarkAttendance(emp.id, 'ABSENT')}>Absent</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leaves">
                        <Card className="shadow-lg border-0">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="px-6">Employee</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right px-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveRequests.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No leave applications found.</TableCell></TableRow>}
                                    {leaveRequests.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="px-6 py-4 font-semibold">{req.employee_name}</TableCell>
                                            <TableCell className="text-sm">{req.start_date} to {req.end_date}</TableCell>
                                            <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">{req.reason}</TableCell>
                                            <TableCell><Badge variant={req.status === 'APPROVED' ? 'default' : (req.status === 'PENDING' ? 'secondary' : 'destructive')}>{req.status}</Badge></TableCell>
                                            <TableCell className="text-right px-6">
                                                {req.status === 'PENDING' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" className="bg-green-600" onClick={() => handleLeaveAction(req.id, 'approve')}><Check className="h-4 w-4" /></Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(req.id, 'reject')}><Activity className="h-4 w-4" /></Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="finance">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button variant="outline" className="justify-start" asChild>
                                        <a href={`/institutes/${instituteId}/finance?tab=fees`}>Manage Student Fees</a>
                                    </Button>
                                    <Button variant="outline" className="justify-start" asChild>
                                        <a href={`/institutes/${instituteId}/finance?tab=salaries`}>Manage Staff Salaries</a>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-emerald-800">Financial Health</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-900">${stats.total_revenue || '0.00'}</div>
                                    <p className="text-xs text-emerald-600">Total revenue recorded this session.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Modals from before remain similar, just ensuring they trigger HRData refresh */}
                <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Staff Access</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-3 py-4">
                            {['EMPLOYEE', 'HR', 'INSTRUCTOR', 'INSTITUTE_ADMIN'].map((r) => (
                                <button key={r} onClick={() => setNewRole(r)} className={`p-4 text-left border rounded-xl ${newRole === r ? 'border-blue-500 bg-blue-50 ring-2' : ''}`}>
                                    <div className="font-bold">{r}</div>
                                </button>
                            ))}
                        </div>
                        <Button onClick={handleAssignRole} className="w-full bg-blue-600">Save</Button>
                    </DialogContent>
                </Dialog>

                <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Assign Professional Task</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task Title" />
                            <Input value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description" />
                        </div>
                        <Button onClick={handleAssignTask} className="w-full bg-purple-600">Assign Task</Button>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    if (user?.role === 'EMPLOYEE') {
        const self = employees[0];
        return (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold">Welcome, {user?.first_name}</h2>
                        <p className="text-gray-500">{self?.profile?.designation} • {self?.profile?.department}</p>
                    </div>
                    <Button onClick={() => setIsLeaveModalOpen(true)} className="bg-blue-600"><Calendar className="mr-2 h-4 w-4" /> Request Leave</Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-t-4 border-t-blue-500 shadow-lg">
                        <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {self?.tasks?.length === 0 && <p className="text-gray-400 italic">No tasks assigned to you.</p>}
                                {self?.tasks?.map((t: any) => (
                                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-semibold">{t.title}</div>
                                            <div className="text-xs text-gray-500 tracking-tight">Due: {t.due_date || 'No deadline'} • Assigned by {t.assigned_by_name}</div>
                                        </div>
                                        <Badge>{t.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-purple-500 shadow-lg">
                        <CardHeader><CardTitle>Leave Balance</CardTitle></CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="text-6xl font-black text-purple-600">{self?.profile?.remaining_leaves || 2}</div>
                            <div className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Days Remaining</div>
                            <div className="mt-4 text-xs text-gray-400 font-medium">Standard Allowance: {self?.profile?.monthly_leave_quota || 2} days/mo</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6 shadow-md border-0">
                    <CardHeader className="bg-gray-50/50"><CardTitle className="text-sm">Leave History</CardTitle></CardHeader>
                    <Table>
                        <TableBody>
                            {leaveRequests.map(lr => (
                                <TableRow key={lr.id}>
                                    <TableCell className="font-medium">{lr.leave_type}</TableCell>
                                    <TableCell className="text-xs">{lr.start_date} to {lr.end_date}</TableCell>
                                    <TableCell><Badge variant={lr.status === 'APPROVED' ? 'default' : 'secondary'}>{lr.status}</Badge></TableCell>
                                    <TableCell className="text-right text-xs text-gray-400 italic">{lr.hr_comments || 'No comments'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Apply for Leave</DialogTitle><DialogDescription>Your application will be reviewed by HR.</DialogDescription></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Label>Leave Type</Label>
                            <Tabs value={leaveType} onValueChange={setLeaveType}>
                                <TabsList><TabsTrigger value="CASUAL">Casual</TabsTrigger><TabsTrigger value="SICK">Sick</TabsTrigger><TabsTrigger value="OTHER">Other</TabsTrigger></TabsList>
                            </Tabs>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} /></div>
                                <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} /></div>
                            </div>
                            <div className="grid gap-2"><Label>Reason</Label><Input value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Briefly state why..." /></div>
                        </div>
                        <Button onClick={handleApplyLeave} className="w-full bg-blue-600">Submit Application</Button>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => toast.info("Date filter coming soon")}>Filter Range</Button>
                    <Dialog open={isClassOpen} onOpenChange={setIsClassOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Video className="w-4 h-4 mr-2" /> Schedule Class
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Schedule Live Class</DialogTitle>
                                <DialogDescription>Create a new Zoom meeting for your students.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Topic</Label>
                                    <Input value={classTopic} onChange={e => setClassTopic(e.target.value)} placeholder="e.g. Advanced Physics Discussion" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Start Time</Label>
                                    <Input type="datetime-local" value={classTime} onChange={e => setClassTime(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Duration (Minutes)</Label>
                                    <Input type="number" value={classDuration} onChange={e => setClassDuration(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateClass}>Schedule</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => toast.success("Generating report...", { description: "Your PDF will be ready in a few seconds." })}>Download Report</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.total_revenue}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-muted-foreground font-medium">No Data</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_students}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            Current
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart Area */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>
                            A visual breakdown of your institute's revenue over the year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed text-muted-foreground">
                            No Revenue Data Available
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Live Classes */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Live Classes</CardTitle>
                        <CardDescription>
                            Your scheduled Zoom sessions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.upcoming_live_classes?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No classes scheduled.</p>
                            ) : stats.upcoming_live_classes?.map((cls: any) => (
                                <div key={cls.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-blue-500" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{cls.topic}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(cls.start_time).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={cls.start_url} target="_blank" rel="noopener noreferrer">Start</a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Exams</CardTitle>
                        <CardDescription>Scheduled Quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.upcoming_exams.length === 0 ? "No exams scheduled." : stats.upcoming_exams.map((exam: any) => (
                                <div key={exam.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{exam.title}</span>
                                    </div>
                                    <span className="text-xs bg-muted px-2 py-1 rounded">
                                        {new Date(exam.start_time).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Student Attendance</CardTitle>
                        <CardDescription>Today's Stats (Offline)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-center py-4">
                            {stats.attendance_percentage}%
                        </div>
                        <p className="text-center text-xs text-muted-foreground">Average across all offline batches</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
