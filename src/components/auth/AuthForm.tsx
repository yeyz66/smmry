'use client'; // Mark this as a client component

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from "next/link";
import { X } from 'lucide-react'; 

// Client Component containing the form and hooks
function AuthForm() {

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setIsLoading(false); 
    }
  };
  
  const handleClose = () => {
      window.history.back();
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-background px-4">
      {/* Close Button */}
      <button 
        onClick={handleClose} 
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X size={24} /> 
      </button>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue summarizing.</p>
        </div>

        {/* Google Sign-In Button */} 
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="btn btn-primary inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="mr-2">G</span> // Placeholder
          )}
          Sign in with Google
        </button>

        <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default AuthForm; 