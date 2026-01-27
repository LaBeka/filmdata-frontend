import {z} from "zod";

export const reviewSchema = z.object({
    reviewIndex: z.number().min(0, "reviewIndex must be positive"),
    score: z.string().min(1, "empty score not allowed"),
    text: z.string().min(1, "empty review not allowed"),
});

export type UpdateReviewRequestDto = z.infer<typeof reviewSchema>;

export const reviewUpdateSchema = reviewSchema.omit({
    reviewIndex: true
});