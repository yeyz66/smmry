import { Suspense } from 'react'; // Import Suspense

// Import the separated client component
import AuthForm from '@/components/auth/AuthForm';

// Main page component (Server Component)
export default function AuthenticationPage() {
  return (
    // Wrap the client component in Suspense
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
} 