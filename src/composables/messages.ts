import type { IChat } from "@/composables/chats";
import { useDB } from "@/composables/db";
import { nanoid } from "nanoid";

export interface IMessage {
  key: string;
  content: string;
  chat_key: string;
  server_key: string;
  created_at: number; // unix timestamp
  updated_at: number;
  model: string;
  role: string;
  finished: boolean;
  favorited?: boolean;
  [key: string]: any;
}

const pageSize = 100;

export const useMessages = (
  chat: IChat
): {
  messages: IMessage[];
  add: (message: Partial<IMessage>) => Promise<IMessage>;
  finish: (message: IMessage) => Promise<IMessage>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  favorite: (message: IMessage) => Promise<IMessage>;
} => {
  const { db } = useDB();

  const messages = reactive<IMessage[]>([]);
  const lastTimestamp = computed(() => {
    return messages[messages.length - 1]?.created_at || Date.now() / 1000;
  });

  async function load(lastCur: number) {
    return await db.messages
      .where({ chat_key: chat.key })
      .and((item: IMessage) => item.created_at < lastCur)
      .limit(pageSize)
      .reverse()
      .sortBy("created_at", (items: IMessage[]) => {
        return items;
      });
  }

  async function loadMore() {
    const msgs = await load(lastTimestamp.value);
    console.log({ msgs });
    // messages.push(...msgs.reverse());
    messages.push(...msgs);
  }

  async function add(message: Partial<IMessage>) {
    const newMessage = {
      finished: false,
      key: nanoid(),
      chat_key: chat.key,
      server_key: chat.server_key,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
      ...message,
    } as IMessage;

    messages.unshift({ ...newMessage });

    if (newMessage.finished) {
      await db.messages.add({ ...newMessage });
    }

    return newMessage;
  }

  async function update(message: IMessage) {
    message.updated_at = Date.now() / 1000;

    await db.messages.update(message.key, { ...message });

    return message;
  }

  async function finish(message: IMessage) {
    message.finished = true;

    const exists = await db.messages.where({ key: message.key }).toArray();

    if (exists.length) {
      await update(message);
    } else {
      await db.messages.add({ ...message });
    }

    return message;
  }

  async function remove(key: string) {
    const index = messages.findIndex((message) => message.key === key);
    if (0 > index) {
      return;
    }

    messages.splice(index, 1);

    await db.messages.delete(key);
  }

  async function clear() {
    messages.splice(0);

    await db.messages.where({ chat_key: chat.key }).delete();
  }

  onMounted(async () => {
    await loadMore();
  });

  async function favorite(message: IMessage) {
    message.favorited = message.favorited ? false : true;
    return await update(message);
  }

  return {
    messages,
    add,
    finish,
    remove,
    clear,
    favorite,
  };
};
