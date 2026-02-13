"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Trophy, Medal, Award, TrendingUp, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardView() {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        api.get('/gamification/leaderboard/').then(res => {
            setLeaderboard(res.data)
        }).catch(err => {
            console.error("Leaderboard fetch failed", err)
        }).finally(() => setLoading(false))
    }, [])

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((entry, idx) => (
                    <Card key={entry.user_id} className={`relative overflow-hidden border-2 ${idx === 0 ? 'border-yellow-500 bg-yellow-50/10' :
                            idx === 1 ? 'border-gray-400 bg-gray-50/10' :
                                'border-amber-600 bg-amber-50/10'
                        }`}>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 relative">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                                    <AvatarImage src={`/avatars/${entry.user_id}.png`} />
                                    <AvatarFallback className="text-xl">{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute -top-2 -right-2 rounded-full p-2 ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                                    } text-white shadow-md`}>
                                    {idx === 0 ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
                                </div>
                            </div>
                            <CardTitle className="text-xl truncate">{entry.name}</CardTitle>
                            <CardDescription>Level {entry.level}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold text-foreground mb-1">{entry.total_xp.toLocaleString()} XP</div>
                            <div className="flex items-center justify-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <Award className="h-3 w-3" /> {entry.badges_count} Badges
                                </Badge>
                                <div className="text-xs font-bold uppercase tracking-wider opacity-50">
                                    # {idx + 1}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Full List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Batch Rankings</CardTitle>
                            <CardDescription>Top performers in your current batch</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead className="text-right">Badges</TableHead>
                                <TableHead className="text-right">Total XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeaderboard.map((entry) => (
                                <TableRow key={entry.user_id} className={entry.rank <= 3 ? "bg-muted/30" : ""}>
                                    <TableCell className="font-bold">
                                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-[10px]">{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{entry.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Lvl {entry.level}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="flex items-center justify-end gap-1 text-muted-foreground">
                                            <Award className="h-3 w-3" /> {entry.badges_count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        {entry.total_xp.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
