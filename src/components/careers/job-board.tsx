"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Briefcase, MapPin, Clock, DollarSign, Building, ExternalLink, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function JobBoard() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = () => {
        setLoading(true)
        api.get('/careers/jobs/').then(res => {
            setJobs(res.data)
        }).catch(err => {
            console.error("Jobs fetch failed", err)
            toast.error("Failed to load jobs")
        }).finally(() => setLoading(false))
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employer_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleApply = (jobId: number) => {
        api.post('/careers/applications/', { job: jobId }).then(() => {
            toast.success("Application submitted successfully!")
        }).catch(err => {
            console.error(err)
            toast.error(err.response?.data?.detail || "You have already applied to this job.")
        })
    }

    if (loading) return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs, companies, keywords..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filter
                </Button>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No jobs found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <Badge variant="secondary" className="mb-2">
                                        {job.job_type.replace('_', ' ')}
                                    </Badge>
                                    <CardTitle className="text-xl">{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Building className="h-4 w-4" /> {job.employer_name}
                                    </CardDescription>
                                </div>
                                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {job.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> {job.salary_range || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Posted {new Date(job.posted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between">
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                    View Details
                                </Button>
                                <Button size="sm" onClick={() => handleApply(job.id)}>
                                    Apply Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
