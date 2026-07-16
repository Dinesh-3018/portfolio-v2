"use server";

import { signIn, signOut } from "@/auth";

/**
 * Server actions behind the guestbook's sign-in chips and sign-out link.
 * Each one redirects back to the page that hosted the form (Auth.js falls
 * back to the Referer), so the same buttons work wherever the guestbook is
 * mounted. No SessionProvider, no client-side auth state.
 */

export async function signInWithGitHub(): Promise<void> {
  await signIn("github");
}

export async function signInWithGoogle(): Promise<void> {
  await signIn("google");
}

export async function signOutOfGuestbook(): Promise<void> {
  await signOut();
}
