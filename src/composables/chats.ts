import { useStorage, type RemovableRef } from "@vueuse/core";
import { useMessages } from "./messages";
import { nanoid } from "nanoid";

export interface IChat {
  key: string;
  name: string;
  server_key: string;
  model: string;
  system_prompt: string;
  avatar?: string;
  probability_mass: number; // 概率质量
  carried_message_count: number;
  used_at: number; // unix timestamp
  created_at: number; // unix timestamp
  updated_at: number; // unix timestamp
}
export type IChatNew = Pick<
  IChat,
  | "name"
  | "avatar"
  | "model"
  | "system_prompt"
  | "carried_message_count"
  | "probability_mass"
>;

export const useChats = (
  serverKey: string
): {
  chats: RemovableRef<IChat[]>;
  activeChatKey: RemovableRef<string>;
  add: (chat: IChatNew) => IChat;
  update: (chat: IChat) => IChat;
  remove: (key: string) => void;
  clear: () => void;
} => {
  const chats = useStorage<IChat[]>(`server_chats_${serverKey}`, []);
  const activeChatKey = useStorage<string>(
    `server_active_chat_key_${serverKey}`,
    chats.value.length ? chats.value[0].key : ""
  );

  const add = (chat: IChatNew): IChat => {
    const newChat = {
      key: nanoid(),
      name: chat.name,
      model: chat.model || "",
      server_key: serverKey,
      system_prompt: chat.system_prompt,
      avatar: chat.avatar || "",
      probability_mass: chat.probability_mass || 1,
      carried_message_count: chat.carried_message_count,
      used_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
      created_at: Date.now() / 1000,
    };
    chats.value.push(newChat);

    return newChat;
  };

  const update = (chat: IChat): IChat => {
    const index = chats.value.findIndex((item) => item.key === chat.key);
    if (0 > index) {
      throw new Error("对话不存在");
    }

    chats.value.splice(index, 1, { ...chat, updated_at: Date.now() / 1000 });

    return chat;
  };

  function remove(key: string) {
    const index = chats.value.findIndex((chat) => chat.key === key);
    if (index > -1) {
      const deletedChat = chats.value.splice(index, 1);

      const { clear: clearMessages } = useMessages(deletedChat[0]);
      clearMessages();
    }
  }

  function clear() {
    chats.value.forEach((chat) => {
      const { clear: clearMessages } = useMessages(chat);
      clearMessages();
    });

    chats.value = [];
  }

  return {
    chats,
    activeChatKey,
    add,
    update,
    remove,
    clear,
  };
};
