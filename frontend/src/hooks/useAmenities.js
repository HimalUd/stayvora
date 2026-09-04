import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsAPI } from '../utils/api';

export function useAddAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => hotelsAPI.addAmenity(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] }),
  });
}

export function useDeleteAmenity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => hotelsAPI.deleteAmenity(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] }),
  });
}
