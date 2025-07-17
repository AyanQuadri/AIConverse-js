// // /api/chat/route.ts post and get Request;
// // /api/chat/[id]/route.ts delete and patch request;
// // /api/chat/[id]/messages/route.ts post request;

// // hooks/use-hooks.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import ky from "ky";

// type Chat = {
//     id: string;
//     title: string;
//     createdAt: string;
// };

// type Message = {
//     id: string;
//     role: "user" | "model";
//     content: string;
//     createdAt: string;
// };

// // GET all chats
// export const useChats = () => {
//     return useQuery<Chat[]>({
//         queryKey: ["chats"],
//         queryFn: async () => {
//             return api.get("chat").json();
//         },
//     });
// };

// // POST create new chat
// export const useCreateChat = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (title: string) => {
//             return api.post("chat", { json: { title } }).json();
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["chats"] });
//         },
//     });
// };

// // DELETE chat by id
// export const useDeleteChat = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (id: string) => {
//             return api.delete(`chat/${id}`).json();
//         },
//         onMutate: async (id) => {
//             await queryClient.cancelQueries({ queryKey: ["chats"] });
//             const previous = queryClient.getQueryData<Chat[]>(["chats"]);

//             queryClient.setQueryData<Chat[]>(["chats"], (old = []) =>
//                 old.filter((chat) => chat.id !== id)
//             );

//             return { previous };
//         },
//         onError: (_, __, context) => {
//             if (context?.previous) {
//                 queryClient.setQueryData(["chats"], context.previous);
//             }
//         },
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ["chats"] });
//         },
//     });
// };

// // PATCH rename chat
// export const useRenameChat = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async ({ id, title }: { id: string; title: string }) => {
//             return api.patch(`chat/${id}`, { json: { title } }).json();
//         },
//         onMutate: async ({ id, title }) => {
//             await queryClient.cancelQueries({ queryKey: ["chats"] });
//             const previous = queryClient.getQueryData<Chat[]>(["chats"]);

//             queryClient.setQueryData<Chat[]>(["chats"], (old = []) =>
//                 old.map((chat) => (chat.id === id ? { ...chat, title } : chat))
//             );

//             return { previous };
//         },
//         onError: (_, __, context) => {
//             if (context?.previous) {
//                 queryClient.setQueryData(["chats"], context.previous);
//             }
//         },
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ["chats"] });
//         },
//     });
// };

// // POST user message to /chat/[id]/messages
// export const usePostMessage = (chatId?: string) => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (content: string) => {
//             return api.post(`chat/${chatId}/messages`, {
//                 json: { content },
//             }).json();
//         },
//         onMutate: async (content) => {
//             await queryClient.cancelQueries({ queryKey: ["messages", chatId] });

//             const previous = queryClient.getQueryData<Message[]>(["messages", chatId]);

//             queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) => [
//                 ...old,
//                 {
//                     id: crypto.randomUUID(),
//                     content,
//                     role: "user",
//                     createdAt: new Date().toISOString(),
//                 },
//             ]);

//             return { previous };
//         },
//         onError: (_, __, context) => {
//             if (context?.previous) {
//                 queryClient.setQueryData(["messages", chatId], context.previous);
//             }
//         },
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
//         },
//     });
// };

// // GET all messages for a chat
// export const useChatMessages = (chatId?: string) => {
//     return useQuery<Message[]>({
//         queryKey: ["messages", chatId],
//         queryFn: async () => {
//             if (!chatId) return [];
//             return api.get(`chat/${chatId}/messages`).json();
//         },
//         enabled: !!chatId,
//     });
// };


// type ChatSession = {
//     id: string;
//     createdAt: string;
//     messages: Message[];
//   };
  
//   export const useChatSession = (chatId?: string) => {
//     return useQuery<ChatSession>({
//       queryKey: ["chatSession", chatId],
//       queryFn: async () => {
//         if (!chatId) throw new Error("Chat ID is required");
//         return api.get(`chatsession/${chatId}`).json();
//       },
//       enabled: !!chatId,
//     });
//   };