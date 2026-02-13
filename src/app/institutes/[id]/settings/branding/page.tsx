"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Palette, Upload } from "lucide-react"

export default function BrandingSettingsPage() {
    const handleSave = () => {
        toast.success("Branding updated successfully.");
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Branding</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your student portal.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Logos</CardTitle>
                        <CardDescription>Upload your institute's logos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center border border-dashed border-muted-foreground/50">
                                <span className="text-xs text-muted-foreground">Logo</span>
                            </div>
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" /> Upload New
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme Colors</CardTitle>
                        <CardDescription>Pick your primary brand color.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                                <div className="h-8 w-8 rounded-full bg-[#6366f1] ring-2 ring-offset-2 ring-primary cursor-pointer" />
                                <div className="h-8 w-8 rounded-full bg-[#ec4899] cursor-pointer" />
                                <div className="h-8 w-8 rounded-full bg-[#14b8a6] cursor-pointer" />
                                <div className="h-8 w-8 rounded-full bg-[#f59e0b] cursor-pointer" />
                            </div>
                            <Input type="color" className="w-24 h-8 mt-2" defaultValue="#6366f1" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave}>Save Branding</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
