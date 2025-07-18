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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash, Pencil, MoreVertical, MessageSquarePlus } from "lucide-react"; // Added MessageSquarePlus
import { useState, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

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
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          className="w-full text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => createSession()}
          disabled={isPending}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {isPending ? "Creating..." : "New Chat"}
        </Button>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Chat History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ) : sessions.length === 0 ? (
                <SidebarMenuItem className="px-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    No sessions yet
                  </span>
                </SidebarMenuItem>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem
                    key={session.id}
                    className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                  >
                    <Link
                      href={`/${session.id}`}
                      className="text-sm flex-1 truncate py-1" // Added py-1 for better click area
                    >
                      {session.title || "Untitled Chat"}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" // Only show on hover
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingSession(session);
                            setNewTitle(session.title || "");
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => deleteSession(session.id)}
                          className="text-red-500 focus:text-red-600 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
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
      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800 text-sm text-muted-foreground text-center">
        AIConverse
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
