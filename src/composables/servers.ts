import { type Ref } from "vue";
import type { RemovableRef } from "@vueuse/core";
import { useStorage } from "@vueuse/core";
import { nanoid } from "nanoid";
import { useChats } from "./chats";
import { useProviders, type IProvider } from "./providers";
import { useDB } from "@/composables/db";
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import _ from "lodash-es";

export interface IServer {
  key: string;
  name: string;
  avatar: string;
  provider_key: string;
  model: string;
  api_base_url?: string;
  api_key?: string;
  api_version?: string;
  max_tokens?: number;
  created_at: number;
  updated_at: number;
  provider?: IProvider;
}

const { providers, find: findProvider } = useProviders();

function defaultServer() {
  return {
    key: nanoid(),
    name: "ChatGPT",
    avatar: "/providers/chatgpt/logo.png",
    provider_key: "chatgpt",
    model: providers[0].models[0].value,
    api_base_url: "",
    api_key: "",
    api_version: "",
    max_tokens: 4096,
    created_at: Date.now() / 1000,
    updated_at: Date.now() / 1000,
  };
}

let servers: Ref<IServer[]> = ref<IServer[]>([]);
const activeServerKey = useStorage<string>("server_active_key", "");
const inited = ref(false);

export const useServers = (): {
  servers: globalThis.Ref<IServer[]>;
  activeServer: globalThis.ComputedRef<IServer | undefined>;
  activeServerKey: RemovableRef<string>;
  save: (server: Partial<IServer>) => Promise<IServer>;
  remove: (removedServer: IServer | string) => Promise<void>;
  find: (key: string) => IServer | undefined;
} => {
  const { db } = useDB();

  if (!inited.value) {
    console.log("init use servers");

    inited.value = true;

    servers = useObservable(
      liveQuery(() => {
        return db.servers.toArray((sers: IServer[]) => {
          console.log({ sers });

          if (!sers || !sers.length) {
            add(defaultServer());
            return [];
          }

          if (!activeServerKey.value && sers.length) {
            activeServerKey.value = sers[0].key;
          }

          sers.map((server: IServer) => {
            if (!server.provider) {
              server.provider = findProvider(server.provider_key);
            }

            return servers;
          });

          return sers;
        });
      }) as any,
      {
        initialValue: servers,
      }
    ) as Readonly<Ref<IServer[]>>;
  }

  const activeServer = computed(() => {
    return servers.value.find((server) => server.key === activeServerKey.value);
  });

  async function save(server: Partial<IServer>) {
    if (server.key) {
      return await update(server as IServer);
    }

    // 新增
    const newServer = await add(server);

    return newServer;
  }

  async function update(server: IServer) {
    const serverIndex = servers.value.findIndex(
      (item) => item.key === server.key
    );

    if (serverIndex < 0) {
      throw new Error("Server not found");
    }

    const newServer = {
      ...(server as IServer),
      updated_at: Date.now() / 1000,
    };

    await db.servers.update(server.key, {
      ..._.omit(newServer, "provider"),
    });

    return newServer;
  }

  async function add(server: Partial<IServer>) {
    const newServer = {
      ...server,
      key: nanoid(),
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
    } as IServer;

    const res = await db.servers.add(newServer);
    console.log({ "add res:": res });

    activeServerKey.value = newServer.key;

    return newServer;
  }

  async function remove(removedServer: IServer | string): Promise<void> {
    const deleteServer =
      typeof removedServer === "string"
        ? servers.value.find((server) => server.key === removedServer)
        : removedServer;

    if (!deleteServer) {
      return;
    }

    const { clear: clearChats } = useChats(deleteServer.key);
    await clearChats();

    await db.servers.delete(deleteServer.key);
  }

  function find(key: string): IServer | undefined {
    return servers.value.find((server) => server.key === key);
  }

  return {
    servers,
    activeServer,
    activeServerKey,
    save,
    remove,
    find,
  };
};
