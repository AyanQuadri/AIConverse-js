"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, User } from "lucide-react";
import { useChatMessages } from "@/hooks/use-chat-message";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessagesRef {
  scrollToBottom: () => void;
}

interface ChatMessagesProps {
  isThinking: boolean;
}

export const ChatMessages = forwardRef<ChatMessagesRef, ChatMessagesProps>(
  ({ isThinking }, ref) => {
    const { data: messages = [] } = useChatMessages();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      },
    }));

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
      <div className="space-y-4 px-4">
        {messages.map((m: Message) => (
          <div
            key={m.id}
            className={cn(
              "flex items-start gap-2",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role === "user" && (
              <div className="mt-1 text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
            )}
            <Card
              className={cn(
                "max-w-[70%] rounded-xl",
                m.role === "user"
                  ? "bg-[#171717] text-foreground border px-3 py-2 text-sm"
                  : "bg-muted/50 text-muted-foreground border px-4 py-3"
              )}
            >
              <CardContent className="p-0 whitespace-pre-wrap">
                {m.content}
              </CardContent>
            </Card>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[90%] mr-10 rounded-lg">
              <div className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse" />
                    <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse delay-100" />
                    <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-pulse delay-200" />
                  </div>
                  <span className="text-sm text-gray-500">
                    Generating response
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    );
  }
);

ChatMessages.displayName = "ChatMessages";
