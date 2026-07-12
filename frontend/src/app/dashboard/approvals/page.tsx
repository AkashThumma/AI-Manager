"use client";

import { motion } from "framer-motion";
import { Check, X, Edit3, MessageSquare, Briefcase, Code, Copy } from "lucide-react";
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

export default function ApprovalsPage() {
  const [posts, setPosts] = useState<AIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    
    // Auto-poll every 5 seconds
    const intervalId = setInterval(() => {
      fetchPosts(true);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchPosts = async (isBackground = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!isBackground) setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/dashboard/posts/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch pending posts:", err);
      if (!isBackground) setError("Failed to load pending posts. Is the backend running?");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleApprove = async (post: AIPost) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/api/dashboard/posts/${post.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Intent URL Logic
      const platform = post.platform.toLowerCase();
      if (platform.includes("twitter") || platform.includes("x")) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`;
        window.open(url, '_blank');
        toast.success("Post approved! Opening Twitter...");
      } else if (platform.includes("linkedin")) {
        navigator.clipboard.writeText(post.content);
        toast.success("Copied to clipboard! Opening LinkedIn...");
        setTimeout(() => window.open('https://www.linkedin.com/feed/', '_blank'), 1000);
      } else {
        toast.success("Post approved!");
      }

      // Remove the approved post from the list locally
      setPosts(posts.filter(p => p.id !== post.id));
    } catch (err) {
      console.error("Failed to approve post:", err);
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/api/dashboard/posts/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p.id !== id));
      toast.success("Post rejected and archived.");
    } catch (err) {
      console.error("Failed to reject post:", err);
      toast.error("Failed to reject post");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Pending Approvals</h1>
        <p className="text-secondary text-lg">Review AI-generated content before it gets published.</p>
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
          <div className="w-24 h-24 rounded-full bg-green-500/10 text-green-500 mx-auto flex items-center justify-center mb-6">
            <Check size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">You're all caught up!</h2>
          <p className="text-secondary text-lg">No pending AI posts to review right now. Keep coding!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.map(post => (
            <ApprovalCard 
              key={post.id}
              post={post}
              onApprove={() => handleApprove(post)}
              onReject={() => handleReject(post.id)}
              onCopy={() => handleCopy(post.content)}
            />
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

function ApprovalCard({ post, onApprove, onReject, onCopy }: { post: AIPost, onApprove: () => void, onReject: () => void, onCopy: () => void }) {
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="clay-card p-8 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-surface shadow-inner">
            {getPlatformIcon(post.platform)}
          </div>
          <span className="font-bold text-xl text-foreground">{post.platform} Draft</span>
        </div>
        <span className="text-sm font-medium text-secondary px-3 py-1 bg-surface-hover rounded-full shadow-inner">{date}</span>
      </div>
      
      <div className="clay-input flex-1 mb-8 font-mono text-sm leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap">
        {post.content}
      </div>

      <div className="flex items-center gap-4 mt-auto">
        <button onClick={onApprove} className="clay-btn flex-1 flex items-center justify-center gap-2 py-3 text-primary font-bold hover:bg-primary/10">
          <Check size={20} />
          Approve & Publish
        </button>
        <button onClick={onCopy} className="clay-btn px-4 py-3 text-secondary font-medium flex items-center justify-center gap-2" title="Copy to clipboard">
          <Copy size={20} />
        </button>
        <button onClick={onReject} className="clay-btn px-4 py-3 text-red-500 font-medium flex items-center justify-center gap-2" title="Reject">
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
}
