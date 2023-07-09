import { useStorage } from "@vueuse/core";

export interface ISetting {
    [key: string]: any;
}

const settings: any = useStorage<ISetting>("settings", {});

export const useSettings = (): {
    settings: ISetting;
} => {
    return {
        settings,
    };
};
