import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../utils/api';

export function useAdminHotels() {
  return useQuery({
    queryKey: ['admin', 'hotels'],
    queryFn: () => adminAPI.hotels().then(r => r.data.hotels || []),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminAPI.stats().then(r => r.data.stats),
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => adminAPI.bookings().then(r => r.data.bookings || []),
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminAPI.reviews().then(r => r.data.reviews || []),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.users().then(r => r.data.users || []),
  });
}

export function useAdminUserDetail() {
  return useMutation({
    mutationFn: (id) => adminAPI.userDetail(id).then(r => r.data),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminAPI.deleteHotel(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminAPI.deleteReview(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
