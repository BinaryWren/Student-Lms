"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Award, Lock, CheckCircle2, Trophy, Footprints, BookOpen, Brain, Medal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const ICON_MAP: Record<string, any> = {
    'footprints': Footprints,
    'book-open': BookOpen,
    'brain': Brain,
    'medal': Medal,
    'trophy': Trophy,
}

export function BadgesView() {
    const [badges, setBadges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/gamification/badges/').then(res => {
            setBadges(res.data)
        }).catch(err => {
            console.error("Badges fetch failed", err)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => {
                const Icon = ICON_MAP[badge.icon] || Award
                return (
                    <Card key={badge.id} className={`group relative transition-all hover:shadow-md ${badge.earned ? 'border-indigo-200 bg-indigo-50/20' : 'opacity-75 grayscale'}`}>
                        <CardHeader className="text-center pb-2">
                            <div className={`mx-auto mb-4 rounded-full p-4 w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-110 ${badge.earned ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-muted text-muted-foreground'
                                } shadow-lg`}>
                                <Icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-lg">{badge.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {badge.description}
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                {badge.earned ? (
                                    <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Earned
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="gap-1">
                                        <Lock className="h-3 w-3" /> Locked
                                    </Badge>
                                )}
                                <Badge variant="secondary">+{badge.xp_bonus} XP</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
