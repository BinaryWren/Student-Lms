"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Check } from "lucide-react"

export default function BillingPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your plan and payment methods.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Free Plan</CardTitle>
                                <CardDescription>Basic access for students.</CardDescription>
                            </div>
                            <Badge>Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$0/mo</div>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Complete Courses</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Basic Quizzes</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>No payment methods on file.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-32 flex items-center justify-center border-dashed border-2 rounded-lg">
                        <Button variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
