"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api"; // ky instance

export default function HomePage() {
  const router = useRouter();

  const { mutate: createChat, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api
        .post("chat/start", {
          json: {
            title: "New Chat from Homepage",
            firstMessage: undefined, // optional, or you can provide a first message here
          },
        })
        .json<{ sessionId: string }>();

      return res.sessionId;
    },
    onSuccess: (sessionId) => {
      router.push(`/${sessionId}`);

    },
  });

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold">Welcome to Gemini Chat</h1>
        <p className="text-muted-foreground">
          Click below to start a new conversation
        </p>
        <Button onClick={() => createChat()} disabled={isPending}>
          {isPending ? "Creating..." : "Start New Chat"}
        </Button>
      </div>
    </main>
  );
}
