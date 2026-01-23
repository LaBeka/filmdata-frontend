import {z} from "zod";

export const createReviewSchema = z.object({
    filmId: z.number().min(0, "filmId must be positive"),
    score: z.number().min(0, "Score cannot be negative").max(10, "Score cannot be over 10"),
    text: z.string().min(1, "empty review not allowed"),
});

export type CreateReviewRequestDto = z.infer<typeof reviewSchema>;

export const createReviewUpdateSchema = createReviewSchema.omit({
    filmId: true
});