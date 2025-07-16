"use client";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type React from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react"; // Changed from SendHorizonal
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useEffect, useTransition } from "react";

const formSchema = z.object({
  prompt: z.string().min(1, "Message cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSend: (prompt: string) => void;
}

export function ChatInput({
  input,
  setInput,
  handleInputChange,
  onSend,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const height = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${height}px`;
    }
  }, [form.watch("prompt")]);

  const onSubmit = (data: FormValues) => {
    const prompt = data.prompt.trim();
    if (!prompt) return;

    // Reset form immediately for UX
    form.reset();
    setInput("");
    startTransition(() => {
      onSend(prompt);
    });
  };

  return (
    <div className="p-4 bg-card rounded-2xl shadow-lg">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative w-full max-w-3xl mx-auto"
        >
          <div className="relative">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      placeholder="Send a message..."
                      className="w-full min-h-[100px] max-h-[200px] resize-none text-base py-3 pl-4 pr-14 rounded-xl border bg-background focus-visible:ring-1 focus-visible:ring-ring shadow-sm"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          formRef.current?.requestSubmit();
                        }
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !form.watch("prompt").trim()}
              className="absolute right-2 bottom-[5px] h-10 w-10 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer" // Adjusted bottom position
            >
              <ArrowUp className="h-5 w-5" /> {/* Changed icon */}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
