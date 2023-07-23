import type { IChat } from "./chats";

const chatModel = ref<IChat | null>();
const chatFormDialogOpen = ref(false);

export const useChatFormDialog = () => {
  function open(chat: IChat | Partial<IChat>) {
    chatModel.value = chat as IChat;
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
