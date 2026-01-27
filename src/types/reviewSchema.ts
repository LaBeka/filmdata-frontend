import {z} from "zod";

export const reviewSchema = z.object({
    reviewIndex: z.number().min(0, "reviewIndex must be positive"),
    score: z.number().min(0, "Score cannot be negative").max(10, "Score cannot be over 10"),
    text: z.string().min(1, "empty review not allowed"),
});

// export type UpdateReviewRequestDto = z.infer<typeof reviewSchema>;

export const reviewUpdateSchema = z.object({
    score: z.number()
        .min(0, "Score cannot be negative")
        .max(10, "Score cannot be over 10"),
    text: z.string().min(1, "empty review not allowed"),
});
export type UpdateReviewRequestDto = z.infer<typeof reviewUpdateSchema>;