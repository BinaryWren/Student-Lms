import { BadgesView } from "@/components/gamification/badges-view"
import { Award } from "lucide-react"

export default function StudentBadgesPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Award className="h-8 w-8 text-indigo-500" />
                        Achievements
                    </h2>
                    <p className="text-muted-foreground">
                        Unlock badges by completing lessons and earning XP.
                    </p>
                </div>
            </div>

            <BadgesView />
        </div>
    )
}
