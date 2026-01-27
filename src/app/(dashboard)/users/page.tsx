"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserResponseDto } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {useRouter} from "next/navigation";
import { toast } from "sonner";

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const jwtEmail = localStorage.getItem("email")?.replace(/"/g, "");
        const rawRoles = localStorage.getItem("roles");
        const roles: string[] = rawRoles ? JSON.parse(rawRoles) : [];

        const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");

        if (isAdmin) {
            // Fetch the full list only if Admin
            api.get("/user/get/list")
                .then(res => setUsers(res.data))
                .catch(err => {
                    const status = err.response?.data?.status;
                    const message = err.response?.data?.message || "Something went wrong";
                    console.log("Access Denied with message: ", message, " and status: ", status);
                    toast.error("Access Denied", {
                        description: message, // This puts your Spring Boot message here
                    });
                });
        } else {
            api.get(`/user/get/email/${jwtEmail}`)
                .then(res => {
                    router.push(`/users/${res.data.id}`);
                })
                .catch(err => {
                    const status = err.response?.data?.status;
                    const message = err.response?.data?.message || "Something went wrong";
                    console.error("Access Denied with message: ", message, " and status: ", status);
                    toast.error("Access Denied", {
                        description: message,
                    });
                    router.push("/");
                });
        }
    }, [router])

    if (!mounted) return null;

    const rawRoles = typeof window !== "undefined" ? localStorage.getItem("roles") : null;
    const isAdmin = rawRoles ? JSON.parse(rawRoles).includes("ADMIN") : false;

    if (!isAdmin) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Redirecting to your profile...</h1>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">User Directory</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.userName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <a href={`/users/${user.id}`} className="accent-orange-500 underline">View</a>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}