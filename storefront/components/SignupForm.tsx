"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LoginBackgroundPaths } from "./LoginBackgroundPaths";
import { EmailSignupForm } from "./EmailSignupForm";

// Same real claims used on the sign-in page — see LoginForm.tsx.
const TRUST_CLAIMS = [
  { title: "90-day warranty", copy: "Every laptop is covered from the day it ships." },
  { title: "Free shipping", copy: "No surprises at checkout — free shipping, always." },
  { title: "Price match", copy: "Found it cheaper elsewhere? We'll match it." },
  { title: "Certified refurbished", copy: "Every laptop passes a full inspection first." },
];

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </svg>
  );
}

export function SignupForm() {
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const redirectPath = searchParams.get("next") ?? "/account";

  async function handleGoogleSignUp() {
    setBusy(true);
    setError(false);
    try {
      await signInWithGoogle(redirectPath);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <main className="relative lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-cream-warm p-10 lg:flex">
        <LoginBackgroundPaths position={1} />

        <Link href="/" className="relative z-10 w-fit">
          <Image src="/fevicon.svg" alt="Pickora" width={689} height={198} className="h-8 w-auto" />
        </Link>

        <div className="relative z-10 mt-auto space-y-6">
          {TRUST_CLAIMS.map((claim) => (
            <div key={claim.title}>
              <p className="text-base text-ink">{claim.title}</p>
              <p className="mt-1 text-sm text-taupe">{claim.copy}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center bg-cream p-[var(--gutter-mobile)] md:p-[var(--gutter-desktop)]">
        <Link
          href="/"
          className="absolute left-5 top-7 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-2 text-sm text-taupe transition-colors hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </Link>

        <div className="mx-auto w-full max-w-sm space-y-6">
          <Link href="/" className="block w-fit lg:hidden">
            <Image src="/fevicon.svg" alt="Pickora" width={689} height={198} className="h-7 w-auto" />
          </Link>

          <div>
            <h1 className="text-2xl text-ink">Create your account</h1>
            <p className="mt-1 text-base text-taupe">Save your orders and check out faster next time.</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:opacity-50"
          >
            <GoogleIcon width={18} height={18} aria-hidden />
            {busy ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {error && (
            <p className="text-sm text-red-600">Something went wrong starting sign-up. Please try again.</p>
          )}

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-xs text-taupe-light">or</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <EmailSignupForm redirectPath={redirectPath} />

          <p className="text-center text-sm text-taupe">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(redirectPath)}`}
              className="text-ink underline underline-offset-2 hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
