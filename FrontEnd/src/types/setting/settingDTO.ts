import { BaseEntity } from "../common/baseEntity";

export interface SettingDTO extends BaseEntity<string> {
    key: string;
    group: string;
    value: string;
    description?: string;
    settingLevel?: number;
};