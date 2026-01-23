"use client";

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { FilmReviewResponseDto } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSearchParams } from "next/navigation";
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

function strCmp(a, b) {
    if (a.toString() < b.toString()) return -1;
    if (a.toString() > b.toString()) return 1;
    return 0;
}

function printUpdateButton(review){
    return(
        <a href={`/reviews/${review.index}`} className="accent-red-400 underline">Update</a>
    )
}

function setUpdateStatus(review){
    const email = localStorage.getItem("email");

    if(!strCmp(JSON.stringify(review.email), email)){
        return printUpdateButton(review);
    }
}

function printDeleteButton(review, role, router){
    return(
        <a onClick={() => deleteReview(review.index, role, router) } className="accent-red-400 underline">Delete</a>
    )
}

function setDeleteStatus(review, router){
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("roles");

    if(!strCmp(JSON.stringify(review.email), email) ||
    JSON.stringify(role).includes("ADMIN")){
        return printDeleteButton(review, role, router); }
}

function deleteReview(index, roles, router){
    if(JSON.stringify(localStorage.getItem("roles")).includes("ADMIN")){
            api.delete(`/review/admin/deleteReview/${index}`)
                .catch(err => {
                    console.log(err.response?.status);
                    const status = err.response?.status;
                    const message = err.response?.message;
                    console.error("Access Denied with message: ", message, " and status: ", status);
                });
            router.back();
            }
        else{
            api.delete(`/review/user/deleteReview/${index}`)
                            .catch(err => {
                                console.log(err.response?.status);
                                const status = err.response?.status;
                                const message = err.response?.message;
                                console.error("Access Denied with message: ", message, " and status: ", status);
                            });
            router.back();
        }

      return (
        <>
          <h1>Deleted</h1>
        </>
      );
}

function createReviewButton(router, idFilm){
    router.push(`/createReview?filmId=${idFilm}`)
}

export default function ReviewsPage() {
    const [filmId, reviews] = useState<FilmReviewResponseDto>()
    const params = useSearchParams()
    const id = params.get("filmId");
    const router = useRouter()

    useEffect(() => {
        api.get(`/review/public/getByFilm/${id}`)
            .then(res => reviews(res.data))
            .catch(err => {
                console.log(err.response?.status);
                const status = err.response?.status;
                const message = err.response?.message;
                console.error("Access Denied with message: ", message, " and status: ", status);
            })

    }, [])

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Review Directory</h1>
                <div style={{float: 'right'}}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => createReviewButton(router, id)}
                        className="w-full sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
                        >
                      Create Review
                    </Button>
                </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead>userName</TableHead>
                        <TableHead>text</TableHead>
                        <TableHead>date</TableHead>
                        <TableHead>score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filmId?.reviews?.map((review) =>
                        <TableRow key={review.index}>
                            <TableCell>{review.index}</TableCell>
                            <TableCell>{review.userName}</TableCell>
                            <TableCell>{review.text}</TableCell>
                            <TableCell>{review.date}</TableCell>
                            <TableCell>{review.score}</TableCell>
                            <TableCell>{setUpdateStatus(review)}</TableCell>
                            <TableCell>{setDeleteStatus(review, router)}</TableCell>
                        </TableRow>
                        )}
                </TableBody>
            </Table>
            <div className="flex flex-col sm:flex-row sm:justify-start gap-3 mt-10 border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
                    >
                    Back to films
                </Button>

            </div>
        </div>
)}