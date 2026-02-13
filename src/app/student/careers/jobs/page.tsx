import { JobBoard } from "@/components/careers/job-board"
import { Briefcase } from "lucide-react"

export default function StudentJobsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Briefcase className="h-8 w-8 text-primary" />
                        Job Board
                    </h2>
                    <p className="text-muted-foreground">
                        Discover job and internship opportunities from verified employers.
                    </p>
                </div>
            </div>

            <JobBoard />
        </div>
    )
}
