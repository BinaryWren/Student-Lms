import { LeaderboardView } from "@/components/gamification/leaderboard-view"
import { Trophy } from "lucide-react"

export default function StudentLeaderboardPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Leaderboard
                    </h2>
                    <p className="text-muted-foreground">
                        See how you rank against your batch mates and push your limits.
                    </p>
                </div>
            </div>

            <LeaderboardView />
        </div>
    )
}
