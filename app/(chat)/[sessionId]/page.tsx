"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import { useParams } from "next/navigation";
import { ChatMessages, type ChatMessagesRef } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Message } from "@/components/chat-message";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const chatRef = useRef<ChatMessagesRef>(null);
  const { sessionId } = useParams() as { sessionId: string };
  const queryClient = useQueryClient();

  // Add useEffect to invalidate and refetch when sessionId changes
  useEffect(() => {
    if (sessionId) {
      // Invalidate and refetch messages for the new session when sessionId changes.
      // This ensures that when navigating to a different session, its history is fetched fresh.
      queryClient.invalidateQueries({ queryKey: ["chatMessages", sessionId] });
    }
  }, [sessionId, queryClient]); // Depend on sessionId and queryClient

  const { data: messages = [] } = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      const res = await api
        .get(`chat/${sessionId}/messages`)
        .json<{ messages: Message[] }>();
      return res.messages;
    },
    enabled: !!sessionId,
    refetchInterval:3000,
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
        id: crypto.randomUUID(), // Unique ID for optimistic message
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(
        ["chatMessages", sessionId],
        (old = []) => [...old, optimisticMessage]
      );

      chatRef.current?.scrollToBottom();

      // Return a context object with the optimistic message ID
      return { previousMessages, optimisticMessageId: optimisticMessage.id };
    },
    onSuccess: ({ userMessage, assistantMessage }, _variables, context) => {
      queryClient.setQueryData<Message[]>(
        ["chatMessages", sessionId],
        (old = []) => {
          // Find the optimistic message by its ID and replace it with the actual userMessage
          const updatedMessages = old.map((msg) =>
            msg.id === context?.optimisticMessageId ? userMessage : msg
          );
          // Append the assistantMessage
          return [...updatedMessages, assistantMessage];
        }
      );
      setInput("");
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
      // Invalidate to ensure data consistency, but the UI should already be updated by onSuccess
      queryClient.invalidateQueries({ queryKey: ["chatMessages", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const hasMessages = messages.length > 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
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
              messages={messages}
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
