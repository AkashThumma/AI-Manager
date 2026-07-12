"use client";

import { motion } from "framer-motion";
import { Code, Sparkles, Terminal, Code2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-background">
      <main className="max-w-5xl w-full flex flex-col items-center text-center gap-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full clay-card text-sm font-bold text-accent">
            <Sparkles size={18} />
            <span>AI-Powered Developer Portfolio Automation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Code. Build. Learn. <br />
            <span className="text-primary">
              AutoDev AI documents the rest.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary max-w-3xl leading-relaxed">
            Stop worrying about what to post. We continuously observe your code activity and automatically generate professional posts, progress summaries, and portfolio updates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 w-full justify-center"
        >
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/oauth2/authorization/github`}
            className="flex items-center justify-center gap-3 clay-btn bg-primary text-white px-10 py-5 font-black text-xl hover:bg-blue-600 transition-colors"
          >
            <Code size={26} />
            Connect & Start
          </a>
          <Link
            href="#features"
            className="flex items-center justify-center gap-3 clay-btn px-10 py-5 font-bold text-xl text-secondary hover:text-primary transition-colors"
          >
            View Features
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12"
        >
          <FeatureCard 
            icon={<Terminal size={32} className="text-primary" />}
            title="Activity Detection"
            description="We monitor your commits, PRs, and issues to understand exactly what you built today."
          />
          <FeatureCard 
            icon={<Sparkles size={32} className="text-accent" />}
            title="AI Post Generator"
            description="Automatically draft LinkedIn posts, Tweets, and Dev.to blogs based on your code changes."
          />
          <FeatureCard 
            icon={<Code2 size={32} className="text-pink-500" />}
            title="Daily Developer Diary"
            description="Get a beautiful summary of your daily coding progress, streak, and languages used."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="clay-card p-10 flex flex-col items-start gap-6 hover:-translate-y-2 transition-transform duration-300">
      <div className="p-5 bg-surface-hover rounded-2xl shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground">{title}</h3>
      <p className="text-secondary text-left leading-relaxed text-lg font-medium">
        {description}
      </p>
    </div>
  );
}
