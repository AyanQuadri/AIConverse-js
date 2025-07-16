import { useMutation,useQueryClient } from "@tanstack/react-query";
import { Message } from "./use-chat-message";
import { api } from "@/lib/api";


function usePostMessage(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (prompt: string): Promise<Message[]> => {
          return await api.post("chat", { json: { prompt } }).json<Message[]>();
        },
    
        onMutate: async (prompt: string) => {
          await queryClient.cancelQueries({ queryKey: ["chatMessages"] });
          const previousMessages = queryClient.getQueryData<Message[]>([
            "chatMessages",
          ]);
          const optimisticMessage: Message = {
            id: String(Date.now()),
            role: "user",
            content: prompt,
          };
          queryClient.setQueryData<Message[]>(["chatMessages"], (old = []) => [
            ...old,
            optimisticMessage,
          ]);
          return { previousMessages };
        },
        onError: (_err, _vars, context) => {
          if (context?.previousMessages) {
            queryClient.setQueryData(["chatMessages"], context.previousMessages);
          }
        },
        onSuccess: (data: Message[]) => {
          queryClient.setQueryData(["chatMessages"], (old: Message[] = []) => {
            const withoutOptimistic = old.filter(
              (msg) => msg.role !== "user" || msg.content !== data[0].content
            );
            return [...withoutOptimistic, ...data];
          });
        },
      });
}

export {usePostMessage}