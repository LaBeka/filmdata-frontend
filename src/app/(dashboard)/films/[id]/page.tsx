"use client";

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {FilmResponseDto} from "@/types/types";
import api from "@/lib/api";
import {toast} from "sonner";
import {router} from "next/client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"

export default function FilmDetailPage() {
    const params = useParams()
    const id = params.id;
    const [data, setData] = useState<FilmResponseDto>();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true); // Satisfy ESLint while ensuring hydration safety

        api.get(`/film/public/get/${id}`)
            .then((res) => setData(res.data))
            .catch((err) => {
                toast.error("Error", {
                    description: err.response?.data?.message || "Film not found"
                });
                router.push("/films");
            });
    }, [id, router]);

    if (!mounted || !data) return null; // Prevent crash during fetch

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                ← Back to Films
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-4xl font-bold">{data.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{data?.genre[0]?.name}</Badge>
                            <Badge variant="outline">Age: {data.ageRestriction}+</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">Cast</h3>
                            <p className="text-muted-foreground">{data.cast[0]?.name}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Awards</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.awards.map((award, i) => (
                                    <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-200">
                                        🏆 {award.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Technical Details Sidebar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Technical Specs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium">Languages</span>
                            <span className="text-sm">{data.languages[0]?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium">Aspect Ratio</span>
                            <span className="text-sm">{data.aspectRatio}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm font-medium">Color Status</span>
                            <span className="text-sm capitalize">{data.color}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Camera</span>
                            <span className="text-sm">{data.camera.manufacturer}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}