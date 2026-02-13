"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Bell, Check, ChevronRight, Mail, Plus, User, Search, Settings, Loader2 } from "lucide-react"

export default function DesignSystemPage() {
    return (
        <div className="container mx-auto py-10 px-6 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Design System & Component Inventory</h1>
                <p className="text-xl text-muted-foreground">
                    A collection of reusable components built with shadcn/ui + Tailwind CSS.
                    Themed with "Outfit" font and rich violet primary colors.
                </p>
            </div>

            <Separator />

            {/* Buttons Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 p-2 rounded-md text-primary"><Settings className="w-5 h-5" /></span>
                    Buttons
                </h2>
                <div className="flex flex-wrap gap-4">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link Button</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large Button</Button>
                    <Button disabled>Disabled</Button>
                    <Button>
                        <Mail className="mr-2 h-4 w-4" /> With Icon
                    </Button>
                    <Button variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </Button>
                </div>
            </section>

            <Separator />

            {/* Badges & Avatars */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Badges & Avatars</h2>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex gap-2">
                        <Badge>Default Badge</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="https://ui.shadcn.com/avatars/02.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">AB</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Inputs & Forms */}
            <section className="space-y-6 max-w-xl">
                <h2 className="text-2xl font-semibold">Inputs & Form Elements</h2>
                <div className="grid gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" placeholder="Email" />
                    </div>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="email" placeholder="Subscribe to newsletter" />
                        <Button type="submit">Subscribe</Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </div>
            </section>

            <Separator />

            {/* Cards */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Project</CardTitle>
                            <CardDescription>Deploy your new project in one-click.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Name of your project" />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Cancel</Button>
                            <Button>Deploy</Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary">Premium Plan</CardTitle>
                            <CardDescription>Unlock all features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Students</li>
                                <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Custom Branding</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Upgrade</Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            <Separator />

            {/* Interactive Elements (Dialog, Dropdown, Tabs, Toast) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Interactive Components</h2>
                <div className="flex flex-wrap gap-8">

                    {/* Dialog */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Dialog</Label>
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Open Dialog</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your profile here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="username" className="text-right">Username</Label>
                                            <Input id="username" value="@peduarte" className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Dropdown */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Dropdown</Label>
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Open Menu</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="space-y-2 w-full max-w-[400px]">
                        <Label className="text-muted-foreground">Tabs</Label>
                        <Tabs defaultValue="account" className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="account">Account</TabsTrigger>
                                <TabsTrigger value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account</CardTitle>
                                        <CardDescription>
                                            Make changes to your account here.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline">Click me</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="password">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Password</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Input placeholder="Current password" />
                                        <Input placeholder="New password" />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Toasts */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Toasts (Sonner)</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => toast("Event has been created")}>
                                Show Toast
                            </Button>
                            <Button variant="outline" onClick={() => toast.success("Success! Data saved.")}>
                                Success Toast
                            </Button>
                            <Button variant="outline" onClick={() => toast.error("Something went wrong.")}>
                                Error Toast
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
