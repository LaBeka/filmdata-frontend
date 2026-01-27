import {z} from "zod";

export const createReviewSchema = z.object({
    filmId: z.number().min(0, "filmId must be positive"),
    score: z.string().min(1, "empty score not allowed"),
    text: z.string().min(1, "empty review not allowed"),
});

export type CreateReviewRequestDto = z.infer<typeof reviewSchema>;

export const createReviewUpdateSchema = createReviewSchema.omit({
    filmId: true
});