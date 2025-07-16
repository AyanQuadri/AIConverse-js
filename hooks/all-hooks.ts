import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// 🔵 TYPES
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

// 🔵 HOOK: Fetch a single chat
export function useChat(chatId: string) {
  return useQuery<Chat>({
    queryKey: ['chat', chatId],
    queryFn: () => api.get(`chat/${chatId}`).json<Chat>(),
    enabled: !!chatId,
  });
}

// 🔵 HOOK: Create new chat
export function useCreateChat() {
  return useMutation<Chat>({
    mutationFn: () => api.post('chat').json<Chat>(),
  });
}

// 🔵 HOOK: Send message with optimistic update
export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation<Chat, unknown, string, { previous?: Chat }>({
    mutationFn: (prompt: string) =>
      api.post(`chat/${chatId}/message`, {
        json: { prompt },
      }).json<Chat>(),

    onMutate: async (prompt: string) => {
      await queryClient.cancelQueries({ queryKey: ['chat', chatId] });

      const previous = queryClient.getQueryData<Chat>(['chat', chatId]);

      queryClient.setQueryData<Chat>(['chat', chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: `temp-${Date.now()}`,
              role: 'user',
              content: prompt,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      return { previous };
    },

    onError: (_err, _newPrompt, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['chat', chatId], ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });
}
