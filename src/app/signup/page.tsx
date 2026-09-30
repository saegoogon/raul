import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { SignUpForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Create account" };

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/drive");
  return (
    <AuthCard
      title="Create account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-paper hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
