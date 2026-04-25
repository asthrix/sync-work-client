import api from '@/lib/api/client';
import { ApiResponse, Event, Poll, Recognition } from '@/types';

export const cultureService = {
  getEvents: async () => {
    const response = await api.get<ApiResponse<Event[]>>('/culture/events');
    return response.data;
  },

  createEvent: async (data: Partial<Event>) => {
    const response = await api.post<ApiResponse<Event>>('/culture/events', data);
    return response.data;
  },

  registerForEvent: async (eventId: string) => {
    const response = await api.post<ApiResponse<void>>(`/culture/events/${eventId}/register`);
    return response.data;
  },

  getPolls: async () => {
    const response = await api.get<ApiResponse<Poll[]>>('/culture/polls');
    return response.data;
  },

  createPoll: async (data: Partial<Poll>) => {
    const response = await api.post<ApiResponse<Poll>>('/culture/polls', data);
    return response.data;
  },

  voteInPoll: async (pollId: string, optionId: string) => {
    const response = await api.post<ApiResponse<void>>(`/culture/polls/${pollId}/vote`, { option_id: optionId });
    return response.data;
  },

  getRecognitions: async () => {
    const response = await api.get<ApiResponse<Recognition[]>>('/culture/recognitions');
    return response.data;
  },

  createRecognition: async (data: Partial<Recognition>) => {
    const response = await api.post<ApiResponse<Recognition>>('/culture/recognitions', data);
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get<ApiResponse<any[]>>('/culture/leaderboard');
    return response.data;
  },
};
