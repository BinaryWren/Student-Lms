"use client"

import * as React from "react"
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Mock events
const events = [
    {
        id: 1,
        title: "Semester Start",
        date: new Date(), // Today
        type: "academic",
        color: "bg-blue-500",
    },
    {
        id: 2,
        title: "Faculty Meeting",
        date: addDays(new Date(), 2),
        type: "administrative",
        color: "bg-purple-500",
    },
    {
        id: 3,
        title: "Mid-term Exams",
        date: addDays(new Date(), 10),
        type: "exam",
        color: "bg-red-500",
    },
]

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = React.useState(new Date())

    const getDaysInMonth = (date: Date) => {
        const start = startOfWeek(startOfMonth(date))
        const end = endOfWeek(endOfMonth(date))
        return eachDayOfInterval({ start, end })
    }

    const days = getDaysInMonth(currentDate)
    const currentMonthName = format(currentDate, "MMMM yyyy")

    const handlePreviousMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }
    const handleNextMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-xl font-semibold capitalize">
                                {currentMonthName}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Calendar Days Header */}
                            <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-muted-foreground">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="py-2">{day}</div>
                                ))}
                            </div>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, idx) => {
                                    const dayEvents = events.filter(e => isSameDay(e.date, day))
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "min-h-[100px] border rounded-md p-2 flex flex-col items-start justify-start gap-1 transition-colors hover:bg-muted/50",
                                                !isSameMonth(day, currentDate) && "bg-muted/30 text-muted-foreground",
                                                isToday(day) && "ring-2 ring-primary ring-inset"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                                isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                                            )}>
                                                {format(day, "d")}
                                            </span>
                                            {dayEvents.map(event => (
                                                <div key={event.id} className={cn("text-[10px] w-full px-1 py-0.5 rounded truncate text-white", event.color)}>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {events.length > 0 ? (
                                events.map(event => (
                                    <div key={event.id} className="flex items-start space-x-3 pb-3 border-b last:border-0 last:pb-0">
                                        <div className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0", event.color)} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">{format(event.date, "PPP")}</p>
                                            <div className="flex items-center text-xs text-muted-foreground pt-1">
                                                <Clock className="w-3 h-3 mr-1" /> All Day
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No upcoming events.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
