const settingDialogOpen = ref(false);
const activeSettingTab = ref<string>("");

export const useSettingDialog = () => {
  function open(tab?: string) {
    activeSettingTab.value = tab || "profile";
    settingDialogOpen.value = true;
  }

  function close() {
    settingDialogOpen.value = false;
  }

  return {
    settingDialogOpen,
    activeSettingTab,
    open,
    close,
  };
};
