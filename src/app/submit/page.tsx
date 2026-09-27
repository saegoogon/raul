import { redirect } from "next/navigation";
import { createPost } from "@/actions/posts";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">새 글 작성</h1>

      <form action={createPost} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={300}
            placeholder="제목을 입력하세요"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            내용 (선택)
          </label>
          <textarea
            id="content"
            name="content"
            rows={5}
            placeholder="텍스트를 입력하세요"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-medium">
            이미지 (선택)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-zinc-600"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-zinc-950 py-2.5 font-medium text-white hover:bg-zinc-800"
        >
          게시
        </button>
      </form>
    </div>
  );
}
