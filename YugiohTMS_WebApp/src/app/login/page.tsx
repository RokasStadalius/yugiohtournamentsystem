'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleLogin } from '../../utils/auth';
import toast, { Toaster } from 'react-hot-toast';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token != null) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleLogin(email, password);
      console.log(data);
      router.push('/');
      toast.success('Login successful!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: 'white' } }} />
      
      <Card className="bg-zinc-900 border-2 border-zinc-800 w-full max-w-md">
        <CardHeader className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Yu-Gi-Oh TMS
            </h1>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-zinc-400">Sign in to continue your collection</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 focus:border-red-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                Continue
              </Button>
              
              <Button
                type="button"
                onClick={() => router.push('/register')}
                variant="outline"
                className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                Create New Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="absolute top-0 right-0 w-1/3 h-72 bg-gradient-to-r from-red-500/20 to-transparent blur-3xl -z-10" />
    </div>
  );
}