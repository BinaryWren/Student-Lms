"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { GraduationCap, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdmissionForm } from "@/components/admission-form"

export default function RegisterPage() {
    const [success, setSuccess] = useState(false)

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary animate-pulse">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black">Application Received!</h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for applying. Our administration team will review your application and contact you via email shortly.
                    </p>
                    <Button asChild variant="outline" className="rounded-full px-8">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white py-12 px-6 font-sans">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-2xl">
                        <GraduationCap className="h-10 w-10" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">Online Admission</h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">Complete the form below to apply for your desired course.</p>
                </div>

                <Card className="bg-white/[0.03] border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl p-8 md:p-12">
                    <AdmissionForm onSuccess={() => setSuccess(true)} />
                </Card>

                <p className="text-center text-sm text-white/40 pb-12">
                    Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    )
}
