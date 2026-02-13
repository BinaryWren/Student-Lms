"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError("")

        // Clear existing tokens to prevent 401 from middleware if token is invalid
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')

        try {
            // 1. JWT Login
            const response = await api.post('/auth/login/', { ...values, username: values.username.trim() });
            const { access, refresh } = response.data;

            // 2. Fetch User Details
            localStorage.setItem('access_token', access);

            let userData = null;
            try {
                // Pass token explicitly to avoid any interceptor delay
                const userRes = await api.get('/users/me/', {
                    headers: { Authorization: `Bearer ${access}` }
                });
                userData = userRes.data;
                console.log("Logged in user data:", userData);
            } catch (e) {
                console.error("Could not fetch user info", e);
            }

            if (userData) {
                localStorage.setItem('user_data', JSON.stringify(userData));
            }

            // 3. Complete Login
            await login({ access, refresh });

            // 4. Redirect based on role
            // 4. Redirect based on role
            if (userData?.role === 'STUDENT' || userData?.role === 'ALUMNI') {
                router.push('/student/dashboard');
            } else if (userData?.role === 'INSTRUCTOR') {
                router.push('/instructor/dashboard');
            } else if (['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'HR', 'EMPLOYEE'].includes(userData?.role)) {
                // Determine which institute to land on
                if (userData.institute) {
                    router.push(`/institutes/${userData.institute}/dashboard`);
                } else {
                    // Fetch institutes to find a landing spot
                    try {
                        const instRes = await api.get('/institutes/', {
                            headers: { Authorization: `Bearer ${access}` }
                        });
                        const insts = Array.isArray(instRes.data) ? instRes.data : (instRes.data.results || []);
                        console.log("Found institutes for landing:", insts);
                        if (insts.length > 0) {
                            const target = `/institutes/${insts[0].id}/dashboard`;
                            console.log("Redirecting to institute dashboard:", target);
                            router.push(target);
                        } else {
                            console.log("No institutes found, going to landing");
                            router.push('/');
                        }
                    } catch (e) {
                        console.error("Failed to find landing institute", e);
                        router.push('/');
                    }
                }
            } else {
                router.push('/');
            }

        } catch (err: any) {
            console.error("Login Failed:", err);
            setError("Invalid credentials. Employees must use their Employee ID (EMP-...).");
            localStorage.removeItem('access_token'); // cleanup if failed
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username / Employee ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username or EMP-..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-xs text-center text-muted-foreground w-full">
                        <p>Demo Credentials:</p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <code className="bg-muted px-1 py-0.5 rounded text-[10px]">ecs_admin / pass123</code>
                            <code className="bg-muted px-1 py-0.5 rounded text-[10px]">instructor_jane / pass123</code>
                            <code className="bg-muted px-1 py-0.5 rounded text-[10px]">alex_student / pass123</code>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary font-bold hover:underline">
                            Register as Student
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
