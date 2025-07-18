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
import { ArrowUp, Paperclip, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useEffect, useTransition } from "react";

const formSchema = z.object({
  prompt: z.string().min(1, "Message cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChatInputProps {
  onSend: (prompt: string) => void;
  isThinking: boolean; // Prop to indicate if AI is processing a response
}

// Sample prompts for the user
const samplePrompts = [
  "Explain quantum computing in simple terms",
  "Give me ideas for a healthy dinner",
  "Write a short story about a robot discovering emotions",
  "Summarize the latest news in AI",
  "What are the benefits of cloud computing?",
  "How does photosynthesis work?",
];

export function ChatInput({ onSend, isThinking }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const height = Math.min(textareaRef.current.scrollHeight, 200); // Max height 200px
      textareaRef.current.style.height = `${height}px`;
    }
  }, [form.watch("prompt")]); // Watch the prompt field for changes

  const onSubmit = (data: FormValues) => {
    const prompt = data.prompt.trim();
    if (!prompt) return;

    form.reset(); // Reset the form field after submission
    startTransition(() => {
      onSend(prompt);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter
      formRef.current?.requestSubmit(); // Submit the form
    }
  };

  const handlePromptClick = (promptText: string) => {
    form.setValue("prompt", promptText, { shouldValidate: true }); // Set value and trigger validation
    textareaRef.current?.focus(); // Focus the textarea after setting the prompt
  };

  const isDisabled = isThinking || isSubmitting;

  return (
    <div className="w-full px-4 pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Prompt Suggestions */}
        {samplePrompts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Try these prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-3 py-1 leading-5 bg-background hover:bg-accent transition-colors"
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isDisabled}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full relative bg-background rounded-lg border border-accent transition-colors shadow-sm"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        ref={textareaRef}
                        placeholder="Type your message here..."
                        rows={1}
                        onKeyDown={handleKeyDown}
                        disabled={isDisabled}
                        className="w-full min-h-[100px] max-h-[200px] resize-none py-4 pl-4 pr-12  shadow-none bg-transparent"
                      />
                      <div className="absolute right-3 bottom-3">
                        <Button
                          type="submit"
                          size="icon"
                          variant={field.value.trim() ? "default" : "secondary"}
                          disabled={isDisabled || !field.value.trim()}
                          className="h-8 w-8 rounded-full transition-colors cursor-pointer"
                          aria-label="Send message"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
