/**
 * Express 5 type extensions for the Revive Roof Repair API.
 *
 * Extends Express.Request to carry the authenticated user context
 * populated by the Clerk auth middleware.
 */

export interface AuthenticatedUser {
  userId: string; // user_profile.id (UUID)
  clerkUserId: string;
  role: "ADMIN" | "CREW" | "CLIENT";
  displayName: string;
  email: string | null;
  clientId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      /** Populated by clerkAuth middleware. Undefined on unauthenticated routes. */
      user?: AuthenticatedUser;
    }
  }
}

export {};
