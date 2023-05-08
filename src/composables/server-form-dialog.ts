import type { IServer } from "./servers";

const serverFormDialogOpen = ref(false);
const serverModel = ref<IServer | null>();

export const useServerFormDialog = () => {
  function open(server?: IServer | null) {
    serverModel.value = server;
    serverFormDialogOpen.value = true;
  }

  function close() {
    serverModel.value = null;
    serverFormDialogOpen.value = false;
  }

  return {
    serverFormDialogOpen,
    serverModel,
    open,
    close,
  };
};
