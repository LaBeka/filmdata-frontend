"use client";

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { FilmReviewResponseDto } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import {AxiosError} from "axios";

export default function ReviewsPage() {
    const [data, setData] = useState<FilmReviewResponseDto[]>([]);
    const [mounted, setMounted] = useState<boolean>(false);
    const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | undefined>("");
    const router = useRouter();


    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true);
        const loggedInEmail = localStorage.getItem("email")?.replace(/"/g, "");
        setUserEmail(loggedInEmail);

        const rawRoles = localStorage.getItem("roles");
        const roles: string[] = rawRoles ? JSON.parse(rawRoles) : [];
        const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
        setIsLoggedInAdmin(isAdmin);

        const endpoint = isAdmin
            ? "/review/public/getAllReviews"
            : `/review/user/getByUser/${loggedInEmail}`;
        api.get(endpoint)
            .then(res => {
                setData(res.data);

            })
            .catch(err => {
                const status = err.response?.data?.status;
                const message = err.response?.data?.message || "Something went wrong";
                console.log("Access Denied with message: ", message, " and status: ", status);
                toast.error("Error", { description: message });
                router.push("/");
            });
    }, []);

    // Prevent the component from trying to map over 'undefined'
    if (!mounted || !data) {
        return (
            <div className="p-8 flex justify-center">
                <p className="animate-pulse">Fetching your reviews...</p>
            </div>
        );
    }

    function handleUpdate(filmId: number, index: number) {
        router.push(`/reviews/${index}`);
    }

    async function handleDelete(filmId: number, index: number) {
        try {
            // Replace with your actual backend delete endpoint user/deleteReview/{index}
            await api.delete(`/review/user/deleteReview/${index}`);

            toast.success("Review deleted successfully");

            // 3. Update local state to remove the item without a full refresh
            setData((prevData) =>
                prevData.map((film) => {
                    if (film.filmId === filmId) {
                        return {
                            ...film,
                            reviews: film.reviews.filter((r) => r.index !== index),
                        };
                    }
                    return film;
                })
            );
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string, status: number }>;
            const status = error.response?.data?.status;
            const message = error.response?.data?.message || "Something went wrong";
            console.log("Access Denied with message: ", message, " and status: ", status);
            toast.error("Delete failed", {
                description: message || "Could not delete review",
            });
        }
    }

    console.log("admin:  ", isLoggedInAdmin);
    console.log("data:  ", data);
    console.log("data.length: ", data.length === 0);
    console.log("data.every: ", data.every(film => film.reviews.length === 0));


    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">
                {isLoggedInAdmin ? "All Reviews (Admin View)" : "My Reviews"}
            </h1>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.flatMap((film) =>
                        film.reviews.map((review) => (
                            <TableRow key={`${film.filmId}-${review.index}`}>
                                {/*// THIS SHOULD BE FILM TITLE*/}
                                <TableCell>{review.index}</TableCell>
                                <TableCell>{review.userName}</TableCell>
                                <TableCell className="max-w-md truncate">{review.text}</TableCell>
                                <TableCell>{review.score}/10</TableCell>
                                <TableCell>{review.date}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                    {review.email === userEmail && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleUpdate(film.filmId, review.index)}
                                        >
                                            Update
                                        </Button>
                                    )}

                                    {(isLoggedInAdmin ) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <AlertDialog>
                                                    {/* TRIGGER: The Tooltip trigger is also the AlertDialog trigger */}
                                                    <TooltipTrigger asChild>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="default" size="sm">
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        <p>Permanently remove this review</p>
                                                    </TooltipContent>

                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <div className="flex justify-center pb-4">
                                                                <CircleAlertIcon className="h-12 w-12 text-red-500" />
                                                            </div>
                                                            <AlertDialogTitle>Delete Review #{review.index}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will remove the review by <strong>{review.userName}</strong>.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(film.filmId, review.index)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Single check for the entire dataset */}
            {data.length === 0 || data.every(film => film.reviews.length === 0) && (
                <p className="text-center py-10 text-gray-500">No reviews found.</p>
            )}
        </div>
    );
}