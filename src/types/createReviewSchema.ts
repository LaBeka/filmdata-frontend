import {z} from "zod";

export const createReviewSchema = z.object({
    filmId: z.number().min(0, "filmId must be positive"),
    score: z.string()
    .regex(/^-?\d+$/, "The input must be a number")
      .refine((val) => {
        const num = parseInt(val, 10)
        return num >= 0 && num <= 10
      }, { message: "Must be an integer between 0 and 10" }),
    text: z.string().min(1, "empty review not allowed"),
});

export type CreateReviewRequestDto = z.infer<typeof reviewSchema>;

export const createReviewUpdateSchema = createReviewSchema.omit({
    filmId: true
});