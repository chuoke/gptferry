export default {
  common: {
    fullscreen: "Full Screen",
    exit_fullscreen: "Exit Full Screen",
    cancel: "Cancel",
    save: "Save",
    confirm_action: "Confirm Action",
  },
  server: {
    new: "New Server",
    edit: "Edit Server",
    delete: "Delete",
    delete_confirm:
      "Are you sure you want to delete this server? All chat and it's messages will be deleted and cannot be recovered.",
    name: "Name",
    model: "Model",
    setting: "Setting",
    api_key_empty_notice: "Please fill in a API Key",
    api_base_url: "API Base URL",
    api_base_url_hint: "If you modify it, you know why",
  },
  chat: {
    new: "New Chat",
    edit: "Edit Chat",
    delete: "Delete",
    delete_confirm:
      "Are you sure you want to delete this chat? All chat messages will be deleted and cannot be recovered.",
    clear_all: "Clear chats",
    clear_all_confirm:
      "Are you sure you want to clear all chats? All chats and it's messages will be cleared and cannot be recovered.",
    name: "Name",
    name_fill_empty: "Unnamed chat",
    name_hint: "Give it a name",
    system_prompt: "System prompt",
    system_prompt_hint:
      "Set the system prompt word, used to set the role, can better get the answer",
    system_prompt_default:
      "As a personal assistant to solve the problems raised",
    carried_message_count: "Number of historical messages carried",
    carried_message_count_hint: "It should not be too large. The default is 10",
    probability_mass: "Probability Mass",
    probability_mass_hint:
      "0~1, the larger the value, the more random the result",
    model: "Model",
    model_hint: "If this is not selected, the server model is used",
    max_tokens: "Max tokens",
    max_tokens_hint:
      "The maximum number of tokens to generate in this chat completion.",
  },
  message: {
    clear: "Clear messages",
    clear_confirm:
      "Sure you want to clear your chat history? It cannot be restored after being cleared.",
    copy: "Copy",
    copy_success: "Content copied",
    cipy_failed: "Content copy failure",
    favorite: "Like",
    unfavorite: "Unlike",
    delete: "Delete",
    delete_confirm: "Are you sure you want to delete this record?",
    view_empty_msg:
      "Create server and chating, start getting inspiration and help from AI",
  },
  message_input: {
    kbd_send: "Send",
    kbd_newline: "Newline",
  },
  setting: {
    profile: "Profile",
    about: "About",
    language: "Language",
    general: "General",
  },
  profile: {
    name_hint: "Give yourself a name",
  },
};
