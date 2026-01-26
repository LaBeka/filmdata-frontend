"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import { createReviewSchema, createReviewUpdateSchema } from "@/types/createReviewSchema";
import type { CreateReviewRequestDto } from "@/types/createReviewSchema";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
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
    const params = useSearchParams()
    const id = params.get("filmId")

    const form = useForm({
            resolver: zodResolver(createReviewUpdateSchema),
            defaultValues: {
                score: 0,
                text: "",
            }
    });

    async function onSubmit(values: CreateReviewRequestDto) {
            console.log("onSubmit:::: ", values)
            const updatedValues = {
                ...values,
                filmId: id
            };
            try {
                // Calls your @PostMapping("/api/user/create")
                await api.post(`/review/user/createReview`, updatedValues);
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
                } else if (error) {
                    // 3. Fallback for generic JS errors (like network failure)
                    //console.error("Network/Generic Error:", error.message);
                }
            }
        }

        return (
                /* 1. Entire Page Filling: w-full and p-4/p-8 */
                <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 bg-slate-50">

                    <FieldSet className="bg-white p-6 pt-18 rounded-xl shadow-sm border relative">
                        <FieldLegend className="absolute top-8 left-6 text-xl font-semibold">Create Review</FieldLegend>
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
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber)} // Forces it to a number
                                                            />
                                                            {/*<Input type="number"  {...field} />*/}
                                                        </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                    {/* Text */}
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