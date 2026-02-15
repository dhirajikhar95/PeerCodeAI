import axiosInstance from "../lib/axios";

export const questionApi = {
    getQuestions: async () => {
        const response = await axiosInstance.get("/questions");
        return response.data;
    },
    getQuestionById: async (id) => {
        const response = await axiosInstance.get(`/questions/${id}`);
        return response.data;
    },
    createQuestion: async (data) => {
        const response = await axiosInstance.post("/questions", data);
        return response.data;
    },
    updateQuestion: async (id, data) => {
        const response = await axiosInstance.put(`/questions/${id}`, data);
        return response.data;
    },
    deleteQuestion: async (id) => {
        const response = await axiosInstance.delete(`/questions/${id}`);
        return response.data;
    },
};

