const serverMenuDrawerOpen = ref(true);

export const useLeftDrawer = () => {
  const chatMenuDrawerOpen = ref(true);

  function open(type?: "server" | "chat") {
    if (chatMenuDrawerOpen.value || type === "server") {
      serverMenuDrawerOpen.value = true;
    } else {
      chatMenuDrawerOpen.value = true;
    }
  }

  function close() {
    chatMenuDrawerOpen.value = false;
    serverMenuDrawerOpen.value = false;
  }

  return {
    serverMenuDrawerOpen,
    chatMenuDrawerOpen,
    open,
    close,
  };
};
