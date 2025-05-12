"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, List, Hash, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sidebar } from "../components/sidebar";

// --- Interfaces ---
interface ForumSection {
  iD_ForumSection: number;
  name: string;
}

const ForumPage: React.FC = () => {
  const [sections, setSections] = useState<ForumSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const router = useRouter();

  // --- Fetching Data ---
  const fetchForumSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forum/sections`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch forum sections: ${response.status}`);
      }
      const data: ForumSection[] = await response.json();
      setSections(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching forum sections."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchForumSections();
  }, [fetchForumSections]);

  // --- Handlers ---
  const handleSectionSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    router.push(`/forum/${sectionId}`); // Use navigate here
  };
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <Sidebar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-400" />
          Forum
        </h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sections.map((section) => (
                <motion.div
                  key={section.iD_ForumSection}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "bg-zinc-900 border-zinc-800 cursor-pointer",
                      "transition-all duration-300",
                      "hover:shadow-lg hover:shadow-black/20",
                      selectedSectionId === section.iD_ForumSection &&
                        "border-2 border-blue-500" // Highlight selected
                    )}
                    onClick={() => handleSectionSelect(section.iD_ForumSection)} // Call handleSectionSelect
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        <Hash className="w-5 h-5 text-gray-400" />
                        {section.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">
                        Click to view posts in {section.name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
