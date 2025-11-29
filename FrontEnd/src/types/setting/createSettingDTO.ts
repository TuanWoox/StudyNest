export interface CreateSettingDTO {
    id?: string;
    key: string;
    group: string;
    value: string;
    description?: string;
    settingLevel?: number;
};