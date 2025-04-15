'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image'; // Use Next.js Image for potential optimization
import { Mail, LogIn, Apple, Zap, X } from 'lucide-react'; // Import icons

// Removed the Base64 Google logo URL

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Specify the provider ID ('google') and redirect back to home after success
    signIn('google', { callbackUrl: '/' }).finally(() => setIsLoading(false));
  };

  // Function to handle closing the modal/page
  const handleClose = () => {
    // Navigate back to the previous page in history
    window.history.back();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative">
        {/* Close button - Uncommented and added onClick handler */}
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={24} /> {/* Slightly larger icon */} 
        </button>

        <div className="text-center mb-8">
          {/* Placeholder for SMMRY Logo - Replace with your actual logo component or img */}
          <h1 className="text-3xl font-bold text-purple-600 mb-2 font-serif tracking-wider">SMMRY</h1>
          <p className="text-gray-600">Please sign in to get started.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 cursor-pointer"
          >
            {/* Use the SVG file from the public directory */}
            <Image src="/icons/google.svg" alt="Google logo" width={18} height={18} />
            <span>Sign in with Google</span>
          </button>

          {/* Apple Sign in button removed */}

        </div>

      </div>
    </div>
  );
} 