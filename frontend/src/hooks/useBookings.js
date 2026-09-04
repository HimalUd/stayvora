import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '../utils/api';

export function useUserBookings() {
  return useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: () => bookingsAPI.listUser().then(r => r.data.bookings || []),
  });
}

export function useOwnerBookings(hotelId) {
  return useQuery({
    queryKey: ['bookings', 'owner', hotelId || 'all'],
    queryFn: () => bookingsAPI.listOwner(hotelId).then(r => r.data.bookings || []),
    enabled: true,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookingsAPI.create(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsAPI.confirm(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsAPI.cancel(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBookingByUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsAPI.cancelUser(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
