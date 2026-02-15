import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionApi } from "../api/questions";
import toast from "react-hot-toast";

export const useQuestions = () => {
    return useQuery({
        queryKey: ["questions"],
        queryFn: questionApi.getQuestions,
    });
};

export const useQuestionById = (id) => {
    return useQuery({
        queryKey: ["question", id],
        queryFn: () => questionApi.getQuestionById(id),
        enabled: !!id,
    });
};

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: questionApi.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            toast.success("Question deleted successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete question");
        },
    });
};

