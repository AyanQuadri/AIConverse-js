// // hooks/use-chat-message.ts
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";

// export interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
// }

// export function useChatMessages() {
//   return useQuery<Message[]>({
//     queryKey: ["chatMessages"], // ✅ unified key
//     queryFn: async () => {
//       const response = await api.get("chat").json<Message[]>();
//       return response;
//     },
//   });
// }
