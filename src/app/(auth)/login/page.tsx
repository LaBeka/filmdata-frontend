"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import {toast} from "sonner";

// const USER_PATH = "/api/user";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3),
});

export default function LoginPage() {
    const router = useRouter();
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: "", password: "" },
    });

    interface BackendErrorResponse {
        status: number;
        message: string;
    }

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        try {
            // Backend expects @RequestParam, so we use 'params' in axios
            const response = await api.post(`/user/login`, null, {
                params: {
                    email: values.email,
                    password: values.password,
                },
            });

            // Assuming backend returns a plain JWT string
            if (response.data) {
                localStorage.setItem("token", response.data);
                const base64Url = response.data.split('.')[1]; // Get the payload part
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decoded = JSON.parse(jsonPayload);
                localStorage.setItem("email", JSON.stringify(decoded.sub));
                localStorage.setItem("roles", JSON.stringify(decoded.roles));
                window.dispatchEvent(new Event("storage"));
                router.push("/");
            }
        } catch (err: unknown) {
            const error = err as AxiosError<BackendErrorResponse>;

            const status = error.response?.data?.status;
            const message = error.response?.data?.message || "Something went wrong";
            console.log("Access Denied with message: ", message, " and status: ", status);
            toast.error("Access Denied", {
                description: message,
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-96 p-8 border rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Sign In</Button>
                </form>
            </Form>
        </div>
    );
}