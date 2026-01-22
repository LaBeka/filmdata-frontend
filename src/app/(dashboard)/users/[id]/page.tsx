"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import { userUpdateSchema, UserUpdateRequestDto, roleSchema } from "@/types/userSchema";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import api from "@/lib/api";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import {
    FieldDescription,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {UserResponseDto} from "@/types/types";
import { toast } from "sonner";
import {Checkbox} from "@/components/ui/checkbox";

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

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams()
    const id = params.id // Captures the '1' from /users/1
    const [user, setUser] = useState<UserResponseDto>();
    const [isLoggedInAdmin, setIsLoggedInAdmin] = useState(false);
    const [isSelf, setIsSelf] = useState(false);

    const form = useForm({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            userName: "",
            fullName: "",
            email: "",
            password: "",
            age: 0
        }
    });

    useEffect(() => {
        // 1. Get logged-in info from localStorage
        const loggedInEmail = localStorage.getItem("email")?.replace(/"/g, "");
        const rawRoles = localStorage.getItem("roles");
        const roles: string[] = rawRoles ? JSON.parse(rawRoles) : [];

        const adminStatus = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoggedInAdmin(adminStatus);

        api.get(`/user/get/id/${id}`)
            .then(res => {
                setUser(res.data);
                setIsSelf(res.data.email === loggedInEmail);
                form.reset({
                    userName: res.data.userName,
                    fullName: res.data.fullName,
                    email: res.data.email,
                    age: res.data.age,
                    password: ""
                });
                console.log("res.data.age: ", res.data.age);
            })
            .catch(err => {
                const status = err.response?.data?.status;
                const message = err.response?.data?.message || "Something went wrong";
                console.error("Access Denied with message: ", message, " and status: ", status);
                toast.error("Access Denied", {
                    description: message, // This puts your Spring Boot message here
                });
            })
    }, [id]);

    // 2. Initialize the Role Form
    const roleForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            roles: [],
        },
    });
    useEffect(() => {
        if (user) {
            roleForm.reset({
                roles: user.roles
            });
        }
    }, [user, roleForm]);

    console.log(user?.roles)
    useEffect(() => {
        if (!user) return;
        form.reset({
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            age: user.age,
            password: ""
        });
    }, [user, form]);

    // Permissions Logic
    // A user can only update info if it is THEIR OWN profile.
    const canUpdateInfo = isSelf;
    // console.log("canUpdateInfo::: ", canUpdateInfo);
    // Only an Admin can see/change the Permissions section.
    const canUpdateRoles = isLoggedInAdmin;
    // console.log("canUpdateRoles::: ", canUpdateRoles);


    async function onSubmit(values: UserUpdateRequestDto) {
        const userEmail = user?.email;
        const updatedValues = {
            ...values,
            email: userEmail
        };

        try {
            await api.put(`/user/update/${userEmail}`, updatedValues);
            router.refresh();
            toast.success("Success", {
                description: "User data updated",
            });
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string, status: number }>;
            const status = error.response?.data?.status;
            const message = error.response?.data?.message || "Something went wrong";
            console.error("Access Denied with message: ", message, " and status: ", status);
            toast.error("Access Denied", {
                description: message, // This puts your Spring Boot message here
            });
            if (user) {
                form.reset({
                    userName: user.userName, // Using the state variable 'user'
                    fullName: user.fullName,
                    email: user.email,
                    age: user.age,
                    password: ""
                });
            }
        }
    }

    // 3. New Submit Handler for Roles
    async function onSubmitUpdateRole(values: z.infer<typeof roleSchema>) {
        console.log("onSubmitUpdateRole::: ", values);
        try {
            await api.post(`/user/promoteUserToAdmin/${user?.email}`, values.roles);
            toast.error("Success", {
                description: "Roles updated",
            });
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string, status: number }>;
            const status = error.response?.data?.status;
            const message = error.response?.data?.message || "Something went wrong";
            console.error("Access Denied with message: ", message, " and status: ", status);
            toast.error("Access Denied", {
                description: message, // This puts your Spring Boot message here
            });
        }
    }

    async function deleteUser() {
        console.log("hiiit")
        try {
            await api.delete(`/user/${user?.email}`);
            toast.success(`User with email: '${user?.email}' deleted successfully`);
            router.push("/users"); // Redirect back to the list
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string, status: number }>;
            const status = error.response?.data?.status;
            const message = error.response?.data?.message || "Something went wrong";
            console.error("Access Denied with message: ", message, " and status: ", status);
            toast.error("Access Denied", {
                description: message, // This puts your Spring Boot message here
            });
        }
    }

    return (
        /* 1. Entire Page Filling: w-full and p-4/p-8 */
        <div className="w-full min-h-screen p-4 md:p-8 lg:p-12 bg-slate-50">

            {/* 1. First Form: Role Management */}
            <FieldSet className="bg-white p-6 pt-18 rounded-xl shadow-sm border relative">
                <FieldLegend className="absolute top-8 left-6 text-xl font-semibold">User Information</FieldLegend>
                <FieldDescription>Update account details for user ID: {user?.fullName}</FieldDescription>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">

                        {/* 2 & 3. Grid Logic: 1 col on mobile/md, 2 cols on lg */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                            {/* Username */}
                            <FormField control={form.control} name="userName" render={({ field }) => (
                                <FormItem>
                                    <FieldLabel>Username</FieldLabel>
                                    <FormControl>
                                        {/* 4. Shrink on small screen: text-sm and h-9 */}
                                        <Input disabled={!canUpdateInfo} className="text-sm sm:text-base h-9 sm:h-10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Full Name */}
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <FormControl>
                                        <Input disabled={!canUpdateInfo} className="text-sm sm:text-base h-9 sm:h-10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Email */}
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FieldLabel>Email</FieldLabel>
                                    <FormControl>
                                        <Input disabled type="email" className="text-sm sm:text-base h-9 sm:h-10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Age */}
                            <FormField control={form.control} name="age" render={({ field }) => (
                                <FormItem>
                                    <FieldLabel>Age</FieldLabel>
                                    <FormControl>
                                        <Input disabled={!canUpdateInfo} className="text-sm sm:text-base h-9 sm:h-10"
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)} // Forces it to a number
                                        />
                                        {/*<Input type="number"  {...field} />*/}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Button section */}
                        {canUpdateInfo && (
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
                        )}
                    </form>
                </Form>
            </FieldSet>

            {/* 3. Second Form: Role Management */}
            <FieldSet className="bg-white p-6 pt-18 rounded-xl shadow-sm border relative">
                <FieldLegend className="absolute top-8 left-6 text-xl font-semibold">Permissions</FieldLegend>
                <FieldDescription>Change the security authorities for: {user?.fullName}</FieldDescription>

                <Form {...roleForm}>
                    <form onSubmit={roleForm.handleSubmit(onSubmitUpdateRole)} className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* USER ROLE CHECKBOX */}
                            <FormField
                                control={roleForm.control}
                                name="roles"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes("USER")}
                                                disabled={!isLoggedInAdmin}
                                                onCheckedChange={(checked) => {
                                                    const currentRoles = Array.isArray(field.value) ? field.value : [];
                                                    return checked
                                                        ? field.onChange([...currentRoles, "USER"])
                                                        : field.onChange(currentRoles.filter((value: string) => value !== "USER"))
                                                }}
                                            />
                                        </FormControl>
                                        <FieldLabel className="font-medium cursor-pointer">User</FieldLabel>
                                    </FormItem>
                                )}
                            />

                            {/* ADMIN ROLE CHECKBOX */}
                            <FormField
                                control={roleForm.control}
                                name="roles"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg border-blue-200">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes("ADMIN")}
                                                disabled={!isLoggedInAdmin}
                                                onCheckedChange={(checked) => {
                                                    const currentRoles = Array.isArray(field.value) ? field.value : [];
                                                    return checked
                                                        ? field.onChange([...currentRoles, "ADMIN"])
                                                        : field.onChange(currentRoles.filter((value) => value !== "ADMIN"))
                                                }}
                                            />
                                        </FormControl>
                                        <FieldLabel className="font-medium text-blue-700 cursor-pointer">Administrator</FieldLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {isLoggedInAdmin && (
                            <div className="flex justify-end mt-6">
                                <Button type="submit" className="w-full sm:w-auto">
                                    Save Permissions
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </FieldSet>

            {/* 4. Second Form: DELETE SECTION - Admin Only */}
            {isLoggedInAdmin && !isSelf && (
                <FieldSet className="bg-red-50 p-6 pt-18 rounded-xl border border-red-200 relative">
                    <FieldLegend className="absolute top-8 left-6 text-red-700 font-semibold">Danger Zone</FieldLegend>
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-red-600">
                            Once you delete this user, there is no going back. Please be certain.
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full sm:w-auto">
                                    Delete User
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    {/* Visual icon for the warning */}
                                    <div className="flex justify-center pb-4">
                                        <CircleAlertIcon className="h-12 w-12 text-red-500" />
                                    </div>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        account for <strong>{user?.userName}</strong> and all associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    {/* Action button triggers the delete function */}
                                    <AlertDialogAction
                                        onClick={deleteUser}
                                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                    >
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </FieldSet>
            )}
        </div>
    );
}