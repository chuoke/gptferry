import { useMessages } from "./messages";
import { nanoid } from "nanoid";
import { useDB } from "@/composables/db";
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";

export interface IChat {
  key: string;
  name: string;
  avatar?: string;
  server_key: string;
  provider_key?: string;
  model: string;
  system_prompt: string;
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
  chats: Ref<IChat[]>;
  activeChatKey: ComputedRef<string>;
  add: (chat: IChatNew) => Promise<IChat>;
  update: (chat: IChat) => Promise<IChat>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  active: (chat: IChat) => Promise<void>;
} => {
  const { db } = useDB();

  const chats = useObservable(
    liveQuery(() => {
      return db.chats
        .where({ server_key: serverKey })
        .sortBy("created_at", (items: IChat[]) => {
          return items;
        });
    }) as any,
    {
      initialValue: [],
    }
  ) as Readonly<Ref<IChat[]>>;

  const activeChat = computed(() => {
    return chats.value.reduce(
      (actived, item) =>
        (actived = !actived || item.used_at > actived.used_at ? item : actived),
      null as unknown as IChat
    );
  });

  const activeChatKey = computed(() => {
    return activeChat.value ? activeChat.value.key : "";
  });

  const add = async (chat: IChatNew): Promise<IChat> => {
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

    await db.chats.add({ ...newChat });

    return newChat;
  };

  const update = async (chat: IChat): Promise<IChat> => {
    // const index = chats.value.findIndex((item) => item.key === chat.key);
    // if (0 > index) {
    //   throw new Error("对话不存在");
    // }

    chat.updated_at = Date.now() / 1000;

    await db.chats.update(chat.key, { ...chat });

    return chat;
  };

  async function remove(key: string) {
    const removeChat = chats.value.find((chat) => chat.key === key);
    if (!removeChat) {
      return;
    }

    await clearMessages(removeChat);

    await db.chats.delete(key);
  }

  async function clear() {
    chats.value.forEach(async (chat) => {
      await clearMessages(chat);
    });

    await db.chats.where({ server_key: serverKey }).delete();
  }

  async function clearMessages(chat: IChat) {
    const { clear: clearMessages } = useMessages(chat);
    await clearMessages();
  }

  async function active(chat: IChat) {
    chat.used_at = Date.now() / 1000;

    await update(chat);
  }

  return {
    chats,
    activeChatKey,
    add,
    update,
    remove,
    clear,
    active,
  };
};
