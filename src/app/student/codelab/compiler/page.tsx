"use client"

import { useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, RotateCcw, Monitor } from "lucide-react"

export default function OnlineCompiler() {
    const [language, setLanguage] = useState("python")
    const [code, setCode] = useState(`# Write your Python code here
print("Hello from CodeLab!")
`)
    const [output, setOutput] = useState("")
    const [stdin, setStdin] = useState("")
    const [isRunning, setIsRunning] = useState(false)

    // Initial templates for languages
    const templates: any = {
        python: `print("Hello from Python!")\n# Write your code here`,
        javascript: `console.log("Hello from JavaScript!");\n// Write your code here`,
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}`,
        html: `<h1>Hello HTML</h1>\n<p>This will be rendered below.</p>`
    }

    const handleLanguageChange = (val: string) => {
        setLanguage(val)
        setCode(templates[val] || "")
        setOutput("")
        setStdin("")
    }

    const runCode = async () => {
        setIsRunning(true)
        setOutput("Running...")

        if (language === 'html') {
            setOutput("Rendering HTML Preview...")
            setIsRunning(false)
            return
        }

        try {
            const res = await api.post('/piston/execute/', {
                language,
                code,
                stdin
            })

            const runData = res.data.run
            if (runData) {
                setOutput(runData.output || "No output returned.")
            } else if (res.data.error) {
                setOutput(`Backend Error: ${res.data.error}`)
            } else {
                setOutput(JSON.stringify(res.data, null, 2))
            }

        } catch (e: any) {
            console.error(e)
            setOutput(`Runtime Error: ${e.response?.data?.error || e.message || "Connection failed to backend executor"}`)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="flex flex-col h-screen w-full bg-[#1e1e1e] text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#252526]">
                <div className="flex items-center gap-3">
                    <Monitor className="text-emerald-500" />
                    <h1 className="font-bold text-lg">Online Compiler</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[150px] bg-[#3e3e42] border-0 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={runCode} disabled={isRunning} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        <Play className="w-4 h-4 mr-2" /> Run
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 flex flex-col border-r border-white/10">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Output & Input Panel */}
                <div className={`flex-1 flex flex-col bg-[#1e1e1e] ${language === 'html' ? 'bg-white text-black' : ''}`}>
                    {language === 'html' ? (
                        <>
                            <div className="p-2 bg-[#252526] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">Preview</div>
                            <iframe srcDoc={code} className="flex-1 w-full h-full border-none" sandbox="allow-scripts" />
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Output Section */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-2 bg-[#252526] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">Output</div>
                                <pre className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">{output}</pre>
                            </div>

                            {/* Input Section */}
                            <div className="h-1/3 flex flex-col border-t border-white/10">
                                <div className="p-2 bg-[#252526] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">Input (Stdin)</div>
                                <textarea
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                    placeholder="Enter program input here (e.g. for input() calls)..."
                                    className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm resize-none focus:outline-none text-gray-300"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
