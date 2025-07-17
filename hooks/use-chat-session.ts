// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/api";

// type ChatSession = {
//   id: string;
//   title?: string;
//   createdAt: string;
//   updatedAt: string;
// };

// type ChatMessage = {
//   id: string;
//   sessionId: string;
//   role: string;
//   content: string;
//   createdAt: string;
// };

// export function useChatSessions() {
//   const queryClient = useQueryClient();

//   const { data, isLoading, isError } = useQuery<ChatSession[]>({
//     queryKey: ["chatSessions"],
//     queryFn: () => api.get("chatsession").json(),
//   });

//   const mutation = useMutation({
//     mutationFn: (title?: string) =>
//       api.post("chatsession", { json: { title } }).json<ChatSession>(),

//     onMutate: async (newTitle?: string) => {
//       await queryClient.cancelQueries({ queryKey: ["chatSessions"] });

//       const previousSessions = queryClient.getQueryData<ChatSession[]>(["chatSessions"]);

//       const optimisticSession: ChatSession = {
//         id: crypto.randomUUID(),
//         title: newTitle || "Untitled",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       queryClient.setQueryData<ChatSession[]>(["chatSessions"], (old = []) => [
//         ...old,
//         optimisticSession,
//       ]);

//       return { previousSessions };
//     },

//     onError: (_err, _title, context) => {
//       if (context?.previousSessions) {
//         queryClient.setQueryData(["chatSessions"], context.previousSessions);
//       }
//     },

//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
//     },
//   });

//   return {
//     data,
//     isLoading,
//     isError,
//     createSession: mutation.mutate,
//     isCreating: mutation.isPending,
//   };
// }

// export function useChatMessages(sessionId: string) {
//   const queryClient = useQueryClient();

//   const {
//     data,
//     isLoading,
//     isError,
//     isPending,
//   } = useQuery<ChatMessage[]>({
//     queryKey: ["messages", sessionId],
//     queryFn: () => api.get(`chatsession/${sessionId}/messages`).json(),
//     enabled: !!sessionId,
//   });

//   const mutation = useMutation({
//     mutationFn: (msg: { role: string; content: string }) =>
//       api
//         .post(`chatsession/${sessionId}/messages`, {
//           json: msg,
//         })
//         .json<ChatMessage>(),

//     onMutate: async (newMsg) => {
//       await queryClient.cancelQueries({ queryKey: ["messages", sessionId] });

//       const previous = queryClient.getQueryData<ChatMessage[]>(["messages", sessionId]);

//       const optimisticMsg: ChatMessage = {
//         id: crypto.randomUUID(),
//         sessionId,
//         role: newMsg.role,
//         content: newMsg.content,
//         createdAt: new Date().toISOString(),
//       };

//       queryClient.setQueryData<ChatMessage[]>(["messages", sessionId], (old = []) => [
//         ...old,
//         optimisticMsg,
//       ]);

//       return { previous };
//     },

//     onError: (_err, _msg, context) => {
//       if (context?.previous) {
//         queryClient.setQueryData(["messages", sessionId], context.previous);
//       }
//     },

//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
//     },
//   });

//   return {
//     data,
//     isLoading,
//     isError,
//     isPending,
//     sendMessage: mutation.mutate,
//   };
// }
