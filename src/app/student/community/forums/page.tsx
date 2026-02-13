"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageSquare, ThumbsUp, MessageCircle, Search, Plus, Send, Zap } from "lucide-react"
import { toast } from "sonner"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

const initialDiscussions = [
    {
        id: 1,
        title: "How to master React Hooks?",
        author: "Alex S.",
        replies: 12,
        likes: 45,
        category: "React",
        time: "2h ago"
    },
    {
        id: 2,
        title: "Best resources for learning Python for Data Science",
        author: "Sarah J.",
        replies: 8,
        likes: 32,
        category: "Python",
        time: "5h ago"
    },
    {
        id: 3,
        title: "Understanding SQL Joins - Need help!",
        author: "Mike R.",
        replies: 5,
        likes: 12,
        category: "Databases",
        time: "1d ago"
    }
]

export default function ForumPage() {
    const [discussions, setDiscussions] = useState(initialDiscussions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("General");
    const [newContent, setNewContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const handleStartDiscussion = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTitle || !newContent) {
            toast.error("Please fill in all fields");
            return;
        }

        const newDiscussion = {
            id: Date.now(),
            title: newTitle,
            author: "You",
            replies: 0,
            likes: 0,
            category: newCategory,
            time: "Just now"
        };

        setDiscussions([newDiscussion, ...discussions]);
        setIsDialogOpen(false);
        setNewTitle("");
        setNewContent("");

        toast.success("Discussion started!", {
            description: "Your post is now live in the community."
        });
    };

    const categories = ["All", "React", "Python", "Databases", "General"];

    const filteredDiscussions = discussions.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || d.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-8 max-w-5xl mx-auto space-y-8"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gradient">Community Forums</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Zap className="size-4 text-yellow-500 fill-current" />
                        Discuss, share, and learn with your fellow scholars.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full h-12 px-6 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="mr-2 h-5 w-5" /> Start Discussion
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px] glass-card border-none">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">New Discussion</DialogTitle>
                            <DialogDescription>
                                Start a conversation with the community.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleStartDiscussion} className="space-y-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="font-bold">Topic Title</Label>
                                <Input
                                    id="title"
                                    placeholder="What's on your mind?"
                                    className="h-11 rounded-xl"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="font-bold">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g. React, Career, etc."
                                    className="h-11 rounded-xl"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content" className="font-bold">Message</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Tell us more about your topic..."
                                    className="min-h-[120px] rounded-xl resize-none"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20">
                                    <Send className="mr-2 size-4" /> Post to Community
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search global discussions..."
                            className="pl-10 h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={activeFilter === cat ? "default" : "outline"}
                            onClick={() => setActiveFilter(cat)}
                            className={`rounded-full h-9 px-4 text-xs font-bold uppercase transition-all ${activeFilter === cat ? "shadow-lg shadow-primary/20 scale-105" : "bg-muted/10 border-none hover:bg-muted/30"}`}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </motion.div>

            <motion.div
                variants={container}
                className="grid gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredDiscussions.length > 0 ? filteredDiscussions.map((d) => (
                        <motion.div
                            key={d.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="flex flex-row items-center gap-6 space-y-0 p-6">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <MessageSquare className="size-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{d.title}</CardTitle>
                                            <Badge variant="secondary" className="w-fit bg-primary/5 text-primary border-primary/10 uppercase tracking-widest text-[10px] font-black">{d.category}</Badge>
                                        </div>
                                        <CardDescription className="mt-2 text-sm font-medium">
                                            Posted by <span className="text-foreground">{d.author}</span> • <span className="opacity-60">{d.time}</span>
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-0 ml-[72px]">
                                    <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                                        <div className="flex items-center gap-2 group/stat hover:text-primary transition-colors">
                                            <ThumbsUp className="size-4" />
                                            {d.likes}
                                        </div>
                                        <div className="flex items-center gap-2 group/stat hover:text-primary transition-colors">
                                            <MessageCircle className="size-4" />
                                            {d.replies}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted/30"
                        >
                            <Search className="size-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-xl font-bold">No discussions found</h3>
                            <p className="text-muted-foreground">Try searching for something else or start a new one!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
