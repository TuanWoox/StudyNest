export interface CreateFeedBackDTO {
    rating?: number;       // optional because you have a default value in C#
    category: string;
    description: string;
}
