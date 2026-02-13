"use client"

import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Briefcase, Calendar, DollarSign, MapPin, Phone } from "lucide-react"

export default function EmployeeDashboard() {
    const { user, isLoading } = useAuth()

    if (isLoading) return <div>Loading...</div>
    if (!user) return <div>Access Denied</div>

    const profile = user.profile || {
        designation: 'N/A',
        department: 'N/A',
        date_of_joining: '',
        phone_number: undefined,
        salary: undefined,
        address: 'N/A'
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Welcome, {user.first_name}</h1>
            <p className="text-muted-foreground">Employee Dashboard</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Profile Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Profile</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.first_name} {user.last_name}</div>
                        <p className="text-xs text-muted-foreground">{profile.designation}</p>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                                <Briefcase className="mr-2 h-3 w-3" /> {profile.department}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                                <MapPin className="mr-2 h-3 w-3" /> {profile.address}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Employment Details</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-sm text-muted-foreground">Employee ID</span>
                                <span className="font-mono text-sm">{user.employee_id}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-sm text-muted-foreground">Joined On</span>
                                <span className="text-sm">{profile.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Salary/Contact Card - Placeholder */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact & Info</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-sm"><span className="font-semibold">Email:</span> {user.email}</div>
                            <div className="text-sm"><span className="font-semibold">Phone:</span> {profile.phone_number || "N/A"}</div>
                        </div>
                        <Separator className="my-4" />
                        {profile.salary && (
                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                <DollarSign className="h-4 w-4" />
                                <span>***** (Hidden)</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
