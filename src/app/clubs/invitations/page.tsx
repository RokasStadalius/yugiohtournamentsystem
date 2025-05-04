"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/app/components/sidebar';

interface ClubInvitation {
    iD_ClubInvitation: number;
    iD_Club: number;
    iD_User: number;
    status: string;
    clubName: string;
    ownerName: string;
}

interface UserRequest {
    userId: number;
}

const UserInvitationsPage: React.FC = () => { // Changed to a React.FC
    const [invitations, setInvitations] = useState<ClubInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            setCurrentUserId(parseInt(userId, 10));
        }
    }, []);

    useEffect(() => {
        if (currentUserId) {
            fetchUserInvitations();
        }
    }, [currentUserId]);

    const fetchUserInvitations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitation/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: currentUserId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch invitations: ${response.status}`);
            }

            const data: ClubInvitation[] = await response.json();
            setInvitations(data);
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching invitations.");
        } finally {
            setLoading(false);
        }
    };


    const handleAcceptInvitation = async (invitationId: number) => {
        try {
            const requestBody: UserRequest = { userId: currentUserId! }; // currentUserId is guaranteed to be set here
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitation/${invitationId}/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody), //send userId
                
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to accept invitation");
            }
            toast.success("Invitation accepted!");
            // Refresh invitations after accepting
            fetchUserInvitations();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRejectInvitation = async (invitationId: number) => {
        try {
            const requestBody: UserRequest = { userId: currentUserId! };  // currentUserId is guaranteed to be set here
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitation/${invitationId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody), //send userId
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reject invitation");
            }
            toast.success("Invitation rejected!");
            // Refresh invitations after rejecting
            fetchUserInvitations();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <Sidebar/>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-400" />
                    My Invitations
                </h1>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full bg-zinc-800" />
                        <Skeleton className="h-20 w-full bg-zinc-800" />
                        <Skeleton className="h-20 w-full bg-zinc-800" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-lg">You have no pending invitations.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map((invitation) => (
                            <Card
                                key={invitation.iD_ClubInvitation}
                                className={cn(
                                    "bg-zinc-900 border-zinc-800",
                                    "transition-all duration-300",
                                    "hover:shadow-lg hover:shadow-black/20"
                                )}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        Invitation to: {invitation.clubName}
                                    </CardTitle>
                                    {invitation.status.toLowerCase() === 'sent' && (
                                        <span className="text-blue-400 text-sm">Pending</span>
                                    )}
                                    {invitation.status.toLowerCase() === 'accepted' && (
                                        <span className="text-green-400 text-sm flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Accepted
                                        </span>
                                    )}
                                    {invitation.status.toLowerCase() === 'denied' && (
                                        <span className="text-red-400 text-sm flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Declined
                                        </span>
                                    )}
                                </CardHeader>
                                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`/api/user/avatar/${invitation.iD_User}`} alt={`Avatar of ${invitation.ownerName}`} />
                                            <AvatarFallback>
                                                {invitation.ownerName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-gray-300">
                                            Invited by: <span className="font-medium text-white">{invitation.ownerName}</span>
                                        </div>
                                    </div>
                                    {invitation.status.toLowerCase() === 'sent' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-white"
                                                onClick={() => handleAcceptInvitation(invitation.iD_ClubInvitation)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-white"
                                                onClick={() => handleRejectInvitation(invitation.iD_ClubInvitation)}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInvitationsPage;
