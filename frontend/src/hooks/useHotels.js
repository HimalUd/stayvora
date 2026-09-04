import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsAPI } from '../utils/api';

export function useHotels(params) {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsAPI.list().then(r => r.data.hotels || []),
    enabled: !params,
  });
}

export function useHotelSearch(params) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsAPI.search(params).then(r => r.data.hotels || []),
    enabled: !!params && Object.keys(params).length > 0,
  });
}

export function useHotel(id) {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsAPI.get(id).then(r => r.data.hotel),
    enabled: !!id,
  });
}

export function useOwnerHotels() {
  return useQuery({
    queryKey: ['hotels', 'owner'],
    queryFn: () => hotelsAPI.my().then(r => r.data.hotels || []),
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => hotelsAPI.update(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] });
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
    },
  });
}

export function useAddHotelImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      if (data instanceof FormData) {
        return hotelsAPI.uploadImage(data).then(r => r.data);
      }
      return hotelsAPI.addImage(data).then(r => r.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] }),
  });
}

export function useDeleteHotelImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => hotelsAPI.deleteImage(id).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] }),
  });
}
