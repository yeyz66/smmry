import 'next-auth';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
    } & DefaultSession['user']; // Keep the default properties
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  // Disable the rule because this is standard practice for module augmentation
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends DefaultUser {
    /** Add any custom properties needed from the User model */
    // Example: role?: string;
    // Ensure DefaultUser properties are implicitly included or add needed ones explicitly
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string;
    /** The user's unique identifier */
    id: string;
  }
} 