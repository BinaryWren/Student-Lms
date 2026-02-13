"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Palette, Upload, Image as ImageIcon, Check } from "lucide-react"

const colors = [
    { name: "Ocean", hex: "#0ea5e9" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Indigo", hex: "#6366f1" },
]

export default function BrandingSettingsPage() {
    const [selectedColor, setSelectedColor] = useState("#6366f1")

    const handleSave = () => {
        toast.success("Branding preferences saved!", {
            description: "Your portal theme has been updated across all devices."
        })
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Branding & Identity</h2>
                <p className="text-muted-foreground">Customize the look and feel of your learning environment.</p>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="size-5 text-primary" />
                            <CardTitle>Logo & Assets</CardTitle>
                        </div>
                        <CardDescription>Upload your institute's logo and favicon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="space-y-4">
                                <Label>Main Logo</Label>
                                <div className="size-32 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => toast.info("Logo upload builder coming soon.")}>
                                    <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] mt-2 font-bold uppercase text-muted-foreground">Upload PNG/SVG</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <Label>Portal Name</Label>
                                <Input defaultValue="Acme Academy" placeholder="e.g. My Institute" />
                                <p className="text-xs text-muted-foreground">This name appears in the browser tab and sidebar.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="size-5 text-primary" />
                            <CardTitle>Theme Colors</CardTitle>
                        </div>
                        <CardDescription>Choose a primary color that matches your brand identity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {colors.map((color) => (
                                <button
                                    key={color.hex}
                                    onClick={() => setSelectedColor(color.hex)}
                                    className={`relative h-12 rounded-lg transition-all ${selectedColor === color.hex ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105 opacity-80'}`}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    {selectedColor === color.hex && (
                                        <Check className="size-5 text-white absolute inset-0 m-auto" />
                                    )}
                                    <span className="sr-only font-bold">{color.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-muted-foreground/10">
                            <p className="text-sm font-medium">Selected Theme: <span className="font-bold" style={{ color: selectedColor }}>{colors.find(c => c.hex === selectedColor)?.name}</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="px-8 bg-primary shadow-lg shadow-primary/20">
                    Apply Branding
                </Button>
            </div>
        </div>
    )
}
