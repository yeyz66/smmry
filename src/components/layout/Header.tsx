'use client'; // Make this a client component

import Link from 'next/link';
import { FileText, LogIn, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4 flex justify-between items-center py-4">
        <Link href="/" className="flex items-center font-bold text-2xl text-blue-500">
          <FileText className="mr-2" />
          SummryAI
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : session ? (
            <>
              <span className="text-sm text-gray-600">Welcome, {session.user?.name || session.user?.email}</span>
              <Link href="/summarize" className="btn btn-primary">Dashboard</Link>
              <button 
                onClick={() => signOut()} 
                className="btn btn-outline flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Optional: Add links to other pages like /features or /pricing here */}
              <Link 
                href="/auth"
                className="btn btn-primary flex items-center gap-2 transform transition-transform duration-200 hover:scale-105"
              >
                 <LogIn className="w-4 h-4" />
                 <span>Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 