import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/users";
import { useUser } from "@clerk/clerk-react";

export const useUserRole = () => {
    const { isSignedIn } = useUser();

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: userApi.getCurrentUser,
        enabled: !!isSignedIn,
        retry: false,
    });
};
