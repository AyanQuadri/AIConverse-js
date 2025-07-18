"use client";
import { useRef, useEffect } from "react";

import { useParams } from "next/navigation";
import { ChatMessages, type ChatMessagesRef } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Message } from "@/components/chat-message";

export default function ChatPage() {
  const chatRef = useRef<ChatMessagesRef>(null);
  const { sessionId } = useParams() as { sessionId: string };
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", sessionId] });
    }
  }, [sessionId, queryClient]);

  const { data: messages = [] } = useQuery({
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
        .json<{
          userMessage: Message;
          assistantMessage: Message;
        }>();
      return res;
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

      return { previousMessages, optimisticMessageId: optimisticMessage.id };
    },
    onSuccess: ({ userMessage, assistantMessage }, _variables, context) => {
      queryClient.setQueryData<Message[]>(
        ["chatMessages", sessionId],
        (old = []) => {
          const updatedMessages = old.map((msg) =>
            msg.id === context?.optimisticMessageId ? userMessage : msg
          );
          return [...updatedMessages, assistantMessage];
        }
      );
      chatRef.current?.scrollToBottom();
    },
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["chatMessages", sessionId],
          context.previousMessages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const hasMessages = messages.length > 0;

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
              messages={messages}
            />
          </div>
        </div>
      )}
      <div
        className={cn("w-full", hasMessages ? "bg-background px-4 py-6" : "")}
      >
        <div className="max-w-5xl mx-auto w-full">
          <ChatInput onSend={handleSend} isThinking={isPending} />
        </div>
      </div>
    </div>
  );
}
