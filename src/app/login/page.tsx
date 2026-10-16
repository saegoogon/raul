import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;
  return (
    <AuthCard
      title="로그인"
      footer={
        <>
          계정이 없으면{" "}
          <Link href="/signup" className="font-medium text-paper hover:underline">
            가입
          </Link>
        </>
      }
    >
      <LoginForm oauthFailed={error === "oauth"} />
    </AuthCard>
  );
}
