"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogDescription, DialogTrigger
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Search, DollarSign, Wallet, CreditCard, Banknote, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"

interface FeeRecord {
    id: number
    student: number
    student_name: string
    total_amount: string
    amount_paid: string
    due_date: string
    payment_date: string | null
    payment_method: string
    status: string
    remarks: string
}

interface SalaryRecord {
    id: number
    employee: number
    employee_name: string
    amount: string
    month: number
    year: number
    payment_date: string | null
    status: string
    remarks: string
}

interface OtherTransaction {
    id: number
    title: string
    description: string
    amount: string
    transaction_type: 'INCOME' | 'EXPENSE'
    date: string
}

export default function FinancePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') || 'fees'
    const instituteId = params.id

    const [activeTab, setActiveTab] = useState(initialTab)
    const [fees, setFees] = useState<FeeRecord[]>([])
    const [salaries, setSalaries] = useState<SalaryRecord[]>([])
    const [otherTransactions, setOtherTransactions] = useState<OtherTransaction[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        revenue: 0,
        expenditure: 0,
        profit: 0
    })

    // Modals
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false)
    const [isOtherModalOpen, setIsOtherModalOpen] = useState(false)

    // Form states
    const [feeForm, setFeeForm] = useState({
        student: '',
        total_amount: '',
        amount_paid: '0',
        due_date: '',
        payment_method: 'CASH',
        status: 'UNPAID',
        remarks: ''
    })

    const [salaryForm, setSalaryForm] = useState({
        employee: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'PENDING',
        remarks: ''
    })

    const [otherForm, setOtherForm] = useState({
        title: '',
        description: '',
        amount: '',
        transaction_type: 'INCOME',
        date: new Date().toISOString().split('T')[0]
    })

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [feeRes, salRes, stuRes, empRes, otherRes] = await Promise.all([
                api.get(`/finance/fees/?institute_id=${instituteId}`),
                api.get(`/finance/salaries/?institute_id=${instituteId}`),
                api.get(`/users/?role=STUDENT&institute_id=${instituteId}`),
                api.get(`/hr/employees/?institute_id=${instituteId}`),
                api.get(`/finance/other-transactions/?institute_id=${instituteId}`)
            ])
            setFees(feeRes.data)
            setSalaries(salRes.data)
            setStudents(stuRes.data.results || stuRes.data)
            setEmployees(empRes.data)
            setOtherTransactions(otherRes.data)

            // Calculate Stats
            const feeRevenue = feeRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount_paid || 0), 0)
            const otherIncome = otherRes.data
                .filter((t: any) => t.transaction_type === 'INCOME')
                .reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0)

            const revenue = feeRevenue + otherIncome

            const salaryExpenditure = salRes.data
                .filter((s: any) => s.status === 'PAID')
                .reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0)

            const otherExpenses = otherRes.data
                .filter((t: any) => t.transaction_type === 'EXPENSE')
                .reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0)

            const expenditure = salaryExpenditure + otherExpenses

            setStats({
                revenue,
                expenditure,
                profit: revenue - expenditure
            })
        } catch (e) {
            toast.error("Failed to load finance records")
        } finally {
            setIsLoading(false)
        }
    }, [instituteId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreateFee = async () => {
        try {
            await api.post(`/finance/fees/?institute_id=${instituteId}`, {
                ...feeForm,
                institute: instituteId
            })
            toast.success("Fee record created")
            setIsFeeModalOpen(false)
            fetchData()
        } catch (e) {
            toast.error("Failed to create fee record")
        }
    }

    const handleCreateSalary = async () => {
        try {
            await api.post(`/finance/salaries/?institute_id=${instituteId}`, {
                ...salaryForm,
                institute: instituteId
            })
            toast.success("Salary record created")
            setIsSalaryModalOpen(false)
            fetchData()
        } catch (e) {
            toast.error("Failed to create salary record")
        }
    }

    const handleCreateOther = async () => {
        try {
            await api.post(`/finance/other-transactions/?institute_id=${instituteId}`, {
                ...otherForm,
                institute: instituteId
            })
            toast.success("Transaction recorded")
            setIsOtherModalOpen(false)
            setOtherForm({
                title: '', description: '', amount: '',
                transaction_type: 'INCOME', date: new Date().toISOString().split('T')[0]
            })
            fetchData()
        } catch (e) {
            toast.error("Failed to record transaction")
        }
    }

    const deleteFee = async (id: number) => {
        if (!confirm("Are you sure?")) return
        try {
            await api.delete(`/finance/fees/${id}/?institute_id=${instituteId}`)
            toast.success("Record deleted")
            fetchData()
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    const deleteSalary = async (id: number) => {
        if (!confirm("Are you sure?")) return
        try {
            await api.delete(`/finance/salaries/${id}/?institute_id=${instituteId}`)
            toast.success("Record deleted")
            fetchData()
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    const deleteOther = async (id: number) => {
        if (!confirm("Are you sure?")) return
        try {
            await api.delete(`/finance/other-transactions/${id}/?institute_id=${instituteId}`)
            toast.success("Record deleted")
            fetchData()
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
                    <p className="text-muted-foreground">Manage student fees and employee salaries.</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'fees' && (
                        <Button onClick={() => setIsFeeModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Fee Record
                        </Button>
                    )}
                    {activeTab === 'salaries' && (
                        <Button onClick={() => setIsSalaryModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Pay Salary
                        </Button>
                    )}
                    {activeTab === 'other' && (
                        <Button onClick={() => setIsOtherModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">${stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-blue-500 mt-1">From student fee collections</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 uppercase tracking-wider flex items-center gap-2">
                            <Banknote className="h-4 w-4" /> Total Expenditures
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900">${stats.expenditure.toLocaleString()}</div>
                        <p className="text-xs text-red-500 mt-1">Paid staff salaries</p>
                    </CardContent>
                </Card>

                <Card className={`${stats.profit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100'} shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium uppercase tracking-wider flex items-center gap-2 ${stats.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                            <Wallet className="h-4 w-4" /> Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-900' : 'text-rose-900'}`}>
                            ${stats.profit.toLocaleString()}
                        </div>
                        <p className={`text-xs mt-1 ${stats.profit >= 0 ? 'text-green-500' : 'text-rose-500'}`}>
                            {stats.profit >= 0 ? 'Positive balance' : 'Operating at a loss'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="fees">Fee Management</TabsTrigger>
                    <TabsTrigger value="salaries">Salary Management</TabsTrigger>
                    <TabsTrigger value="other">Other Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="fees" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Fees</CardTitle>
                            <CardDescription>Records of all student payments and dues.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fees.map(fee => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-medium">{fee.student_name}</TableCell>
                                            <TableCell>${fee.total_amount}</TableCell>
                                            <TableCell>${fee.amount_paid}</TableCell>
                                            <TableCell>
                                                <Badge variant={fee.status === 'PAID' ? 'default' : fee.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                                                    {fee.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{fee.due_date}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => deleteFee(fee.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {fees.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No fee records found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="salaries" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Salaries</CardTitle>
                            <CardDescription>Monthly salary disbursements and history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Month/Year</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salaries.map(sal => (
                                        <TableRow key={sal.id}>
                                            <TableCell className="font-medium">{sal.employee_name}</TableCell>
                                            <TableCell>${sal.amount}</TableCell>
                                            <TableCell>{sal.month}/{sal.year}</TableCell>
                                            <TableCell>
                                                <Badge variant={sal.status === 'PAID' ? 'default' : 'outline'}>
                                                    {sal.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{sal.payment_date || '-'}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => deleteSalary(sal.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {salaries.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No salary records found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="other" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Miscellaneous Transactions</CardTitle>
                            <CardDescription>General income and expenditures tracker.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {otherTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">
                                                <div>{t.title}</div>
                                                <div className="text-xs text-muted-foreground">{t.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={t.transaction_type === 'INCOME' ? 'default' : 'destructive'}>
                                                    {t.transaction_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={t.transaction_type === 'INCOME' ? 'text-green-600' : 'text-red-600 font-medium'}>
                                                {t.transaction_type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{t.date}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => deleteOther(t.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {otherTransactions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No transactions recorded.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Fee Modal */}
            <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Fee Record</DialogTitle>
                        <DialogDescription>Create a new fee obligation for a student.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Student</Label>
                            <Select onValueChange={(v) => setFeeForm({ ...feeForm, student: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.first_name} {s.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Amount</Label>
                                <Input type="number" value={feeForm.total_amount} onChange={e => setFeeForm({ ...feeForm, total_amount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount Paid</Label>
                                <Input type="number" value={feeForm.amount_paid} onChange={e => setFeeForm({ ...feeForm, amount_paid: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={feeForm.due_date} onChange={e => setFeeForm({ ...feeForm, due_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={feeForm.status} onValueChange={v => setFeeForm({ ...feeForm, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFeeModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateFee}>Create Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Salary Modal */}
            <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pay Salary</DialogTitle>
                        <DialogDescription>Record a salary payment for an employee.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Employee</Label>
                            <Select onValueChange={(v) => {
                                const emp = employees.find(e => e.id.toString() === v)
                                setSalaryForm({ ...salaryForm, employee: v, amount: emp?.profile?.salary || '' })
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={e.id.toString()}>{e.first_name} {e.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input type="number" value={salaryForm.amount} onChange={e => setSalaryForm({ ...salaryForm, amount: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Month</Label>
                                <Input type="number" min="1" max="12" value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input type="number" value={salaryForm.year} onChange={e => setSalaryForm({ ...salaryForm, year: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={salaryForm.status} onValueChange={v => setSalaryForm({ ...salaryForm, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSalaryModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSalary}>Record Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Other Transaction Modal */}
            <Dialog open={isOtherModalOpen} onOpenChange={setIsOtherModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Transaction</DialogTitle>
                        <DialogDescription>Record generic income or expense.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={otherForm.title} onChange={e => setOtherForm({ ...otherForm, title: e.target.value })} placeholder="e.g. Office Rent, Sale of Books" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={otherForm.description} onChange={e => setOtherForm({ ...otherForm, description: e.target.value })} placeholder="Optional details" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" value={otherForm.amount} onChange={e => setOtherForm({ ...otherForm, amount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={otherForm.date} onChange={e => setOtherForm({ ...otherForm, date: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={otherForm.transaction_type} onValueChange={v => setOtherForm({ ...otherForm, transaction_type: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Income/Revenue</SelectItem>
                                    <SelectItem value="EXPENSE">Expenditure/Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOtherModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateOther}>Save Transaction</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
