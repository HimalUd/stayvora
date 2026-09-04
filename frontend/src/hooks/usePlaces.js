import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placesAPI } from '../utils/api';

export function usePlaces(hotelId) {
  return useQuery({
    queryKey: ['places', hotelId],
    queryFn: () => placesAPI.list(hotelId).then(r => r.data.places || []),
    enabled: !!hotelId,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => placesAPI.create(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => placesAPI.delete(id).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  });
}
