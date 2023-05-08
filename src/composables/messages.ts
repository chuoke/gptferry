import { useStorage, type RemovableRef } from "@vueuse/core";
import type { IChat } from "./chats";

export interface IMessage {
  key: string;
  content: string;
  chat_key: string;
  server_key: string;
  created_at: number; // unix timestamp
  model: string;
  role: string;
  [key: string]: any;
}

export const useMessages = (
  chat: IChat
): {
  messages: RemovableRef<IMessage[]>;
  add: (message: IMessage) => void;
  remove: (key: string) => void;
  clear: () => void;
} => {
  const messages = useStorage<IMessage[]>(`chat_messages_${chat.key}`, []);

  function add(message: IMessage) {
    messages.value.push({ ...message });
  }

  function remove(key: string) {
    const index = messages.value.findIndex((message) => message.key === key);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  }

  function clear() {
    messages.value = [];
  }

  return {
    messages,
    add,
    remove,
    clear,
  };
};
