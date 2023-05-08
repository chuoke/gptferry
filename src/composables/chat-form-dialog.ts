import type { IChat } from "./chats";

const chatFormDialogOpen = ref(false);
const chatModel = ref<IChat | null>();

export const useChatFormDialog = () => {
  function open(chat?: IChat | null) {
    chatModel.value = chat;
    chatFormDialogOpen.value = true;
  }

  function close() {
    chatModel.value = null;
    chatFormDialogOpen.value = false;
  }

  return {
    chatFormDialogOpen,
    chatModel,
    open,
    close,
  };
};
