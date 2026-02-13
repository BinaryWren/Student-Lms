"use client"

import { useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ClipboardCheck } from "lucide-react"

interface AttendanceProps {
    courseId: string
    courseTitle: string
    onMarked: () => void
}

export function AttendanceAction({ courseId, courseTitle, onMarked }: AttendanceProps) {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'INACTIVE'>('IDLE')
    const [reason, setReason] = useState("")

    const handleMark = async () => {
        setStatus('LOADING')
        try {
            const res = await api.post('/daily-attendance/mark/', { course: courseId })
            toast.success("Attendance marked for today!")
            onMarked()
            setStatus('IDLE')
        } catch (e: any) {
            console.error(e)
            if (e.response?.data?.code === 'INACTIVE_ACCOUNT') {
                setStatus('INACTIVE')
            } else if (e.response?.data?.status === 'ALREADY_MARKED') {
                toast.info("Already marked for today.")
                setStatus('IDLE')
            } else {
                toast.error("Failed to mark attendance.")
                setStatus('IDLE')
            }
        }
    }

    const handleSubmitApplication = async () => {
        try {
            await api.post('/attendance-applications/', {
                course: courseId,
                reason: reason
            })
            toast.success("Restoration application submitted. Please wait for specific instructor approval.")
            setStatus('IDLE')
        } catch (e: any) {
            console.error(e)
            toast.error("Failed to submit application.")
        }
    }

    if (status === 'INACTIVE') {
        return (
            <Dialog open={true} onOpenChange={(open) => !open && setStatus('IDLE')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Account Inactive</DialogTitle>
                        <DialogDescription>
                            Your dashboard access for <b>{courseTitle}</b> has been deactivated due to 4+ consecutive days of absence.
                            Please submit a reason to your instructor to request re-activation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reason for Absence</Label>
                            <Textarea
                                placeholder="I was sick / I had connectivity issues..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatus('IDLE')}>Cancel</Button>
                        <Button onClick={handleSubmitApplication}>Submit Application</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Button size="sm" variant="outline" onClick={handleMark} disabled={status === 'LOADING'} className="h-9 px-3 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
            <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
            {status === 'LOADING' ? "..." : "Mark Present"}
        </Button>
    )
}
