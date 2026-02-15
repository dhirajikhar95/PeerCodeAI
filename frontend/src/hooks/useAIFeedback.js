import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

// Fetch AI feedback for a specific session
export function useAIFeedback(sessionId) {
    return useQuery({
        queryKey: ["ai-feedback", sessionId],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/ai-feedback/session/${sessionId}`);
                return response.data;
            } catch (error) {
                // Handle 202 as "still processing" - throw special error to trigger refetch
                if (error.response?.status === 202) {
                    const data = error.response.data;
                    // Return a special "processing" object that components can check
                    return {
                        status: data.status || "processing",
                        message: data.message || "AI is analyzing your code...",
                        isProcessing: true,
                    };
                }
                throw error;
            }
        },
        enabled: !!sessionId,
        // Keep polling until we have actual AI content
        refetchInterval: (query) => {
            const data = query.state.data;
            // If still processing OR feedback lacks real content, keep polling
            if (!data || data?.isProcessing || data?.status === "processing" || data?.status === "pending") {
                return 3000;
            }
            // Even if we got a response, check if it has actual AI content
            if (!data?.logicFeedback && !data?.correctness && data?.feedbackType !== "no_student_code") {
                return 3000;
            }
            return false; // Stop polling once feedback has real data
        },
        retry: (failureCount, error) => {
            // Don't retry on 404 (not found) or 202 (processing)
            if (error.response?.status === 404 || error.response?.status === 202) {
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: 2000,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Fetch student's feedback history
export function useMyFeedbackHistory() {
    return useQuery({
        queryKey: ["my-feedback-history"],
        queryFn: async () => {
            const response = await axiosInstance.get("/ai-feedback/my-history");
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch student's skill summary
export function useMySkillSummary() {
    return useQuery({
        queryKey: ["my-skill-summary"],
        queryFn: async () => {
            const response = await axiosInstance.get("/ai-feedback/my-skills");
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
