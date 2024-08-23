import { apiSlice } from "./apiSlice.js";

const USERS_URL = "https://task-manager-app-l2ru.onrender.com/api/users";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
         credentials: "include"
      }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/googleLogin`,
        method: "POST",
        body: data,
         credentials: "include"
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
         credentials: "include"
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
         credentials: "include"
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
         credentials: "include"
      }),
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: `${USERS_URL}/create-task`,
        method: "POST",
        body: taskData,
         credentials: "include"
      }),
    }),
    getTasks: builder.query({
      query: ({ search = "", sort = "recent" } = {}) => ({
        url: `${USERS_URL}/get-tasks`,
        method: "GET",
        params: { search, sort },
         credentials: "include"
      }),
    }),

    updateTask: builder.mutation({
      query: ({ id, taskData, status }) => ({
        url: `${USERS_URL}/update-task/${id}`,
        method: "PUT",
        body: { taskData, status },
         credentials: "include"
      }),
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/delete-task/${id}`,
        method: "DELETE",
         credentials: "include"
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGoogleLoginMutation,
} = usersApiSlice;
