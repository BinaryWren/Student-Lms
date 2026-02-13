"use client"

import * as React from "react"
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday, parseISO } from "date-fns"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
// Combined Icon Imports
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CalendarEvent {
    id: string
    title: string
    start: string
    end: string | null
    type: 'EVENT' | 'ASSIGNMENT' | 'QUIZ' | 'LIVE_CLASS'
    description?: string
    course?: string
    color?: string
    allDay: boolean
}

export function CalendarView({ role = 'STUDENT' }: { role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'INSTITUTE_ADMIN' }) {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [events, setEvents] = React.useState<CalendarEvent[]>([])
    const [view, setView] = React.useState<'month' | 'agenda'>('month')
    const [loading, setLoading] = React.useState(false)

    // Add Event State
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [courses, setCourses] = React.useState<any[]>([])
    const [newEvent, setNewEvent] = React.useState({
        title: "",
        start_time: "",
        end_time: "",
        description: "",
        type: "EVENT",
        course: ""
    })

    React.useEffect(() => {
        fetchEvents()
        if (role === 'INSTRUCTOR') fetchCourses()
    }, [currentDate])

    async function fetchCourses() {
        try {
            const res = await api.get('/courses/')
            setCourses(res.data.results || res.data)
        } catch (e) {
            console.error("Failed to load courses")
        }
    }

    async function fetchEvents() {
        setLoading(true)
        try {
            const start = startOfWeek(startOfMonth(currentDate)).toISOString()
            const end = endOfWeek(endOfMonth(currentDate)).toISOString()
            const res = await api.get(`/calendar/events/?start=${start}&end=${end}`)
            setEvents(res.data)
        } catch (e) {
            console.error("Failed to fetch events", e)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddEvent() {
        if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
            toast.error("Please fill required fields")
            return
        }
        if (role === 'INSTRUCTOR' && !newEvent.course) {
            toast.error("Please select a course")
            return
        }

        try {
            await api.post('/calendar/events/', {
                ...newEvent,
                course: newEvent.course ? parseInt(newEvent.course) : null
            })
            toast.success("Event added")
            setIsAddOpen(false)
            fetchEvents()
            setNewEvent({ title: "", start_time: "", end_time: "", description: "", type: "EVENT", course: "" })
        } catch (e: any) {
            toast.error(e.response?.data?.detail || "Failed to add event")
        }
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const jumpToday = () => setCurrentDate(new Date())

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate)),
        end: endOfWeek(endOfMonth(currentDate))
    })

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(parseISO(event.start), date))
    }

    const renderEventContent = (event: CalendarEvent) => (
        <div className="space-y-2">
            <h4 className="font-medium leading-none">{event.title}</h4>
            <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(event.start), 'p')}
                    {event.end && ` - ${format(parseISO(event.end), 'p')}`}
                </div>
                {event.course && <span>{event.course}</span>}
                {event.description && <span className="opacity-90">{event.description}</span>}
            </div>
            <Badge variant="outline" className="text-[10px] h-5" style={{ borderColor: event.color, color: event.color }}>
                {event.type.replace('_', ' ')}
            </Badge>
        </div>
    )

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center rounded-md border bg-muted/50 p-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={jumpToday}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(role === 'INSTRUCTOR' || role === 'ADMIN' || role === 'INSTITUTE_ADMIN') && (
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Calendar Event</DialogTitle>
                                    <DialogDescription>Create a new event for your students.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={newEvent.title}
                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                            placeholder="Event Title"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={newEvent.start_time}
                                                onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={newEvent.end_time}
                                                onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                            value={newEvent.type}
                                            onValueChange={v => setNewEvent({ ...newEvent, type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EVENT">General Event</SelectItem>
                                                <SelectItem value="MEETING">Meeting</SelectItem>
                                                <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {role === 'INSTRUCTOR' && (
                                        <div className="space-y-2">
                                            <Label>Course</Label>
                                            <Select
                                                value={newEvent.course}
                                                onValueChange={v => setNewEvent({ ...newEvent, course: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Course" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courses.map(c => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>
                                                            {c.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={newEvent.description}
                                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddEvent}>Save Event</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 hidden sm:flex"
                        onClick={() => window.open(`${api.defaults.baseURL}calendar/events/export/`, '_blank')}
                    >
                        <CalendarIcon className="h-4 w-4" /> Export
                    </Button>
                    <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('month')}
                        className="gap-2"
                    >
                        <CalendarIcon className="h-4 w-4" /> Month
                    </Button>
                    <Button
                        variant={view === 'agenda' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('agenda')}
                        className="gap-2"
                    >
                        <List className="h-4 w-4" /> Agenda
                    </Button>
                </div>
            </div>

            {view === 'month' ? (
                // ... (Existing Month View - Keep as is)
                <Card className="flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-7 border-b bg-muted/40">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                        {days.map((day, dayIdx) => {
                            const dayEvents = getEventsForDay(day)
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "min-h-[100px] border-b border-r p-2 transition-colors hover:bg-muted/50 flex flex-col gap-1",
                                        !isSameMonth(day, currentDate) && "bg-muted/20 text-muted-foreground",
                                        dayIdx % 7 === 0 && "border-l",
                                        isToday(day) && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                        isToday(day) ? "bg-primary text-primary-foreground" : ""
                                    )}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        {dayEvents.map(event => (
                                            <Popover key={event.id}>
                                                <PopoverTrigger asChild>
                                                    <button className="text-left text-[10px] px-1.5 py-0.5 rounded border truncate w-full transition-all hover:brightness-95"
                                                        style={{
                                                            backgroundColor: (event.color || '#64748b') + '20',
                                                            borderColor: (event.color || '#64748b') + '40',
                                                            color: event.color || '#64748b'
                                                        }}
                                                    >
                                                        {event.title}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-3" align="start">
                                                    {renderEventContent(event)}
                                                </PopoverContent>
                                            </Popover>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground pl-1">
                                                +{dayEvents.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            ) : (
                // ... (Existing Agenda View - Keep as is)
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {days.filter(d => getEventsForDay(d).length > 0).map(day => (
                                <div key={day.toISOString()} className="flex gap-4">
                                    <div className="w-16 flex-shrink-0 flex flex-col items-center">
                                        <span className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</span>
                                        <span className={cn(
                                            "text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center",
                                            isToday(day) ? "bg-primary text-primary-foreground" : ""
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-2 pt-1">
                                        {getEventsForDay(day).map(event => (
                                            <Card key={event.id} className="p-3 flex items-start justify-between hover:bg-muted/50 cursor-pointer">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium ml-2 border-l-2 pl-2" style={{ borderColor: event.color }}>{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground pl-2">{event.course} • {format(parseISO(event.start), 'p')}</p>
                                                </div>
                                                <Badge variant="outline" style={{ color: event.color, borderColor: event.color }}>
                                                    {event.type}
                                                </Badge>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No events scheduled for this month.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            )}
        </div>
    )
}
