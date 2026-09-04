import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsAPI } from '../utils/api';

export function useBookingReview(bookingId) {
  return useQuery({
    queryKey: ['reviews', 'booking', bookingId],
    queryFn: () => reviewsAPI.mine(bookingId).then(r => r.data.review || null),
    enabled: !!bookingId,
  });
}

export function useHotelReviews(hotelId) {
  return useQuery({
    queryKey: ['reviews', 'hotel', hotelId],
    queryFn: () => reviewsAPI.list(hotelId).then(r => r.data),
    enabled: !!hotelId,
  });
}

export function useOwnerReviews() {
  return useQuery({
    queryKey: ['reviews', 'owner'],
    queryFn: () => reviewsAPI.owner().then(r => r.data.reviews || []),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewsAPI.add(data).then(r => r.data),
    onSuccess: (res) => {
      const bookingId = res?.review?.booking_id;
      const hotelId = res?.review?.hotel_id;
      if (bookingId) queryClient.invalidateQueries({ queryKey: ['reviews', 'booking', bookingId] });
      if (hotelId) queryClient.invalidateQueries({ queryKey: ['reviews', 'hotel', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}