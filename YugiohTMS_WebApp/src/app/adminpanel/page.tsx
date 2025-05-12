"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Badge, Shield, UserX } from "lucide-react";
import { Sidebar } from "../components/sidebar";
import { Input } from "@/components/ui/input";

export default function AdminPanel() {
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    needsUpdate: boolean;
    newCardsCount: number;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [userIdToBan, setUserIdToBan] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [banReason, setBanReason] = useState("");


  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cards/pending-updates`
        );
        if (!response.ok) throw new Error("Status check failed");

        const data = await response.json();
        setUpdateStatus({
          needsUpdate: data.newCardsCount > 0,
          newCardsCount: data.newCardsCount,
        });
      } catch (error) {
        console.error("Error checking updates:", error);
        toast.error("Failed to check card database status");
      } finally {
        setStatusLoading(false);
      }
    };

    checkForUpdates();
  }, []);

  const handleApiCall1 = async () => {
    setIsLoading1(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cards/sync`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      toast.success(`Added ${result.newCards} new cards!`);
      setUpdateStatus({
        needsUpdate: false,
        newCardsCount: 0,
      });
    } catch (err) {
    } finally {
      setIsLoading1(false);
    }
  };

  const handleFetchAndStore = async () => {
    setIsLoading2(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cards/fetch-and-store`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Fetching failed");

      toast.success("Fetching complete!");
    } catch (error) {
    } finally {
      setIsLoading2(false);
    }
  };

  const handleBanUser = async () => {
    if (!userIdToBan) {
      toast.error("Please enter a User ID");
      return;
    }
  
    setIsBanning(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/ban-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ID_User: userIdToBan,
          }),
        }
      );
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to ban user");
      }
  
      toast.success(`User ${userIdToBan} banned successfully`);
      setUserIdToBan("");
    } catch (error: any) {
      toast.error(error.message || "Ban operation failed");
      console.error("Ban error:", error);
    } finally {
      setIsBanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
      <Sidebar />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
        </div>

        <Card className="bg-zinc-800 border-2 border-zinc-700 p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-4">
              <UserX className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              <Input
                placeholder="User ID to ban"
                value={userIdToBan}
                onChange={(e) => setUserIdToBan(e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-zinc-100"
              />
              <Button
                onClick={handleBanUser}
                disabled={isBanning}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {isBanning ? (
                  <>
                    <span className="animate-spin">🌀</span>
                    Banning...
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    Ban User
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-800 border-2 border-zinc-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Button
                onClick={handleApiCall1}
                disabled={isLoading1 || statusLoading}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700 w-full"
              >
                {isLoading1 ? (
                  <>
                    <span className="animate-spin">🌀</span>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔄</span>
                      {statusLoading ? (
                        <span className="h-4 w-4 bg-zinc-700 rounded-full animate-pulse" />
                      ) : (
                        updateStatus?.needsUpdate && (
                          <Badge className="animate-pulse">
                            {updateStatus.newCardsCount} New
                          </Badge>
                        )
                      )}
                    </div>
                    <span>Sync Card Database</span>
                    <span className="text-sm text-zinc-300">
                      Update from external source
                    </span>
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={handleFetchAndStore}
              disabled={isLoading2}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading2 ? (
                <>
                  <span className="animate-spin">🌀</span>
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">⬇️</span>
                  <span>Fetch Card Database</span>
                  <span className="text-sm text-zinc-300">
                    Fetch from external source
                  </span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
