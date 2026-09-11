import { Suspense } from "react";
import { SignupForm } from "@/components/SignupForm";

export const metadata = {
  title: "Create an account — Pickora",
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
