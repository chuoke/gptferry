import { useProviders } from "@/composables/providers";

export const useProviderStore = defineStore("provider", {
  state: () => ({
    provider: "chatgpt",
  }),
  getters: {
    current: (state) => {
      const { providers } = useProviders();

      return (
        providers.value.find((item) => item.key === state.provider) ||
        providers.value[0]
      );
    },
  },
  actions: {
    set(val: string) {
      this.provider = val;
    },
  },
});
