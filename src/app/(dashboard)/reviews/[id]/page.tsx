"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import { ReviewResponseDto } from "@/types/types";
import { reviewSchema, reviewUpdateSchema } from "@/types/reviewSchema";
import type { UpdateReviewRequestDto } from "@/types/reviewSchema";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import api from "@/lib/api";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import {
    FieldDescription,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {AxiosError} from "axios";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

interface BackendErrorResponse {
    status: number;
    message: string;
}

export default function UpdateReviewPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id
    const [review, setReview] = useState<ReviewResponseDto>()

    const form = useForm({
            resolver: zodResolver(reviewUpdateSchema),
            defaultValues: {
                score: 0,
                text: "",
            }
    })

    useEffect(() => {
            api.get(`review/user/getSpecificReview/${id}`)
                .then(res => {
                    setReview(res.data);
                    form.reset({
                        score : res.data.score,
                        text : res.data.text
                    });
                })
                .catch(error => {
                    const axiosError = error as AxiosError<BackendErrorResponse>;
                    if (axiosError.response && axiosError.response.data) {
                        // Now TypeScript knows 'data' has 'message' and 'status'
                        console.error("Backend Status:", axiosError.response.data.status);
                        console.error("Backend Message:", axiosError.response.data.message);

                        alert(`Error: ${axiosError.response.data.message}`);
                    } else if (error instanceof Error) {
                        // 3. Fallback for generic JS errors (like network failure)
//                        console.error("Network/Generic Error:", error.message);
                    }
                })
        }, [id])

    async function onSubmit(values: reviewUpdateSchema) {
            console.log("onSubmit:::: ", values)
            const updatedValues = {
                ...values,
                reviewIndex: id
            };
            try {
                // Calls your @PostMapping("/api/user/create")
                await api.patch(`/review/user/updateReview`, updatedValues);
                router.back();

                // 2. Optional: Show a success message instead of redirecting
                //alert("Profile updated successfully!");
            } catch (error: unknown) {
                // 2. Check if this is an Axios Error
                const axiosError = error as AxiosError<BackendErrorResponse>;

                if (axiosError.response && axiosError.response.data) {
                    // Now TypeScript knows 'data' has 'message' and 'status'
                    console.error("Backend Status:", axiosError.response.data.status);
                    console.error("Backend Message:", axiosError.response.data.message);

                    alert(`Error: ${axiosError.response.data.message}`);
                } else if (error instanceof Error) {
                    // 3. Fallback for generic JS errors (like network failure)
                    //console.error("Network/Generic Error:", error.message);
                }
            }
        }

        return (
                /* 1. Entire Page Filling: w-full and p-4/p-8 */
                <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 bg-slate-50">

                    <FieldSet className="bg-white p-6 pt-18 rounded-xl shadow-sm border relative">
                        <FieldLegend className="absolute top-8 left-6 text-xl font-semibold">Current Data</FieldLegend>
                        <FieldDescription>Update Review: {"Text:       " + review?.text + "     " +
                            "Score:       " + review?.score}</FieldDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">

                                {/* 2 & 3. Grid Logic: 1 col on mobile/md, 2 cols on lg */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                                    {/* Score */}
                                        <FormField control={form.control} name="score" render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>Score</FieldLabel>
                                                    <FormControl>
                                                        <Input className="text-sm sm:text-base h-9 sm:h-10"
                                                            type="text"
                                                            placeholder="Enter a number from 1-10"
                                                            pattern="[0-9]|10"
                                                            {...field}
                                                            onSubmit={(e) =>
                                                            {isNaN(e.target.valueAsNumber) ? 0 : field.onSubmit(e.target.valueAsNumber)}}
                                                            />
                                                        {/*<Input type="number"  {...field} />*/}
                                                        </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    {/* text */}
                                        <FormField control={form.control} name="text" render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>Text</FieldLabel>
                                                    <FormControl>
                                                        {/* 4. Shrink on small screen: text-sm and h-9 */}
                                                        <Input className="text-sm sm:text-base h-9 sm:h-10" {...field} />
                                                    </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                       )} />
                                </div>

                                {/* Button section */}
                                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-10 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-full sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </FieldSet>
                </div>
            );
        }