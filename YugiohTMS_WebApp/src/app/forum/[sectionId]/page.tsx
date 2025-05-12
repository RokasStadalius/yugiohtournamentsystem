"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageCircle, ArrowLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Sidebar } from "@/app/components/sidebar";

interface Post {
  iD_ForumPost: number;
  title: string;
  content: string;
  date: string;
  author: string;
}

const ForumSectionPostsPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const router = useRouter();

  const fetchPosts = useCallback(async (sectionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${sectionId}`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch posts: ${response.status}`);
      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sectionId) fetchPosts(sectionId);
  }, [fetchPosts, sectionId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forum/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            ID_User: userId,
            ID_ForumSection: sectionId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      await fetchPosts(sectionId as string);
      setCreateModalOpen(false);
      toast.success("Post created!");
    } catch (err: any) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => router.push("/forum");

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-24 h-24 text-red-500 mb-6" />
          <h2 className="text-2xl font-semibold text-zinc-400">
            Error Loading Posts
          </h2>
          <p className="text-zinc-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <div className="flex-1 p-8 lg:p-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 gap-4">
            <Button
              onClick={handleBack}
              className="rounded-full bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 px-6 py-2 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-blue-500 mr-3" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Forum Discussions
                </h1>
              </div>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Post
              </Button>
            </div>
          </div>

          {/* Create Post Modal */}
          <AnimatePresence>
            {isCreateModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="bg-zinc-900 border-2 border-zinc-800 rounded-xl p-6 w-full max-w-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Create New Post
                    </h2>
                    <button
                      onClick={() => setCreateModalOpen(false)}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePost}>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-zinc-300 mb-2 block">
                          Title
                        </Label>
                        <Input
                          required
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="bg-zinc-800 border-zinc-700 text-white focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300 mb-2 block">
                          Content
                        </Label>
                        <Textarea
                          required
                          value={formData.content}
                          onChange={(e: { target: { value: any } }) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          className="bg-zinc-800 border-zinc-700 text-white h-48 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-4 mt-6">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setCreateModalOpen(false)}
                          className="bg-zinc-800 hover:bg-zinc-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isCreating}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isCreating ? "Creating..." : "Create Post"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rest of the content remains same as before */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-32 bg-zinc-900 rounded-xl border-2 border-zinc-800"
                />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.iD_ForumPost}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card
                      className="group bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500/50 transition-all duration-300 rounded-xl shadow-2xl cursor-pointer transform hover:scale-[1.02] relative overflow-hidden"
                      onClick={() => router.push(`/forum/post/${post.iD_ForumPost}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="pr-4">
                            <h2 className="text-xl font-bold text-white truncate mb-2">
                              {post.title}
                            </h2>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                                {post.author}
                              </span>
                              <span className="text-zinc-500 text-sm">
                                {new Date(post.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-zinc-400 line-clamp-3">
                          {post.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <MessageCircle className="w-24 h-24 text-zinc-700 mb-6" />
              <h2 className="text-2xl font-semibold text-zinc-400">
                No discussions found
              </h2>
              <p className="text-zinc-600 mt-2">Start the conversation!</p>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-blue-500/20 to-transparent blur-3xl -z-10" />
      </div>
    </div>
  );
};

export default ForumSectionPostsPage;
