"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Trophy, Star, Medal, Award, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function GamificationWidget() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/gamification/').then(res => {
            setProfile(res.data)
        }).catch(err => {
            console.error(err)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <Skeleton className="h-[200px] w-full" />
    if (!profile) return null

    // Calculate progress to next level
    // Level = floor(XP / 1000) + 1. Next level at level * 1000
    const nextLevelXp = profile.level * 1000
    const currentLevelBaseXp = (profile.level - 1) * 1000
    const progress = ((profile.total_xp - currentLevelBaseXp) / 1000) * 100

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-none shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Level {profile.level}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{profile.total_xp} XP</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Rank: Cadet</span>
                            <span>Next: {nextLevelXp - profile.total_xp} XP needed</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-indigo-100 dark:bg-indigo-950" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-600" />
                    </div>

                    {profile.recent_activity.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Activity</p>
                            <div className="space-y-2">
                                {profile.recent_activity.slice(0, 3).map((act: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="truncate max-w-[180px]">{act.source}</span>
                                        <span className="font-bold text-green-600">+{act.amount} XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
