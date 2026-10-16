import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { SignUpForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "가입" };

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <AuthCard
      title="가입"
      footer={
        <>
          이미 계정이 있으면{" "}
          <Link href="/login" className="font-medium text-paper hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
