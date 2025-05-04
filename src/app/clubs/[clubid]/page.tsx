"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Sword, ArrowLeft, UserPlus, MailPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Sidebar } from "@/app/components/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClubDetails = {
  iD_Club: number;
  name: string;
  description: string;
  location: string;
  iD_Owner: number;
  news: NewsDto[];
  visibility: string;
};

type NewsDto = {
  iD_ClubNews: number;
  content: string;
  createdDate: string;
};

type ClubMember = {
  iD_ClubMember: number;
  iD_User: number;
};

export default function ClubDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clubid = params?.clubid as string;

  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newNews, setNewNews] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
  }, []);

  useEffect(() => {
    if (clubid && currentUserId) {
      fetchClubDetails();
      fetchClubMembers();
      checkIfMember();
    }
  }, [clubid, currentUserId]);

  const fetchClubDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/${clubid}`
      );
      if (!response.ok) throw new Error("Failed to fetch club details");
      const data: ClubDetails = await response.json();
      setClub(data);
    } catch (err) {
      setError("Failed to load club details");
      toast.error("Failed to load club details");
    } finally {
      setLoading(false);
    }
  };

  const fetchClubMembers = async () => {
    if (!clubid) return;
    setLoadingMembers(true);
    setErrorMembers("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/${clubid}/members`
      );
      if (!response.ok) throw new Error("Failed to fetch club members");
      const data: ClubMember[] = await response.json();
      setClubMembers(data);
    } catch (err) {
      setErrorMembers("Failed to load club members");
      toast.error("Failed to load club members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const checkIfMember = async () => {
    if (!clubid || !currentUserId) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/${clubid}/ismember?userId=${currentUserId}`
      );
      setIsMember(response.ok);
    } catch (err) {
      console.error("Error checking membership:", err);
    }
  };

  const handleJoinClub = async () => {
    if (!clubid || !currentUserId) {
      toast.error("User ID or Club ID not found.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/${clubid}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join club");
      }
      toast.success("Successfully joined the club!");
      setIsMember(true);
      fetchClubMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePostNews = async () => {
    try {
      if (!currentUserId) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ClubNews/clubId=${clubid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Content: newNews,
            UserId: currentUserId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post news");
      }

      setNewNews("");
      fetchClubDetails();
      toast.success("News posted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSendInvitation = async () => {
    if (!clubid || !currentUserId || !inviteUserId) {
      toast.error("Club ID, your User ID, or the invitee's User ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/club/${clubid}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIdToInvite: inviteUserId,
            currentUserId: currentUserId, // Include currentUserId in the request
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }
      toast.success(`Invitation sent to user ${inviteUserId}!`);
      setInviteUserId("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Sidebar />
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-48 mb-8 bg-zinc-900" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
              <Skeleton className="h-32 bg-zinc-900 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 bg-zinc-900 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clubs
        </Button>

        {error ? (
          <div className="text-center py-12 text-zinc-400">
            {error} - Please try again later
          </div>
        ) : club ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <h1 className="text-3xl font-bold mb-4">{club.name}</h1>
                  <div className="flex items-center mb-4 text-zinc-400">
                    <MapPin className="h-5 w-5 mr-2" />
                    {club.location}
                  </div>
                  <p className="text-zinc-300">{club.description}</p>
                  {club.visibility === "private" && !isMember && currentUserId !== club.iD_Owner && (
                    <p className="text-yellow-500 italic">This is a private club.</p>
                  )}
                  {club.visibility === "public" && !isMember && (
                    <Button onClick={handleJoinClub} className="bg-green-500 hover:bg-green-600 mt-4">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Club
                    </Button>
                  )}
                  {isMember && <p className="text-green-500 mt-4">You are a member of this club.</p>}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Latest News</h2>
                  <div className="space-y-4">
                    {club.news.map((news) => (
                      <div key={news.iD_ClubNews} className="border-b border-zinc-800 pb-4">
                        <p className="text-zinc-300">{news.content}</p>
                        <p className="text-zinc-500 text-sm mt-2">
                          {new Date(news.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {club.news.length === 0 && (
                      <div className="text-zinc-500">No news yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {currentUserId === club.iD_Owner && club.visibility === "private" && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Invite Member</h3>
                    <div className="space-y-2">
                      <Label htmlFor="inviteUserId" className="text-zinc-300">
                        User ID to Invite:
                      </Label>
                      <Input
                        type="number"
                        id="inviteUserId"
                        className="bg-zinc-800 border-zinc-700 text-white"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)}
                      />
                      <Button
                        onClick={handleSendInvitation}
                        className="bg-blue-500 hover:bg-blue-600 w-full mt-4"
                        disabled={!inviteUserId}
                      >
                        <MailPlus className="mr-2 h-4 w-4" />
                        Send Invitation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentUserId === club.iD_Owner && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Post New Update</h3>
                    <textarea
                      value={newNews}
                      onChange={(e) => setNewNews(e.target.value)}
                      className="w-full bg-zinc-800 border-zinc-700 rounded-md p-3 text-white mb-4"
                      rows={4}
                      placeholder="Share news with your club members..."
                    />
                    <Button
                      className="bg-red-500 hover:bg-red-600 w-full"
                      onClick={handlePostNews}
                    >
                      Post Update
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Club Info</h3>
                  <div className="space-y-2 text-zinc-300">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Owner ID: {club?.iD_Owner}
                    </div>
                    <div className="flex items-center">
                      <Sword className="h-4 w-4 mr-2" />
                      Club ID: {club?.iD_Club}
                    </div>
                    <div className="capitalize">Visibility: {club?.visibility}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Club Members</h3>
                  {loadingMembers ? (
                    <div className="text-zinc-500">Loading members...</div>
                  ) : errorMembers ? (
                    <div className="text-red-500">{errorMembers}</div>
                  ) : clubMembers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-zinc-400">
                        <thead className="text-xs text-zinc-500 uppercase">
                          <tr>
                            <th scope="col" className="py-3 px-6">
                              ID
                            </th>
                            <th scope="col" className="py-3 px-6">
                              User ID
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {clubMembers.map((member) => (
                            <tr
                              key={member.iD_ClubMember}
                              className="bg-zinc-800 border-b border-zinc-700"
                            >
                              <td className="py-4 px-6">{member.iD_ClubMember}</td>
                              <td className="py-4 px-6">{member.iD_User}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-zinc-500">No members yet.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            Club not found
          </div>
        )}
      </div>
    </div>
  );
}

