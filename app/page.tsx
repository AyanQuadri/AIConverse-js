"use client";

import { useState, useRef } from "react";
import { ChatMessages, ChatMessagesRef } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { usePostMessage } from "@/hooks/use-post-message";
import { useChatMessages } from "@/hooks/use-chat-message";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [input, setInput] = useState("");
  const chatRef = useRef<ChatMessagesRef>(null);
  const { data: messages = [] } = useChatMessages();
  const hasMessages = messages.length > 0;

  const {
    mutate: sendMessage,
    isPending,
  } = usePostMessage();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
    chatRef.current?.scrollToBottom();
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
      {/* Chat messages only shown if messages exist */}
      {hasMessages && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <ChatMessages ref={chatRef} isThinking={isPending} />
          </div>
        </div>
      )}

      {/* Chat input area */}
      <div className={cn("w-full", hasMessages ? "bg-background px-4 py-6" : "")}>
        <div className="max-w-2xl mx-auto w-full">
          <ChatInput
            input={input}
            setInput={setInput}
            handleInputChange={handleInputChange}
            onSend={(prompt) => {
              sendMessage(prompt, {
                onSuccess: () => {
                  setInput("");
                  chatRef.current?.scrollToBottom();
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
