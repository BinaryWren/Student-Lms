"use client"

import * as React from "react"
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"

interface Message {
    role: 'user' | 'model'
    content: string
}

export function ChatBot() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isChatAuth, setIsChatAuth] = React.useState(false) // "Google" Login State
    const [messages, setMessages] = React.useState<Message[]>([
        { role: 'model', content: 'Hi! I am your AI learning assistant. Ask me anything about your course!' }
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Scroll to bottom on new message
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen, isChatAuth])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setIsLoading(true)

        try {
            // Include context from URL?
            const context = window.location.pathname.includes('/courses/')
                ? `Current Page: ${window.location.pathname}`
                : "General Dashboard"

            const res = await api.post('/chatbot/ask/', {
                message: userMsg,
                history: newMessages.slice(0, -1), // Send previous history context
                context: context
            })

            const aiMsg = res.data.content
            if (aiMsg) {
                setMessages(prev => [...prev, { role: 'model', content: aiMsg }])
            }
        } catch (e: any) {
            console.error(e)
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white z-50 transition-all hover:scale-110"
            >
                <Sparkles className="h-6 w-6" />
            </Button>
        )
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[550px] shadow-2xl z-50 flex flex-col border-indigo-200">
            {/* Header */}
            <CardHeader className="bg-indigo-600 text-white p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0 shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle className="text-base">AI Assistant</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-indigo-700 h-8 w-8"
                >
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 relative flex flex-col">
                {!isChatAuth ? (
                    // Google Login Screen
                    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 bg-white animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-indigo-50 p-6 rounded-full shadow-sm">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                                alt="Google"
                                className="h-8 mb-2 mx-auto"
                            />
                            <p className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest">Workspace</p>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Sign in to AI Tutor</h3>
                            <p className="text-sm text-slate-500">Use your Google Account to access the learning assistant.</p>
                        </div>

                        <div className="w-full space-y-4">
                            <Button
                                variant="outline"
                                className="w-full relative py-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium text-slate-700 text-base shadow-sm"
                                onClick={() => {
                                    setIsLoading(true)
                                    // Simulate auth delay
                                    setTimeout(() => {
                                        setIsChatAuth(true)
                                        setIsLoading(false)
                                    }, 800)
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <div className="absolute left-4 bg-white rounded-full p-0.5">
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.144 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.464 63.239 -14.754 63.239 Z" />
                                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.464 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                            </g>
                                        </svg>
                                    </div>
                                )}
                                Continue with Google
                            </Button>

                            <p className="text-xs text-center text-slate-400">
                                {user?.email ? `Continuing as ${user.email}` : 'Secure Student Login'}
                            </p>
                        </div>
                    </div>
                ) : (
                    // Chat Interface
                    <ScrollArea className="h-full p-4">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 border">
                                        {msg.role === 'model' ? (
                                            <>
                                                <AvatarImage src="/bot-avatar.png" />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700">AI</AvatarFallback>
                                            </>
                                        ) : (
                                            <AvatarFallback className="bg-slate-200">ME</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div
                                        className={cn(
                                            "rounded-lg p-3 text-sm shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white text-slate-800 border"
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%] self-start">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white rounded-lg p-3 border shadow-sm flex items-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            {/* Input - Only show if auth */}
            {isChatAuth && (
                <CardFooter className="p-3 border-t bg-white shrink-0">
                    <form
                        className="flex w-full gap-2"
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    >
                        <Input
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            )}
        </Card>
    )
}
