"use client";

import { useEffect, useState, useRef } from "react"
import api from "@/lib/api"
import {FilmResponseDto} from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link";


export default function UsersPage() {
    const [films, setFilms] = useState<FilmResponseDto[]>([])
    const [sfilms, setSearchFilms] = useState<FilmResponseDto[]>([])
    const [searchterm, setSearchterm] = useState();

    const inputRef = useRef(null);
    const bodyRef  = useRef(null);

    useEffect(() => {
        const searchterm = inputRef?.current.value ?? "";
        console.log("search for film:  " + searchterm);
        if(searchterm == ""){
            api.get("/test/films")
                .then(res => setFilms(res.data))
                .catch(err => {
                    const status = err.response?.status;
                    const message = err.response?.message;
                    console.error("Access Denied with message: ", message, " and status: ", status);
                })
            }
        else {
            api.get("/api/film/search/"+searchterm)
                .then(res => setFilms(res.data))
                .catch(err => {
                    const status = err.response?.status;
                    const message = err.response?.message;
                    console.error("Access Denied with message: ", message, " and status: ", status);
                })
            }
    }, [searchterm])


    function handleClick(){
    console.log("inputRef: " +  inputRef.current.value);
        setSearchterm(inputRef.current.value);
    }




    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Film Directory</h1>
            <input type="text" ref={inputRef} placeholder="Search film"/>
            <button onClick={ handleClick }>
                Search
            </button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Cast</TableHead>
                        <TableHead>Age restriction</TableHead>
                        <TableHead>Awards</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Aspect ratio</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Camera</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody ref={bodyRef}>
                    {films.map((film) => (
                        <TableRow key={film.id}>
                            <TableCell>{film.title}</TableCell>
                            <TableCell>{film.genre}</TableCell>
                            <TableCell>{film.casta}</TableCell>
                            <TableCell>{film.ageRestriction}</TableCell>
                            <TableCell>{film.awards}</TableCell>
                            <TableCell>{film.langusges}</TableCell>
                            <TableCell>{film.aspectRatio}</TableCell>
                            <TableCell>{film.colorStatus}</TableCell>
                            <TableCell>{film.cameraUsed}</TableCell>
                            <TableCell>
                                {/* Use ?filmId=ID so the reviews page knows which films to filter */}
                                <Link
                                    href={`/reviews?filmId=${film.id}`}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    View Reviews
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}