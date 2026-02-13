"use client"

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LayoutDashboard, GraduationCap, ShieldCheck, PenTool, Activity, Rocket, Globe, Zap, Users } from "lucide-react";
import api from "@/lib/api";

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

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050505] text-white overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">Antigravity <span className="text-primary italic">LMS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">Success Stories</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="text-white hover:text-primary"
                onClick={() => {
                  if (user.role === 'STUDENT' || user.role === 'ALUMNI') router.push('/student/dashboard');
                  else if (user.role === 'INSTRUCTOR') router.push('/instructor/dashboard');
                  else if (user.institute) router.push(`/institutes/${user.institute}/dashboard`);
                  else router.push('/login'); // Fallback
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  localStorage.removeItem('user_data');
                  window.location.reload();
                }}
                variant="outline"
                className="rounded-full border-white/20 hover:bg-white/10 hover:text-white"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-primary">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20">Register Now</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl px-6 pt-20 pb-32 text-center"
      >
        <motion.div variants={item} className="mb-6 justify-center flex">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Zap className="size-3 mr-2 fill-primary" /> The Next Generation of LMS is Here
          </Badge>
        </motion.div>

        <motion.h1 variants={item} className="text-6xl md:text-9xl font-black tracking-tight leading-[0.9] mb-8">
          Revolutionize <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500 animate-gradient">Learning Experience.</span>
        </motion.h1>

        <motion.p variants={item} className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed">
          Empower your students with a sleek, high-perfomance platform. Built for scale, designed for excellence, and loved by educators worldwide.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/register">
            <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 transform hover:scale-105 active:scale-95 transition-all">
              Start Building for Free <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          <div className="flex -space-x-3 items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-muted flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
              </div>
            ))}
            <div className="pl-6 text-sm font-medium text-muted-foreground">
              Joined by <span className="text-white">2,000+</span> Students
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 w-full max-w-7xl px-6 py-24 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LayoutDashboard className="h-7 w-7" />}
            title="Unified Admin Panel"
            description="Manage multiple institutes, track billing, and monitor system health from one powerful dashboard."
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <FeatureCard
            icon={<PenTool className="h-7 w-7" />}
            title="Visual Curriculum Builder"
            description="Drag-and-drop course creator that makes building complex learning paths as easy as sketching."
            gradient="from-orange-500/20 to-red-500/20"
          />
          <FeatureCard
            icon={<Activity className="h-7 w-7" />}
            title="Real-time Engagement"
            description="Live classes, instant feedback, and interactive quizzes designed to keep students motivated."
            gradient="from-green-500/20 to-emerald-500/20"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 w-full max-w-7xl px-6 py-24 flex flex-wrap justify-center gap-16 md:gap-32">
        <StatItem label="Active Institutes" value="120+" />
        <StatItem label="Courses Published" value="15k+" />
        <StatItem label="Student Satisfaction" value="99.8%" />
        <StatItem label="Uptime Guarantee" value="99.9%" />
      </section>

      {/* Cta Section */}
      <section className="relative z-10 w-full max-w-5xl mx-autp px-6 py-32 text-center">
        <div className="rounded-[40px] bg-gradient-to-b from-primary/20 to-transparent p-12 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Rocket size={120} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Scale Your Education?</h2>
          <p className="text-xl text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
            Join the elite circle of modern educators using Antigravity LMS for their digital transformation.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-14 px-8 rounded-xl font-bold hover:bg-white hover:text-black transition-colors">
              Create Your Institute Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 relative z-10 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Antigravity Systems. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
          <Link href="#" className="hover:text-white">Contact</Link>
        </div>
      </footer>
    </div >
  );
}

function FeatureCard({ icon, title, description, gradient }: any) {
  return (
    <div className="group p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StatItem({ value, label }: any) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-widest font-bold font-mono">{label}</div>
    </div>
  )
}
