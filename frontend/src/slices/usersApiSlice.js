import { createApi } from '@reduxjs/toolkit/query/react';

const USERS_URL = '/api/users'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/googleLogin`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: `${USERS_URL}/create-task`,
        method: 'POST',
        body: taskData,
      }),
    }),
    getTasks: builder.query({
      query: ({ search = '', sort = 'recent' } = {}) => ({
        url: `${USERS_URL}/get-tasks`,
        method: 'GET',
        params: { search, sort },
      }),
    }),
    updateTask: builder.mutation({
      query: ({ id, taskData, status }) => ({
        url: `${USERS_URL}/update-task/${id}`,
        method: 'PUT',
        body: { taskData, status },
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/delete-task/${id}`,
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
