import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/drive");
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Log in"
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-paper hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm oauthFailed={error === "oauth"} />
    </AuthCard>
  );
}
