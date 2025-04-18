// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Save, Shield, Sword } from "lucide-react";
import toast from "react-hot-toast";
import { Sidebar } from "../components/sidebar";

type UserProfile = {
  userName: string;
  email: string;
  bio: string;
  profilePicUrl: string;
  matches: MatchHistory[];
};

type MatchHistory = {
  id: number;
  opponentName: string;
  result: string;
  matchDate: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    profilePic: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");
        
        const data = await response.json();
        setProfile({
          userName: data.userName,
          email: data.email,
          bio: data.bio,
          profilePicUrl: data.profilePicUrl,
          matches: data.matches || []
        });
        setFormData({ bio: data.bio, profilePic: null });
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, profilePic: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Image upload failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error("Image upload failed. Please try again.");
    }
  };

  const updateProfile = async (bio: string, profilePicUrl?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ bio, profilePicUrl }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profile update failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error("Failed to update profile. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let newProfilePicUrl = profile?.profilePicUrl;

      if (formData.profilePic) {
        const { fileUrl } = await uploadImage(formData.profilePic);
        newProfilePicUrl = fileUrl;
      }

      const updatedUser = await updateProfile(formData.bio, newProfilePicUrl);

      setProfile(updatedUser);
      setEditMode(false);
      setPreviewImage(null);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48 bg-zinc-900" />
          <div className="flex gap-8">
            <Skeleton className="h-96 w-96 bg-zinc-900" />
            <Skeleton className="h-96 flex-1 bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Sidebar />
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{profile?.userName}'s Profile</h1>
          {!editMode && profile && (
            <Button 
              variant="outline" 
              onClick={() => setEditMode(true)}
              className="hover:bg-zinc-800 transition-colors"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          <Card className="bg-zinc-900 border-zinc-800 flex-1">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Image
                      src={
                        previewImage ||
                        profile?.profilePicUrl ||
                        "/userplaceholder.png"
                      }
                      alt="Profile"
                      width={150}
                      height={150}
                      className="rounded-full border-2 border-zinc-700"
                    />
                    {editMode && (
                      <Label className="absolute bottom-0 right-0 bg-zinc-800 p-2 rounded-full cursor-pointer hover:bg-zinc-700">
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Pencil className="h-5 w-5" />
                      </Label>
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <Label className="text-zinc-400">Email</Label>
                      <Input
                        value={profile?.email || ""}
                        className="bg-zinc-800 border-zinc-700 mt-1"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Bio</Label>
                      {editMode ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 mt-1 text-white focus:ring-2 focus:ring-red-500"
                          rows={4}
                        />
                      ) : (
                        <p className="bg-zinc-800 rounded-md p-3 mt-1 min-h-[100px]">
                          {profile?.bio || "No bio yet..."}
                        </p>
                      )}
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex gap-4 w-full justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditMode(false);
                          setPreviewImage(null);
                          setFormData({
                            bio: profile?.bio || "",
                            profilePic: null,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 flex-1">
            <CardHeader>
              <CardTitle className="text-xl">Match History</CardTitle>
            </CardHeader>
            <CardContent>
              {matchHistory.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">
                  No matches played yet
                </p>
              ) : (
                <div className="space-y-4">
                  {matchHistory.map((match) => (
                    <div
                      key={match.id}
                      className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {match.result === "Win" ? (
                          <Sword className="h-6 w-6 text-green-500" />
                        ) : (
                          <Shield className="h-6 w-6 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">vs {match.opponentName}</p>
                          <p className="text-sm text-zinc-400">
                            {new Date(match.matchDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full ${
                          match.result === "Win"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
