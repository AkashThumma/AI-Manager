"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [aiTone, setAiTone] = useState("Professional");
  const [targetPlatforms, setTargetPlatforms] = useState({
    linkedin: true,
    twitter: true,
  });
  const [customHashtags, setCustomHashtags] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/settings`);
      const { aiTone, targetPlatforms, customHashtags } = res.data;
      
      setAiTone(aiTone || "Professional");
      setCustomHashtags(customHashtags || "");
      
      const platformsStr = (targetPlatforms || "").toLowerCase();
      setTargetPlatforms({
        linkedin: platformsStr.includes("linkedin"),
        twitter: platformsStr.includes("twitter")
      });
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const platformsArr = [];
      if (targetPlatforms.linkedin) platformsArr.push("LinkedIn");
      if (targetPlatforms.twitter) platformsArr.push("Twitter");

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/settings`, {
        aiTone,
        targetPlatforms: platformsArr.join(", "),
        customHashtags
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Settings2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings & Preferences</h1>
          <p className="text-secondary">Customize how the AI generates your social media posts.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="clay-card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">AI Tone of Voice</h2>
          <p className="text-secondary text-sm">How should the AI sound when writing your posts?</p>
          <select 
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Professional">Professional (LinkedIn style)</option>
            <option value="Casual">Casual (Friendly and conversational)</option>
            <option value="Hype">Hype (Excited, lots of emojis 🚀🔥)</option>
            <option value="Technical">Technical (Focus on the code and architecture)</option>
          </select>
        </div>

        <div className="clay-card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Target Platforms</h2>
          <p className="text-secondary text-sm">Which platforms should we generate posts for?</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={targetPlatforms.linkedin}
                onChange={(e) => setTargetPlatforms({...targetPlatforms, linkedin: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-foreground font-medium">LinkedIn</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={targetPlatforms.twitter}
                onChange={(e) => setTargetPlatforms({...targetPlatforms, twitter: e.target.checked})}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-foreground font-medium">Twitter (X)</span>
            </label>
          </div>
        </div>

        <div className="clay-card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Custom Hashtags</h2>
          <p className="text-secondary text-sm">Hashtags to always include at the end of every post.</p>
          <input 
            type="text"
            value={customHashtags}
            onChange={(e) => setCustomHashtags(e.target.value)}
            placeholder="e.g. #BuildInPublic #Java #IndieDev"
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="clay-btn bg-primary text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save size={20} />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </motion.div>
  );
}
