"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, MoreHorizontal, Plus, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useParams } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"

export default function EventsPage() {
    const [events, setEvents] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    // Form State
    const [title, setTitle] = React.useState("")
    const [date, setDate] = React.useState("")
    const [category, setCategory] = React.useState("EVENT")

    const params = useParams()
    const instituteId = params.id as string

    React.useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await api.get('/calendar-manual/')
            setEvents(res.data)
        } catch (error) {
            console.error("Failed to fetch events", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateEvent = async () => {
        if (!title || !date) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            // Construct start/end times (All day for simplicity)
            const startDate = new Date(date)
            const endDate = new Date(date)
            // Set to noon to avoid timezone rollover issues for now, or use ISO string of date
            // Better: Start of day / End of day in UTC or local? Backend stores DateTime. 
            // Let's send ISO strings.
            const startStr = new Date(date + 'T09:00:00').toISOString()
            const endStr = new Date(date + 'T17:00:00').toISOString()

            await api.post('/calendar-manual/', {
                title,
                start_time: startStr,
                end_time: endStr,
                event_type: category,
                // description: "..."
            })

            toast.success("Event created successfully")
            setIsAddOpen(false)
            setTitle("")
            setDate("")
            fetchEvents()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create event")
        }
    }

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
                    <p className="text-muted-foreground">
                        Create and manage institute-wide events and holidays.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>
                                Create a new event for the academic calendar.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Annual Sports Day"
                                    className="col-span-3"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    className="col-span-3"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Category
                                </Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EVENT">Event</SelectItem>
                                        <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                        <SelectItem value="MEETING">Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateEvent}>Create Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event) => {
                            const isUpcoming = new Date(event.start_time) > new Date();
                            return (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {format(new Date(event.start_time), "PP")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{event.event_type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={isUpcoming ? "default" : "secondary"}>{isUpcoming ? "Upcoming" : "Past"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Event</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Delete Event</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
