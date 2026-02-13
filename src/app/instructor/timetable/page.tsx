"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const mockSchedule = [
    { id: 1, time: "09:00 AM", course: "Advanced React Patterns", room: "Studio A", type: "Live Session", instructor: "You" },
    { id: 2, time: "11:30 AM", course: "Python Data Science", room: "Virtual Lab 2", type: "Workshop", instructor: "You" },
    { id: 3, time: "02:00 PM", course: "UI/UX Design reviews", room: "Studio B", type: "Mentorship", instructor: "You" },
]

export default function TimetablePage() {
    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon to the Timetable.`);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Class Timetable</h2>
                    <p className="text-muted-foreground">Manage your weekly teaching schedule and live sessions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleAction("Previous Week")}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" className="font-bold">Jan 21 - Jan 27, 2026</Button>
                    <Button variant="outline" size="icon" onClick={() => handleAction("Next Week")}>
                        <ChevronRight className="size-4" />
                    </Button>
                    <Button onClick={() => handleAction("Add Class")}>
                        Add Class
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card">
                    <CardHeader className="bg-primary/5 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-5 text-primary" />
                                <CardTitle>Today's Schedule</CardTitle>
                            </div>
                            <span className="text-xs font-black uppercase text-primary tracking-widest">Wednesday</span>
                        </div>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                        {mockSchedule.map((item) => (
                            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
                                <div className="flex items-start gap-6">
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-xl font-black text-primary">{item.time.split(' ')[0]}</div>
                                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{item.time.split(' ')[1]}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-lg group-hover:text-primary transition-colors">{item.course}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><MapPin className="size-3" /> {item.room}</span>
                                            <span className="flex items-center gap-1.5"><Users className="size-3" /> 24 Students</span>
                                            <span className="flex items-center gap-1.5 font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" className="rounded-full px-6 font-bold" onClick={() => handleAction("Launch Live Room")}>
                                        Launch Room
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleAction("Edit Class Settings")}>
                                        <Clock className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Weekly Outlook</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {["Thursday", "Friday", "Saturday"].map((day, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-muted-foreground/10 transition-all cursor-pointer">
                                        <span className="font-bold text-sm">{day}</span>
                                        <span className="text-xs text-muted-foreground">{i + 2} sessions scheduled</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-indigo-500/5 border-indigo-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="size-4 text-indigo-500" />
                                Preparation Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You have a packed morning tomorrow. We suggest reviewing the "React Lifecycle" workshop materials tonight.
                            </p>
                            <Button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20" size="sm" onClick={() => handleAction("Check Prep Materials")}>
                                View Prep Materials
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
