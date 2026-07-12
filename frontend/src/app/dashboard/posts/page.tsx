"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, MessageSquare, Briefcase, Code, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// TypeScript interface for our backend AIPost entity
interface AIPost {
  id: number;
  platform: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function PostHistoryPage() {
  const [posts, setPosts] = useState<AIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/dashboard/posts/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load post history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Generated Posts</h1>
        <p className="text-secondary text-lg">History of all your AI-generated content.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </div>
      ) : error ? (
        <div className="clay-card p-6 border-l-4 border-red-500 text-red-500">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 clay-card">
          <h2 className="text-2xl font-bold text-foreground mb-3">No history yet.</h2>
          <p className="text-secondary text-lg">Approve or reject some posts from the Approvals tab to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map(post => (
            <HistoryCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("linkedin")) return <Briefcase size={22} className="text-blue-500" />;
  if (p.includes("github")) return <Code size={22} className="text-primary" />;
  if (p.includes("twitter") || p.includes("x")) return <span className="font-bold text-foreground text-xl leading-none">𝕏</span>;
  return <MessageSquare size={22} className="text-purple-500" />;
}

function HistoryCard({ post }: { post: AIPost }) {
  const date = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";
  const isApproved = post.status === "APPROVED";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay-card p-6 flex flex-col md:flex-row gap-6"
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-surface shadow-inner">
            {getPlatformIcon(post.platform)}
          </div>
          <div>
            <span className="font-bold text-lg text-foreground block">{post.platform} Post</span>
            <span className="text-sm font-medium text-secondary">{date}</span>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className="clay-btn p-2 text-secondary hover:text-primary transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
            <div className={`px-4 py-2 rounded-full shadow-inner font-bold flex items-center gap-2 ${
              isApproved ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {isApproved ? <CheckCircle size={18} /> : <XCircle size={18} />}
              {post.status}
            </div>
          </div>
        </div>
        
        <div className="clay-input font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </motion.div>
  );
}
