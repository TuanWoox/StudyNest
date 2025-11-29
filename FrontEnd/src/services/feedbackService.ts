import instance from "@/config/axiosConfig";
import { Page } from "@/types/common/page";
import { PagedData } from "@/types/common/paged-data";
import { ReturnResult } from "@/types/common/return-result";
import { CreateFeedBackDTO } from "@/types/feedback/createFeedBackDTO";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import { SelectFeedBackDTO } from "@/types/feedback/selectFeedBackDTO";
import { UpdateFeedBackDTO } from "@/types/feedback/updateFeedBackDTO";

const feedbackService = {
    getAllFeedBack: async (
        payload: Page<string>
    ): Promise<PagedData<SelectFeedBackDTO, string>> => {
        const { data } = await instance.post<
            ReturnResult<PagedData<SelectFeedBackDTO, string>>
        >("/FeedBack/GetPaging", payload);
        return data.result;
    },
    createFeedBack: async (payload: CreateFeedBackDTO): Promise<FeedBackDTO> => {
        const { data } = await instance.post<ReturnResult<FeedBackDTO>>("/FeedBack", payload);
        return data.result;
    },
    updateFeedBack: async (payload: UpdateFeedBackDTO): Promise<FeedBackDTO> => {
        const { data } = await instance.put<ReturnResult<FeedBackDTO>>(`/FeedBack`, payload)
        return data.result;
    },
    deleteFeedBack: async (settingId: string): Promise<boolean> => {
        const { data } = await instance.delete<ReturnResult<boolean>>(`/FeedBack/${settingId}`);
        return data.result;
    },
    deleteFeedBacks: async (payload: Page<string>): Promise<number> => {
        const { data } = await instance.post<ReturnResult<number>>(`/FeedBack/DeleteFeedBacks`, payload);
        return data.result;
    }
}


export default feedbackService;