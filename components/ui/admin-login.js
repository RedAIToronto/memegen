import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";



export function AdminLogin({ onLogin }) {

  const [password, setPassword] = useState('');

  const { toast } = useToast();



  const handleSubmit = (e) => {

    e.preventDefault();

    

    // Check if password matches ADMIN_SECRET

    if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {

      onLogin(password); // Pass the password as the token

      toast({

        title: "Success",

        description: "Welcome to admin panel",

      });

    } else {

      toast({

        variant: "destructive",

        title: "Error",

        description: "Invalid password",

      });

    }

    setPassword('');

  };



  return (

    <div className="flex items-center justify-center min-h-screen">

      <Card className="w-[400px]">

        <CardHeader>

          <CardTitle>Admin Login</CardTitle>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input

              type="password"

              placeholder="Enter admin password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

            />

            <Button type="submit" className="w-full">Login</Button>

          </form>

        </CardContent>

      </Card>

    </div>

  );

}


