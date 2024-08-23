import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://task-manager-app-l2ru.onrender.com/api',
  credentials: 'include', 
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/users/auth',
        method: 'POST',
        body: data,
      }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: '/users/googleLogin',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/users/create-task',
        method: 'POST',
        body: taskData,
      }),
    }),
    getTasks: builder.query({
      query: ({ search = '', sort = 'recent' } = {}) => ({
        url: '/users/get-tasks',
        method: 'GET',
        params: { search, sort },
      }),
    }),
    updateTask: builder.mutation({
      query: ({ id, taskData, status }) => ({
        url: `/users/update-task/${id}`,
        method: 'PUT',
        body: { taskData, status },
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/users/delete-task/${id}`,
        method: 'DELETE',
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
} = apiSlice;
