"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function BillingSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing & Plans</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription and payment methods.
                </p>
            </div>
            <Separator />

            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Enterprise Plan</CardTitle>
                            <CardDescription>You are currently on the Enterprise tier.</CardDescription>
                        </div>
                        <Badge className="bg-primary">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Unlimited Students</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Custom Domain</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => toast.info("Billing portal redirect...")}>
                        Manage Subscription
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your default payment method.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 border p-4 rounded-md">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Visa ending in 4242</p>
                            <p className="text-xs text-muted-foreground">Expires 12/28</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
