import { EFeedBackStatus } from "@/utils/enums/EFeedBackStatus";

export interface UpdateFeedBackDTO {
    rating?: number;       // optional because you have a default value in C#
    category: string;
    description: string;
    status: EFeedBackStatus;
    rejectedReason?: string;
}
