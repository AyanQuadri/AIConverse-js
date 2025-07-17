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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash, Pencil, MoreVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Session = {
  id: string;
  title: string;
};

export function AppSidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isPendingTransition, startTransition] = useTransition();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api
        .get("chat/sessions")
        .json<{ sessions: Session[] }>();
      return res.sessions;
    },
  });

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api
        .post("chat/start", {
          json: { title: "", firstMessage: "New Chat" },
        })
        .json<{ sessionId: string }>();
      return res.sessionId;
    },
    onSuccess: (newSessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      router.push(`/${newSessionId}`);
    },
  });

  const { mutate: deleteSession } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`chat/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const { mutate: editSession, isPending: mutationPending } = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      await api.patch(`chat/${id}`, { json: { title } });
    },
    onSuccess: () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        setEditingSession(null);
        setNewTitle("");
      });
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Button
          className="w-full text-xs"
          onClick={() => createSession()}
          disabled={isPending}
        >
          {isPending ? "Creating..." : "+ New Chat"}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                </SidebarMenuItem>
              ) : sessions.length === 0 ? (
                <SidebarMenuItem>
                  <span className="text-xs text-muted-foreground">
                    No sessions yet
                  </span>
                </SidebarMenuItem>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem
                    key={session.id}
                    className="flex items-start gap-2 flex-col w-full"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Link
                        href={`/${session.id}`}
                        className="text-sm hover:underline flex-1 truncate"
                      >
                        {session.title || "Untitled"}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingSession(session);
                              setNewTitle(session.title || "");
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => deleteSession(session.id)}
                          >
                            <Trash className="mr-2 h-4 w-4 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
        Ayan AI Chat Bot
      </SidebarFooter>

      {/* Rename Dialog */}
      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new session title"
          />
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() =>
                editSession({ id: editingSession!.id, title: newTitle.trim() })
              }
              disabled={
                isPendingTransition || mutationPending || newTitle.trim() === ""
              }
              className="cursor-pointer"
            >
              {isPendingTransition || mutationPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
