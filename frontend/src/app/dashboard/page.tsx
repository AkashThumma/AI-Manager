"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Generated", value: stats.total, icon: <FileText size={28} className="text-primary" />, color: "bg-primary/10" },
    { title: "Pending Approval", value: stats.pending, icon: <Clock size={28} className="text-yellow-500" />, color: "bg-yellow-500/10" },
    { title: "Approved & Posted", value: stats.approved, icon: <CheckCircle size={28} className="text-green-500" />, color: "bg-green-500/10" },
    { title: "Rejected", value: stats.rejected, icon: <XCircle size={28} className="text-red-500" />, color: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Overview</h1>
        <p className="text-secondary text-lg">Your automated developer portfolio at a glance.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </div>
      ) : error ? (
        <div className="clay-card p-6 border-l-4 border-red-500 text-red-500">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat, i) => (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay-card p-8 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className={`p-4 rounded-3xl ${stat.color} mb-4 shadow-inner`}>
                {stat.icon}
              </div>
              <h3 className="text-5xl font-black text-foreground mb-2">{stat.value}</h3>
              <p className="text-secondary font-medium text-lg">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="clay-card p-10 mt-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to AutoDev AI</h2>
        <p className="text-secondary text-lg leading-relaxed max-w-3xl">
          We are monitoring your GitHub repository. Every time you push code, our AI will automatically draft engaging posts for your LinkedIn and Twitter. 
          Head over to the <strong>Approvals</strong> tab to review and publish your pending drafts!
        </p>
      </div>
    </div>
  );
}
