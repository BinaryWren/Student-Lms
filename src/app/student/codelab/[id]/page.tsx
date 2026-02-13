"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import Editor from "@monaco-editor/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Send, Loader2, CheckCircle, XCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Badge } from "@/components/ui/badge"

export default function ProblemSolverPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState<any>(null);
    const [languages, setLanguages] = useState<any[]>([]);
    const [selectedLang, setSelectedLang] = useState<string>("71"); // Default Python (judge0 id 71)
    const [code, setCode] = useState<string>("# Write your code here\nx = int(input())\ny = int(input())\nprint(x + y)");
    const [output, setOutput] = useState<any[]>([]); // Array of test case results
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        // Fetch Problem
        api.get(`/problems/${id}/`).then(res => setProblem(res.data));
        // Fetch Languages
        api.get(`/languages/`).then(res => {
            setLanguages(res.data);
            if (res.data.length > 0) setSelectedLang(res.data[0].id.toString());
        });
    }, [id]);

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab("console");
        try {
            // Mapping selected internal ID to judge0 id happens in backend or frontend?
            // In my View, I expect `language_id` (Judge0 ID). 
            // My Select stores the internal ID. I need to find the Judge0 ID.
            const langObj = languages.find(l => l.id.toString() === selectedLang);

            const res = await api.post(`/problems/${id}/run/`, {
                source_code: code,
                language_id: langObj?.judge0_id
            });
            setOutput(res.data.results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunning(false);
        }
    }

    const handleSubmit = async () => {
        setIsRunning(true);
        setActiveTab("console");
        try {
            const res = await api.post(`/problems/${id}/submit/`, {
                source_code: code,
                language_pk: selectedLang // Sending DB ID for submission record
            });
            // Show result
            // res.data is the Submission object
            const resultDisplay = [{
                status: res.data.status,
                score: res.data.score,
                is_submission: true
            }];
            // @ts-ignore
            setOutput(resultDisplay);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunning(false);
        }
    }

    if (!problem) return <div className="p-8">Loading...</div>

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-background z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold">{problem.title}</h1>
                    <Badge variant="outline">{problem.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedLang} onValueChange={setSelectedLang}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(l => (
                                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="sm" variant="secondary" onClick={handleRun} disabled={isRunning}>
                        <Play className="w-4 h-4 mr-2" /> Run
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isRunning}>
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
                    </Button>
                </div>
            </div>

            {/* Layout */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Panel: Problem Description */}
                <ResizablePanel defaultSize={40} minSize={20}>
                    <ScrollArea className="h-full p-6">
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{problem.description}</ReactMarkdown>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="font-semibold">Constraints</h3>
                            <ul className="text-sm text-muted-foreground list-disc pl-4">
                                <li>Time Limit: {problem.time_limit_seconds}s</li>
                                <li>Memory Limit: {problem.memory_limit_kb / 1000}MB</li>
                            </ul>
                        </div>
                    </ScrollArea>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: Editor & Console */}
                <ResizablePanel defaultSize={60}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Editor */}
                        <ResizablePanel defaultSize={70}>
                            <Editor
                                height="100%"
                                defaultLanguage="python" // Dynamic based on selection ideally
                                theme="vs-dark"
                                value={code}
                                onChange={(val) => setCode(val || "")}
                                options={{ minimap: { enabled: false }, fontSize: 14 }}
                            />
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* Console */}
                        <ResizablePanel defaultSize={30} minSize={10}>
                            <div className="h-full flex flex-col bg-muted/20">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                    <div className="border-b px-4 bg-background">
                                        <TabsList className="h-9">
                                            <TabsTrigger value="console" className="text-xs">Test Results</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent value="console" className="flex-1 p-0 m-0 overflow-auto">
                                        <div className="p-4 space-y-4">
                                            {output.length === 0 && <span className="text-muted-foreground text-sm">Run code to see results...</span>}

                                            {/* Submission Result */}
                                            {/* @ts-ignore */}
                                            {output.length === 1 && output[0].is_submission && (
                                                <div className={`p-4 rounded-md border ${output[0].status === 'ACCEPTED' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                                    <h3 className="font-bold flex items-center gap-2">
                                                        {output[0].status === 'ACCEPTED' ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                                                        {output[0].status}
                                                    </h3>
                                                    <p className="text-sm mt-1">Score: {output[0].score}/100</p>
                                                </div>
                                            )}

                                            {/* Run Test Cases Results */}
                                            {/* @ts-ignore */}
                                            {output.length > 0 && !output[0].is_submission && output.map((res, i) => (
                                                <div key={i} className="space-y-2 border-b last:border-0 pb-4">
                                                    <div className="flex items-center gap-2 font-medium text-sm">
                                                        <span>Case {i + 1}:</span>
                                                        <span className={res.passed ? "text-green-500" : "text-red-500"}>{res.status}</span>
                                                    </div>
                                                    {!res.passed && (
                                                        <div className="text-xs bg-muted p-2 rounded font-mono">
                                                            <div>Input: {res.input}</div>
                                                            <div>Expected: {res.expected}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
