import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsAPI } from '../utils/api';

export function useRooms(hotelId) {
  return useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: () => roomsAPI.list(hotelId).then(r => r.data.rooms || []),
    enabled: !!hotelId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => roomsAPI.create(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => roomsAPI.delete(id).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });
}
