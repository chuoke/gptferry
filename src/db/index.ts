import type { IChat } from "@/composables/chats";
import type { IMessage } from "@/composables/messages";
import type { IServer } from "@/composables/servers";
import Dexie, { type Table } from "dexie";

export class Database extends Dexie {
  servers!: Table<IServer>;
  chats!: Table<IChat>;
  messages!: Table<IMessage>;

  constructor() {
    super("gptferry-db");

    this.version(2).stores({
      servers: "key, provider_key", // Primary key and indexed props
      chats: "key, server_key, provider_key",
      messages: "key, chat_key, server_key, created_at",
    });
  }
}
