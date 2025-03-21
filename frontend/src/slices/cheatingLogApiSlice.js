import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const USERS_URL = '/api/users';

// Inject endpoints for the exam slice
export const cheatingLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get cheating logs for a specific exam
    getCheatingLogs: builder.query({
      query: (examId) => ({
        url: `${USERS_URL}/cheatingLogs/${examId}`,
        method: 'GET',
        credentials: 'include',
      }),
      transformResponse: (response) => {
        console.log('Cheating logs response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('Cheating logs error:', error);
        return error;
      },
    }),
    // Save a new cheating log entry for an exam
    saveCheatingLog: builder.mutation({
      query: (data) => {
        console.log('Sending cheating log data:', data);
        return {
          url: `${USERS_URL}/cheatingLogs`,
          method: 'POST',
          body: data,
          credentials: 'include',
        };
      },
      transformResponse: (response) => {
        console.log('Save cheating log response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('Save cheating log error:', error);
        return error;
      },
    }),
  }),
});

// Export the generated hooks for each endpoint
export const { useGetCheatingLogsQuery, useSaveCheatingLogMutation } = cheatingLogApiSlice;
