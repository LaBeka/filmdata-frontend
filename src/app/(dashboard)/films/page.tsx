"use client";

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {FilmResponseDto} from "@/types/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link";


export default function UsersPage() {
    const [films, setFilms] = useState<FilmResponseDto[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true); // Prevents hydration error

        api.get("/test/films")
            .then(res => setFilms(res.data))
            .catch(err => {
                const status = err.response?.status;
                const message = err.response?.message;
                console.error("Access Denied with message: ", message, " and status: ", status);
            })
    }, []);
    if (!mounted) return null; // Wait for client-side mounting

    return (
        <div className="p-8 overflow-x-auto">
            <h1 className="text-2xl font-bold mb-4">Film Directory</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Cast</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Awards</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Camera</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {films.map((film) => (
                        <TableRow key={film.id}>
                            <TableCell className="font-semibold">{film.title}</TableCell>
                            <TableCell>{film.genre?.map(g => g.name).join(", ")}</TableCell>
                            <TableCell>{film.cast?.map(a => a.name).join(", ")}</TableCell>
                            <TableCell>{film.ageRestriction}+</TableCell>
                            <TableCell>{film.awards?.length} Awards</TableCell>
                            <TableCell>{film.languages?.map(l => l.name).join(", ")}</TableCell>
                            <TableCell>{film.camera?.manufacturer} {film.camera.model}</TableCell>
                            <TableCell className="text-right space-x-4">
                                <Link href={`/films/${film.id}`} className="text-blue-600 hover:underline">
                                    Details
                                </Link>
                                <Link href={`/reviews?filmId=${film.id}`} className="text-purple-600 hover:underline">
                                    Reviews
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {films.length === 0 && <p className="text-center mt-4 text-gray-500">No films found.</p>}
        </div>
    );
}