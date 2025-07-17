"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ChatMessages, ChatMessagesRef } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Message } from "@/components/chat-message";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const chatRef = useRef<ChatMessagesRef>(null);
  const { sessionId } = useParams() as { sessionId: string };
  const queryClient = useQueryClient();
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      const res = await api
        .get(`chat/${sessionId}/messages`)
        .json<{ messages: Message[] }>();
      return res.messages;
    },
    enabled: !!sessionId,
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({
      role,
      content,
    }: {
      role: "user";
      content: string;
    }) => {
      const res = await api
        .post(`chat/${sessionId}/messages`, {
          json: { message: content },
        })
        .json<{ response: string }>();

      return {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: res.response,
        createdAt: new Date().toISOString(),
      };
    },

    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({
        queryKey: ["chatMessages", sessionId],
      });

      const previousMessages = queryClient.getQueryData<Message[]>([
        "chatMessages",
        sessionId,
      ]);

      const optimisticMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(
        ["chatMessages", sessionId],
        (old = []) => [...old, optimisticMessage]
      );

      chatRef.current?.scrollToBottom();

      return { previousMessages };
    },

    onSuccess: (responseMessage) => {
      queryClient.setQueryData<Message[]>(
        ["chatMessages", sessionId],
        (old: any = []) => [...old, responseMessage]
      );

      setInput("");
      chatRef.current?.scrollToBottom();

      queryClient.invalidateQueries({ queryKey: ["chatMessages", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },

    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["chatMessages", sessionId],
          context.previousMessages
        );
      }
    },
  });

  const hasMessages = messages.length > 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
    chatRef.current?.scrollToBottom();
  };

  const handleSend = (prompt: string) => {
    sendMessage({ role: "user", content: prompt });
  };

  return (
    <div
      className={cn(
        "w-full",
        hasMessages
          ? "flex flex-col max-h-[calc(100dvh-65px)]"
          : "h-screen flex justify-center items-center"
      )}
    >
      {hasMessages && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <ChatMessages
              ref={chatRef}
              chatId={sessionId}
              isThinking={isPending}
              messages={messages} // ✅ add this line
            />
          </div>
        </div>
      )}

      <div
        className={cn("w-full", hasMessages ? "bg-background px-4 py-6" : "")}
      >
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            input={input}
            setInput={setInput}
            handleInputChange={handleInputChange}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
