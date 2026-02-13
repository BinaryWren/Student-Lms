"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Check, Zap } from "lucide-react"

export default function InstructorBillingPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Institute Billing</h1>
                <p className="text-muted-foreground">Manage your institute's subscription and payouts.</p>
            </div>

            <Card className="bg-indigo-600 text-white shadow-xl border-none overflow-hidden">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl text-white">Enterprise Plan</CardTitle>
                            <CardDescription className="text-indigo-100">Unlimited students and storage.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white text-indigo-600">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">$199/mo</div>
                    <Button variant="secondary" className="mt-6">
                        <Zap className="mr-2 h-4 w-4 fill-current" /> Upgrade Features
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Total Students</span>
                            <span className="font-bold">1,234 / &infin;</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Storage Used</span>
                            <span className="font-bold">12.5 GB / 100 GB</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
