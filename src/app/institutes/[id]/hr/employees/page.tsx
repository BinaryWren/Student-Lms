"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, User, Search, Copy, Check, Eye } from "lucide-react"
import { toast } from "sonner"

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
    employee_id: string
    role: string
    profile?: {
        designation: string
        department: string
        phone_number: string
        date_of_joining: string
        salary?: string | number
        address?: string
    }
    raw_password?: string
}

export default function HREmployeesPage() {
    const params = useParams()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [credentialsModal, setCredentialsModal] = useState<{ user: Employee, pass: string } | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role_type: 'EMPLOYEE',
        designation: '',
        department: '',
        date_of_joining: '',
        phone_number: '',
        salary: '',
        address: '' // Optional
    })

    const fetchEmployees = async () => {
        try {
            // Pass institute_id for admins who might not have user.institute set
            const res = await api.get(`/hr/employees/?institute_id=${params.id}`)
            setEmployees(res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load employees")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const handleSave = async () => {
        try {
            // Clean payload
            // Clean payload
            const payload = { ...formData, institute_id: params.id }

            const requiredFields = ['first_name', 'last_name', 'email', 'designation', 'department', 'date_of_joining']
            const missing = requiredFields.filter(f => !payload[f as keyof typeof payload])
            if (missing.length > 0) {
                toast.error(`Required fields missing: ${missing.map(f => f.replace(/_/g, ' ')).join(', ')}`)
                return
            }
            // Optional fields: send undefined/null if empty to avoid 400 validation error
            if (payload.salary === '') (payload as any).salary = null
            if (payload.phone_number === '') (payload as any).phone_number = null
            if (payload.address === '') (payload as any).address = ''

            // Note: Backend 'salary' expects Decimal or None. '' fails.

            if (editingId) {
                const res = await api.patch(`/hr/employees/${editingId}/?institute_id=${params.id}`, payload)
                const updated = res.data
                setEmployees(employees.map(e => e.id === editingId ? updated : e))
                toast.success("Employee updated successfully")
                setIsCreateOpen(false)
                setEditingId(null)
            } else {
                const res = await api.post('/hr/employees/', payload)
                const newEmp = res.data

                setEmployees([newEmp, ...employees])
                setIsCreateOpen(false)
                setCredentialsModal({ user: newEmp, pass: newEmp.raw_password || '' })
                toast.success("Employee created successfully")
            }

            // Reset form
            setFormData({
                first_name: '', last_name: '', email: '', role_type: 'EMPLOYEE',
                designation: '', department: '', date_of_joining: '',
                phone_number: '', salary: '', address: ''
            })
        } catch (e: any) {
            console.error("Save Error:", e)
            console.error("Response Data:", e.response?.data)
            if (e.response?.data) {
                const errors = e.response.data
                let msg = "Operation failed"
                if (typeof errors === 'object' && !errors.detail) {
                    // Extract field errors
                    msg = Object.entries(errors)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
                        .join('. ')
                } else if (errors.detail) {
                    msg = errors.detail
                }
                toast.error(msg)
            } else {
                toast.error("Operation failed")
            }
        }
    }

    const handleEdit = (emp: Employee) => {
        setFormData({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            role_type: emp.role,
            designation: emp.profile?.designation || '',
            department: emp.profile?.department || '',
            date_of_joining: emp.profile?.date_of_joining || '',
            phone_number: emp.profile?.phone_number || '',
            salary: (emp.profile as any)?.salary || '',
            address: emp.profile?.address || ''
        })
        setEditingId(emp.id)
        setIsCreateOpen(true)
    }

    const openCreate = () => {
        setFormData({
            first_name: '', last_name: '', email: '', role_type: 'EMPLOYEE',
            designation: '', department: '', date_of_joining: '',
            phone_number: '', salary: '', address: ''
        })
        setEditingId(null)
        setIsCreateOpen(true)
    }

    const handleViewCredentials = (emp: Employee) => {
        setCredentialsModal({ user: emp, pass: emp.raw_password || 'Not Available' })
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this employee?")) return
        try {
            await api.delete(`/hr/employees/${id}/?institute_id=${params.id}`)
            setEmployees(employees.filter(e => e.id !== id))
            toast.success("Employee removed")
        } catch (e) {
            toast.error("Failed to delete")
        }
    }


    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">HR Management</h1>
                    <p className="text-muted-foreground">Manage employees, roles, and access.</p>
                </div>
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No employees found.</TableCell>
                            </TableRow>
                        ) : (
                            employees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                                            <span className="text-xs text-muted-foreground">{emp.email}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{emp.employee_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={emp.role === 'HR' ? 'destructive' : 'secondary'}>
                                            {emp.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{emp.profile?.designation || 'N/A'}</TableCell>
                                    <TableCell>{emp.profile?.department || 'N/A'}</TableCell>
                                    <TableCell>{emp.profile?.date_of_joining ? new Date(emp.profile.date_of_joining).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewCredentials(emp)} title="View Credentials">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDelete(emp.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Update employee details.' : 'Fill in the details. Credentials will be auto-generated.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                            <div className="space-y-2">
                                <Label>Role Access</Label>
                                <Select value={formData.role_type} onValueChange={v => setFormData({ ...formData, role_type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMPLOYEE">Regular Employee</SelectItem>
                                        <SelectItem value="HR">HR Manager</SelectItem>
                                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                        <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Joining</Label>
                                <Input type="date" value={formData.date_of_joining} onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Input placeholder="e.g. IT, Sales" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Designation</Label>
                            <Input placeholder="e.g. Developer" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Salary</Label>
                            <Input type="number" placeholder="0.00" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editingId ? 'Update Employee' : 'Create & Generate Login'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credentials Success Dialog */}
            <Dialog open={!!credentialsModal} onOpenChange={(open) => !open && setCredentialsModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-green-600 flex items-center gap-2">
                            <Check className="h-5 w-5" /> Employee Added Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Please copy these credentials and share them with the employee. They cannot be retrieved later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="font-semibold">Name:</span>
                            <span className="col-span-2">{credentialsModal?.user.first_name} {credentialsModal?.user.last_name}</span>

                            <span className="font-semibold">Login ID:</span>
                            <div className="col-span-2 flex items-center gap-2">
                                <code className="bg-white px-1.5 py-0.5 rounded border">{credentialsModal?.user.employee_id}</code>
                                <Copy className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary" onClick={() => handleCopy(credentialsModal?.user.employee_id || '', 'Login ID')} />
                            </div>

                            <span className="font-semibold">Password:</span>
                            <div className="col-span-2 flex items-center gap-2">
                                <code className="bg-white px-1.5 py-0.5 rounded border text-red-600 font-bold">{credentialsModal?.pass}</code>
                                <Copy className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary" onClick={() => handleCopy(credentialsModal?.pass || '', 'Password')} />
                            </div>

                            <span className="font-semibold">Role:</span>
                            <span className="col-span-2">{credentialsModal?.user.role}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCredentialsModal(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
