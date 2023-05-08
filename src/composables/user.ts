import { useStorage, type RemovableRef } from "@vueuse/core";

export interface IUser {
  name: string;
  avatar: string;
}

const userProfile = useStorage<IUser>("user-profile", {
  name: "",
  avatar: "",
});

export const useUserProfile = (): {
  userProfile: RemovableRef<IUser>;
} => {
  return {
    userProfile,
  };
};
