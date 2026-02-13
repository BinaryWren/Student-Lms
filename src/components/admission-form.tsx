"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GraduationCap, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Upload, User, Users, Briefcase, MapPin } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface AdmissionFormProps {
    onSuccess?: () => void;
    isAdminMode?: boolean;
    defaultInstituteId?: string;
}

export function AdmissionForm({ onSuccess, isAdminMode = false, defaultInstituteId }: AdmissionFormProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [institutes, setInstitutes] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [batches, setBatches] = useState<any[]>([])

    const [formData, setFormData] = useState<any>({
        institute: "",
        course: "",
        batch: "",
        category: "Student",
        gender: "Male",
        course_mode: "OFFLINE", // Default to Offline
        date_of_birth: "",
        first_name: "",
        last_name: "",
        mobile_number: "",
        email: "",
        linkedin_profile: "",
        experience: "",
        current_employer_university: "",
        guardian_type: "Father",

        father_name: "",
        father_phone: "",
        father_occupation: "",

        mother_name: "",
        mother_phone: "",
        mother_occupation: "",

        guardian_name: "",
        guardian_relation: "",
        guardian_phone: "",
        guardian_occupation: "",
        guardian_email: "",
        guardian_address: "",
    })

    const [files, setFiles] = useState<{ photo: File | null; resume: File | null }>({
        photo: null,
        resume: null
    })

    useEffect(() => {
        api.get('/institutes/').then(res => {
            const insts = Array.isArray(res.data) ? res.data : (res.data.results || [])
            setInstitutes(insts)

            if (defaultInstituteId) {
                handleInputChange('institute', defaultInstituteId)
            } else if (insts.length > 0 && !formData.institute) {
                handleInputChange('institute', insts[0].id.toString())
            }
        }).catch(err => console.error("Failed to fetch institutes", err))
    }, [defaultInstituteId])

    useEffect(() => {
        if (formData.institute) {
            api.get(`/courses/`).then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
                setCourses(data)
            })
            api.get(`/batches/`).then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
                setBatches(data)
            })
        }
    }, [formData.institute])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (field: 'photo' | 'resume', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }))
        }
    }

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // If not on final step, just move to next step (prevents early Enter submission)
        if (step < 3) {
            nextStep()
            return
        }

        setLoading(true)

        try {
            const data = new FormData()
            Object.keys(formData).forEach(key => {
                if (formData[key] !== "" && formData[key] !== null) {
                    data.append(key, formData[key])
                }
            })
            if (isAdminMode) {
                data.set('status', 'APPROVED')
            }
            if (files.photo) data.append('photo', files.photo)
            if (files.resume) data.append('resume_cv', files.resume)

            await api.post('/admissions/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success("Admission Form Submitted Successfully!")
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error("Submission error details:", error.response?.data || error.message)
            const errorData = error.response?.data
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)

                messages.forEach(msg => toast.error(msg))
            } else {
                toast.error("Submission failed. Please check all required fields and try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const stepLabelClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"

    return (
        <div className={`space-y-6 ${isAdminMode ? 'text-foreground' : 'text-white'}`}>
            {/* Progress Bar */}
            <div className="flex items-center justify-between px-4 max-w-xs mx-auto relative overflow-hidden">
                <div className={`absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 ${isAdminMode ? 'bg-muted' : 'bg-white/10'}`} />
                <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                {[1, 2, 3].map(i => (
                    <div key={i} className={`${stepLabelClass} relative z-10 ${step >= i ? 'bg-primary border-primary text-white shadow-lg' : isAdminMode ? 'bg-background border-muted text-muted-foreground' : 'bg-black border-white/20 text-white/40'}`}>
                        {i}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" /> Admission Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Institute</Label>
                                    <Select
                                        value={formData.institute}
                                        onValueChange={v => handleInputChange('institute', v)}
                                        disabled={!!defaultInstituteId}
                                    >
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Select Institute" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutes.map(inst => <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Course Mode *</Label>
                                    <Select value={formData.course_mode} onValueChange={v => {
                                        handleInputChange('course_mode', v);
                                        handleInputChange('course', ''); // RESET course on mode change
                                    }}>
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONLINE">Online Course</SelectItem>
                                            <SelectItem value="OFFLINE">Offline (On-Campus)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Course *</Label>
                                    <Select value={formData.course} onValueChange={v => handleInputChange('course', v)}>
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Choose Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses
                                                .filter(c => formData.course_mode === 'ONLINE' ? c.is_online_course : !c.is_online_course)
                                                .map(course => <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Batch *</Label>
                                    <Select value={formData.batch} onValueChange={v => handleInputChange('batch', v)}>
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Select Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map(batch => <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select value={formData.category} onValueChange={v => handleInputChange('category', v)}>
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Faculty Member">Faculty Member</SelectItem>
                                            <SelectItem value="IT Professional">IT Professional</SelectItem>
                                            <SelectItem value="Security Professional">Information Security Professional</SelectItem>
                                            <SelectItem value="Student">Student</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender *</Label>
                                    <Select value={formData.gender} onValueChange={v => handleInputChange('gender', v)}>
                                        <SelectTrigger className={isAdminMode ? '' : 'bg-white/5 border-white/10'}>
                                            <SelectValue placeholder="Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Photo *</Label>
                                    <Input type="file" accept="image/*" onChange={e => handleFileChange('photo', e)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> CV/Resume *</Label>
                                    <Input type="file" accept=".pdf,.doc,.docx" onChange={e => handleFileChange('resume', e)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Personal & Professional
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>First Name *</Label><Input value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} required className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                <div className="space-y-2"><Label>Last Name</Label><Input value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                <div className="space-y-2"><Label>Phone *</Label><Input value={formData.mobile_number} onChange={e => handleInputChange('mobile_number', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                            </div>
                            <div className="space-y-2"><Label>LinkedIn Profile URL *</Label><Input value={formData.linkedin_profile} onChange={e => handleInputChange('linkedin_profile', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                            <div className="space-y-2"><Label>Experience *</Label><Textarea value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                            <div className="space-y-2"><Label>Employer / University *</Label><Input value={formData.current_employer_university} onChange={e => handleInputChange('current_employer_university', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" /> Guardian Details
                            </h3>
                            <div className="space-y-2">
                                <Label>Guardian Type</Label>
                                <RadioGroup value={formData.guardian_type} onValueChange={v => handleInputChange('guardian_type', v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Father" id="f" /><Label htmlFor="f">Father</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Mother" id="m" /><Label htmlFor="m">Mother</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Self" id="s" /><Label htmlFor="s">Self</Label></div>
                                </RadioGroup>
                            </div>
                            <AnimatePresence mode="wait">
                                {formData.guardian_type === 'Father' && (
                                    <motion.div key="father" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Father Name</Label><Input value={formData.father_name} onChange={e => handleInputChange('father_name', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                        <div className="space-y-2"><Label>Father Phone</Label><Input value={formData.father_phone} onChange={e => handleInputChange('father_phone', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                    </motion.div>
                                )}

                                {formData.guardian_type === 'Mother' && (
                                    <motion.div key="mother" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Mother Name</Label><Input value={formData.mother_name} onChange={e => handleInputChange('mother_name', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                        <div className="space-y-2"><Label>Mother Phone</Label><Input value={formData.mother_phone} onChange={e => handleInputChange('mother_phone', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                    </motion.div>
                                )}

                                {formData.guardian_type === 'Self' && (
                                    <motion.div key="self" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Emergency Contact Name</Label><Input value={formData.guardian_name} onChange={e => handleInputChange('guardian_name', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                        <div className="space-y-2"><Label>Emergency Phone</Label><Input value={formData.guardian_phone} onChange={e => handleInputChange('guardian_phone', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Guardian Email</Label><Input type="email" value={formData.guardian_email} onChange={e => handleInputChange('guardian_email', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                                <div className="space-y-2"><Label>Relation</Label><Input value={formData.guardian_relation} onChange={e => handleInputChange('guardian_relation', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                            </div>
                            <div className="space-y-2"><Label>Permanent Address *</Label><Textarea value={formData.guardian_address} onChange={e => handleInputChange('guardian_address', e.target.value)} className={isAdminMode ? '' : 'bg-white/5 border-white/10'} /></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button type="submit">Next Step <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    ) : (
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Admission"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
