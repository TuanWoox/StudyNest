import instance from '@/config/axiosConfig';
import { CreateTagDTO, Tag, UpdateTagDTO } from '@/types/note/notes';
import { ReturnResult } from '@/types/common/return-result';
import { PagedData } from '@/types/common/paged-data';
import { Page } from '@/types/common/page';
import { SettingDTO } from '@/types/setting/settingDTO';
import { CreateSettingDTO } from '@/types/setting/createSettingDTO';
import { UpdateSettingDTO } from '@/types/setting/updateSettingDTO';

const settingService = {
    getAllSetting: async (
        payload: Page<string>
    ): Promise<PagedData<SettingDTO, string>> => {
        const { data } = await instance.post<
            ReturnResult<PagedData<SettingDTO, string>>
        >("/Setting/GetPaging", payload);
        return data.result;
    },

    createSetting: async (payload: CreateSettingDTO): Promise<SettingDTO> => {
        const { data } = await instance.post<ReturnResult<SettingDTO>>("/Setting", payload);
        return data.result;
    },

    deleteSetting: async (settingId: string): Promise<boolean> => {
        const { data } = await instance.delete<ReturnResult<boolean>>(`/Setting?id=${settingId}`);
        return data.result;
    },

    updateSetting: async (payload: UpdateSettingDTO): Promise<SettingDTO> => {
        const { data } = await instance.put<ReturnResult<SettingDTO>>("/Setting", payload);
        return data.result;
    },

    deleteSettings: async (payload: Page<string>): Promise<number> => {
        const { data } = await instance.post<ReturnResult<number>>(`/Setting/DeleteSettings`, payload);
        return data.result;
    }
};

export default settingService;