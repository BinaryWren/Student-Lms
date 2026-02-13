"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, ExternalLink, MonitorPlay, Video } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { id: courseId, lessonId } = params;

    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        async function fetchLesson() {
            try {
                if (!lessonId) return;
                const res = await api.get(`/lessons/${lessonId}/`);
                setLesson(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchLesson();
    }, [lessonId]);

    // Video Progress Tracking
    useEffect(() => {
        if (!lesson || !lesson.duration_minutes) return;

        let secondsWatched = 0;
        const interval = setInterval(() => {
            secondsWatched += 5; // Check every 5 seconds
            const totalSeconds = lesson.duration_minutes * 60;
            if (totalSeconds > 0) {
                const percentage = (secondsWatched / totalSeconds) * 100;

                // Send progress to backend analyzer
                if (percentage <= 100) {
                    // Only verify occasionally to save bandwidth, or when crossing thresholds
                    if (secondsWatched % 30 === 0 || percentage >= 90) {
                        api.post(`/lessons/${lessonId}/analyze_progress/`, { percentage: percentage })
                            .then(res => {
                                if (res.data.status === 'completed' && !lesson.is_completed) {
                                    setLesson((prev: any) => ({ ...prev, is_completed: true }));
                                    toast.success("Lesson completed!");
                                }
                            })
                            .catch(err => console.error("Progress sync failed", err));
                    }
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [lesson, lessonId]);

    const markComplete = async () => {
        setCompleting(true);
        try {
            await api.post(`/lessons/${lessonId}/complete/`);
            setLesson({ ...lesson, is_completed: true });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setCompleting(false);
        }
    }

    if (loading) return <div className="p-8">Loading lesson...</div>
    if (!lesson) return <div className="p-8">Lesson not found</div>

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{lesson.content_type}</Badge>
                    {lesson.is_completed && <Badge variant="secondary" className="text-green-600 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>}
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Auto-play first video found in resources if main content is empty */}
                {(() => {
                    const getEmbedUrl = (url: string) => {
                        if (!url) return '';
                        if (url.includes('youtube.com/watch?v=')) {
                            return url.replace('watch?v=', 'embed/');
                        } else if (url.includes('youtu.be/')) {
                            return url.replace('youtu.be/', 'youtube.com/embed/');
                        }
                        return url;
                    };
                    const firstVideo = lesson.resources?.find((r: any) => r.resource_type === 'LINK' && r.url);
                    const rawUrl = lesson.content_url || firstVideo?.url;
                    const videoUrl = getEmbedUrl(rawUrl);

                    if (videoUrl) {
                        return (
                            <div className="space-y-4">
                                {firstVideo && !lesson.content_url && <p className="text-sm font-bold text-muted-foreground flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Playing Video: {firstVideo.title}</p>}
                                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-muted">
                                    <iframe
                                        src={videoUrl}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Markdown Content */}
                {lesson.content_body && (
                    <div className="prose dark:prose-invert max-w-none bg-muted/10 p-6 rounded-xl border">
                        <ReactMarkdown>{lesson.content_body}</ReactMarkdown>
                    </div>
                )}
            </div>

            <Separator />

            {/* Resources Section (Materials) */}
            {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-4 bg-muted/5 p-6 rounded-2xl border border-dashed">
                    <h3 className="text-xl font-black tracking-tight">Sub-section Materials</h3>
                    <div className="grid gap-3 md:grid-cols-1">
                        {lesson.resources.map((res: any) => (
                            <a
                                key={res.id}
                                href={res.url || (res.file_attachment ? `http://localhost:8000/media/${res.file_attachment.split('/media/').pop()}` : '#')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-lg mr-4 ${res.resource_type === 'LINK' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {res.resource_type === 'LINK' ? <Video className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{res.title}</p>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{res.resource_type === 'LINK' ? 'Video Lecture' : 'Downloadable Document'}</p>
                                    </div>
                                </div>
                                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-8">
                {lesson.is_completed ? (
                    <Button variant="outline" disabled className="gap-2">
                        <CheckCircle className="w-4 h-4" /> Completed
                    </Button>
                ) : (
                    <Button onClick={markComplete} disabled={completing} size="lg">
                        {completing ? 'Marking...' : 'Mark as Complete'}
                    </Button>
                )}
            </div>
        </div>
    )
}
