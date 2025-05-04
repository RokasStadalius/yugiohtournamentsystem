"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/app/components/sidebar";

interface Post {
  iD_ForumPost: number;
  title: string;
  content: string;
  timestamp: string;
  user: {
    username: string;
  };
  comments: Comment[];
}

interface Comment {
  iD_ForumPostComment: number;
  content: string;
  timestamp: string;
  user: {
    username: string;
  };
}

const ForumPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forum/post/${postId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load post");
      }

      const postData = await response.json();
      setPost(postData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forum/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Content: newComment,
            ID_User: userId,
            ID_ForumPost: postId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post comment");
      }

      setNewComment("");
      await fetchPostData();
      toast.success("Comment posted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/forum");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-24 h-24 text-red-500 mb-6" />
          <h2 className="text-2xl font-semibold text-zinc-400">
            Error Loading Post
          </h2>
          <p className="text-zinc-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "white",
            border: "1px solid #3f3f3f",
          },
        }}
      />

      <div className="flex-1 p-8 lg:p-12 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={handleBack}
              className="rounded-full bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 px-6 py-2 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discussions
            </Button>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 bg-zinc-900 rounded-xl border-2 border-zinc-800" />
              <Skeleton className="h-24 bg-zinc-900 rounded-xl border-2 border-zinc-800" />
            </div>
          ) : (
            post && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-zinc-900 border-2 border-zinc-800 rounded-xl shadow-2xl mb-8">
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-4">
                          {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-zinc-400">
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                            {post.user.username}
                          </span>
                          <span className="text-sm">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-300 whitespace-pre-line">
                        {post.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    Comments ({post.comments.length})
                  </h2>

                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment..."
                      className="bg-zinc-900 border-2 border-zinc-800 text-white h-32 focus:border-blue-500/50 resize-none"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-3"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </form>

                  <AnimatePresence>
                    {post.comments.map((comment) => (
                      <motion.div
                        key={comment.iD_ForumPostComment}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="bg-zinc-900 border-2 border-zinc-800 rounded-xl mb-4">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-blue-400 text-sm font-medium">
                                    {comment.user.username}
                                  </span>
                                  <span className="text-zinc-500 text-sm">
                                    {new Date(
                                      comment.timestamp
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-zinc-300 whitespace-pre-line">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {post.comments.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-blue-500/20 to-transparent blur-3xl -z-10" />
      </div>
    </div>
  );
};

export default ForumPostPage;
