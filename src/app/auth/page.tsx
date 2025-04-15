'use client';

import { useState } from 'react';
import Link from "next/link"
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image'; // Use Next.js Image for potential optimization
import { X } from 'lucide-react'; // Re-add X for the close button

// Removed the Base64 Google logo URL

export default function AuthenticationPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Use callbackUrl for redirection after successful sign-in
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // Handle error appropriately (e.g., show a message to the user)
      setIsLoading(false); // Reset loading state on error
    }
    // No need to set isLoading to false here if signIn redirects
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
        <X size={24} /> {/* Use imported X icon */} 
      </button>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          {/* Use Next Image for logo */}
          <Image 
            src="/logo-smmryai.png" // Assuming logo is in public folder
            alt="Smmry.ai Logo"
            width={64} // Provide appropriate width
            height={64} // Provide appropriate height
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue summarizing.</p>
        </div>

        {/* Google Sign-In Button */} 
        {/* Replace custom button with a standard button for now */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            /* Add Google Icon placeholder if Icons component is unavailable */
            <span className="mr-2">G</span> // Placeholder
          )}
          Sign in with Google
        </button>

        {/* OR Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email Sign-in Placeholder - Removed Input/Label */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {/* Replace custom button with a standard button */}
          <button type="submit" className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            Sign in with Email
          </button>
        </div>

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