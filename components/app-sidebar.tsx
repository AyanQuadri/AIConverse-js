"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useChatMessages } from "@/hooks/use-chat-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function AppSidebar() {
  const { data: messages = [], isLoading } = useChatMessages();
  const queryClient = useQueryClient();

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`chat/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
  });

  const userMessages = messages.filter((msg) => msg.role === "user");

  return (
    <TooltipProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <h2 className="text-lg font-bold">Gemini Chat</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <SidebarMenuItem>
                    <span className="text-muted-foreground text-xs p-2">
                      Loading...
                    </span>
                  </SidebarMenuItem>
                ) : userMessages.length === 0 ? (
                  <SidebarMenuItem>
                    <span className="text-muted-foreground text-xs p-2">
                      No user messages yet
                    </span>
                  </SidebarMenuItem>
                ) : (
                  userMessages.map((msg) => (
                    <SidebarMenuItem
                      key={msg.id}
                      className="flex justify-between items-center gap-2"
                    >
                      <span className="text-sm truncate max-w-[140px]">
                        {msg.content}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => deleteMessage(msg.id)}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
          Ayan Ai Chat Bot
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
