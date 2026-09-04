import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../utils/api';

export function useEvents(hotelId) {
  return useQuery({
    queryKey: ['events', hotelId],
    queryFn: () => eventsAPI.list(hotelId).then(r => r.data.events || []),
    enabled: !!hotelId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => eventsAPI.create(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => eventsAPI.delete(id).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}
