"use client";

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { FilmReviewResponseDto } from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function strCmp(a, b) {
    if (a.toString() < b.toString()) return -1;
    if (a.toString() > b.toString()) return 1;
    return 0;
}

function printUpdateButton(review){
    return(
        <a href={`/reviews/${review.id}`} className="accent-red-400 underline">Update</a>
    )
}

function setUpdateStatus(review){
    const email = localStorage.getItem("email");

    if(!strCmp(JSON.stringify(review.email), email)){
        return printUpdateButton(review);
    }
}

function printDeleteButton(review, role){
    return(
        <a onClick={() => deleteReview(review.index, role) } className="accent-red-400 underline">Delete</a>
    )
}

function setDeleteStatus(review){
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("roles");

    if(!strCmp(JSON.stringify(review.email), email) ||
    JSON.stringify(role).includes("ADMIN")){
        return printDeleteButton(review, role); }
}

function deleteReview(index, roles){
    if(JSON.stringify(localStorage.getItem("roles")).includes("ADMIN")){
            api.delete(`/review/admin/deleteReview/${index}`)
                .then((response) => {
                    toast.success("Success", {
                        description: "Deleted review",
                    });
                })
                .catch(err => {
                    console.log(err.response?.status);
                    const status = err.response?.data?.status;
                    const message = err.response?.data?.message;
                    console.error("Access Denied with message: ", message, " and status: ", status);
                    toast.error("Failed operation", {
                        description: message, // This puts your Spring Boot message here
                    });
                });
            }
        else{
            api.delete(`/review/user/deleteReview/${index}`)
                            .catch(err => {
                                console.log(err.response?.status);
                                const status = err.response?.status;
                                const message = err.response?.message;
                                console.error("Access Denied with message: ", message, " and status: ", status);
                                toast.error("Failed operation", {
                                    description: message, // This puts your Spring Boot message here
                                });
                            });
        }

      return (
        <>
          <h1>Deleted</h1>
        </>
      );
}

function createReviewButton(){
    toast.success("Success", {
        description: "Button create clicked",
    });
}

export default function ReviewsPage() {
    const [filmId, reviews] = useState<FilmReviewResponseDto>()
    const params = useSearchParams()
    const id = params.get("filmId");

    useEffect(() => {
        api.get(`/review/public/getByFilm/${id}`)
            .then(res => reviews(res.data))
            // .then(res => console.log(res.))
            .catch(err => {
                console.log(err.response?.data?.status);
                const status = err.response?.data?.status;
                const message = err.response?.data?.message;
                console.error("Access Denied with message: ", message, " and status: ", status);
                toast.error("Failed operation", {
                    description: message,
                });
            })

    }, [])

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Review Directory</h1>
                <div style={{float: 'right'}}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => createReviewButton()}
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
                            <TableCell>{setDeleteStatus(review)}</TableCell>
                        </TableRow>
                        )}
                </TableBody>
            </Table>
        </div>
)}