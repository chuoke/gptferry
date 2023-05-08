import type { RemovableRef } from "@vueuse/core";
import { useStorage } from "@vueuse/core";
import { nanoid } from "nanoid";
import { useChats } from "./chats";
import { useProviders, type IProvider } from "./providers";

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

const servers = useStorage<IServer[]>("servers", [
  {
    key: nanoid(),
    name: "ChatGPT",
    avatar: "https://avatars.githubusercontent.com/u/14957082?s=200&v=4",
    provider_key: "chatgpt",
    model: providers[0].models[0].value,
    api_base_url: "https://api.openai.com",
    api_key: "",
    api_version: "v1",
    max_tokens: 4096,
    created_at: Date.now() / 1000,
    updated_at: Date.now() / 1000,
  },
]);
const activeServerKey = useStorage<string>(
  "current_provider_key",
  servers.value.length ? servers.value[0].key : ""
);

export const useServers = (): {
  servers: globalThis.Ref<IServer[]>;
  activeServer: globalThis.ComputedRef<IServer | undefined>;
  activeServerKey: RemovableRef<string>;
  save: (server: Partial<IServer>) => IServer;
  remove: (removedServer: IServer | string) => void;
  find: (key: string) => IServer | undefined;
} => {
  const activeServer = computed(() => {
    return servers.value.find((server) => server.key === activeServerKey.value);
  });

  function save(server: Partial<IServer>) {
    if (server.key) {
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
      servers.value.splice(serverIndex, 1, newServer);

      return newServer;
    }

    // 新增
    const newServer = {
      ...server,
      key: nanoid(),
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
    } as IServer;
    servers.value.push({ ...newServer });

    activeServerKey.value = newServer.key;

    return newServer;
  }

  function remove(removedServer: IServer | string) {
    const serverKey =
      typeof removedServer === "string" ? removedServer : removedServer.key;
    const index = servers.value.findIndex((server) => server.key === serverKey);
    if (0 > index) {
      return;
    }

    const server = servers.value.splice(index, 1)[0];
    activeServerKey.value = servers.value[0]?.key || "";
    const { clear: clearChats } = useChats(server.key);
    clearChats();
  }

  function find(key: string): IServer | undefined {
    return servers.value.find((server) => server.key === key);
  }

  servers.value = servers.value.map((server) => {
    server.provider = findProvider(server.provider_key);
    return server;
  });

  return {
    servers,
    activeServer,
    activeServerKey,
    save,
    remove,
    find,
  };
};
