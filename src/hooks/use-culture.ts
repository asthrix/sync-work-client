import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cultureService } from '@/services/culture';

export const cultureKeys = {
  events: ['culture', 'events'] as const,
  polls: ['culture', 'polls'] as const,
  recognitions: ['culture', 'recognitions'] as const,
  leaderboard: ['culture', 'leaderboard'] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: cultureKeys.events,
    queryFn: cultureService.getEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cultureService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultureKeys.events });
    },
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cultureService.registerForEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultureKeys.events });
    },
  });
}

export function usePolls() {
  return useQuery({
    queryKey: cultureKeys.polls,
    queryFn: cultureService.getPolls,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cultureService.createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultureKeys.polls });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) => 
      cultureService.voteInPoll(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultureKeys.polls });
    },
  });
}

export function useRecognitions() {
  return useQuery({
    queryKey: cultureKeys.recognitions,
    queryFn: cultureService.getRecognitions,
  });
}

export function useCreateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cultureService.createRecognition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultureKeys.recognitions });
      queryClient.invalidateQueries({ queryKey: cultureKeys.leaderboard });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: cultureKeys.leaderboard,
    queryFn: cultureService.getLeaderboard,
  });
}
