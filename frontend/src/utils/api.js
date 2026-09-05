import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const UPLOAD_HOST = API_BASE || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  checkSession: () => api.get('/api/auth/check_session'),
  sendVerification: () => api.post('/api/auth/send_verification'),
  verifyEmail: (data) => api.post('/api/auth/verify_email', data),
};

export const hotelsAPI = {
  list: (search) => api.get('/api/hotels/list', { params: { search } }),
  get: (id) => api.get('/api/hotels/get', { params: { id } }),
  create: (data) => api.post('/api/hotels/create', data),
  update: (data) => api.put('/api/hotels/update', data),
  delete: (id) => api.delete('/api/hotels/delete', { params: { id } }),
  search: (params) => api.get('/api/hotels/search', { params }),
  addImage: (data) => api.post('/api/hotels/add_image', data),
  uploadImage: (formData) => api.post('/api/hotels/add_image', formData),
  deleteImage: (id) => api.delete('/api/hotels/delete_image', { params: { id } }),
  my: () => api.get('/api/hotels/my'),
  extractAddress: (url) => api.post('/api/hotels/extract-address', { url }),
  addAmenity: (data) => api.post('/api/hotels/add_amenity', data),
  deleteAmenity: (data) => api.post('/api/hotels/delete_amenity', data),
  destinationCounts: (locations) => api.get('/api/hotels/destination-counts', { params: { locations: locations.join(',') } }),
};

export const roomsAPI = {
  list: (hotelId) => api.get('/api/rooms/list', { params: { hotel_id: hotelId } }),
  create: (data) => api.post('/api/rooms/create', data),
  update: (data) => api.put('/api/rooms/update', data),
  delete: (id) => api.delete('/api/rooms/delete', { params: { id } }),
};

export const bookingsAPI = {
  create: (data) => api.post('/api/bookings/create', data),
  listUser: () => api.get('/api/bookings/list_user'),
  listOwner: (hotelId) => api.get('/api/bookings/list_owner', { params: hotelId ? { hotel_id: hotelId } : {} }),
  confirm: (id) => api.put('/api/bookings/confirm', { id }),
  cancel: (id) => api.put('/api/bookings/cancel', { id }),
  cancelUser: (id) => api.put('/api/bookings/cancel_user', { id }),
};

export const eventsAPI = {
  list: (hotelId) => api.get('/api/events/list', { params: { hotel_id: hotelId } }),
  create: (data) => api.post('/api/events/create', data),
  update: (data) => api.put('/api/events/update', data),
  delete: (id) => api.delete('/api/events/delete', { params: { id } }),
};

export const offersAPI = {
  list: (hotelId) => api.get('/api/offers/list', { params: { hotel_id: hotelId } }),
  create: (data) => api.post('/api/offers/create', data),
  update: (data) => api.put('/api/offers/update', data),
  delete: (id) => api.delete('/api/offers/delete', { params: { id } }),
};

export const placesAPI = {
  list: (hotelId) => api.get('/api/places/list', { params: { hotel_id: hotelId } }),
  create: (data) => api.post('/api/places/create', data),
  update: (data) => api.put('/api/places/update', data),
  delete: (id) => api.delete('/api/places/delete', { params: { id } }),
  geocode: (lat, lng) => api.get('/api/places/geocode', { params: { lat, lng } }),
  extract: (url) => api.post('/api/places/extract', { url }),
};

export const adminAPI = {
  hotels: () => api.get('/api/admin/hotels'),
  stats: () => api.get('/api/admin/stats'),
  bookings: () => api.get('/api/admin/bookings'),
  reviews: () => api.get('/api/admin/reviews'),
  users: () => api.get('/api/admin/users'),
  userDetail: (id) => api.get('/api/admin/users/detail', { params: { id } }),
  deleteHotel: (id) => api.delete('/api/admin/delete_hotel', { params: { id } }),
  deleteReview: (id) => api.delete('/api/admin/delete-review', { params: { id } }),
  deleteUser: (id) => api.delete('/api/admin/delete-user', { params: { id } }),
};

export const notificationsAPI = {
  list: () => api.get('/api/notifications/list'),
  markRead: (id) => api.post('/api/notifications/mark_read', { id }),
  markAllRead: () => api.post('/api/notifications/mark_read'),
};

export const reviewsAPI = {
  add: (data) => api.post('/api/reviews/add', data),
  list: (hotelId) => api.get('/api/reviews/list', { params: { hotel_id: hotelId } }),
  mine: (bookingId) => api.get('/api/reviews/mine', { params: { booking_id: bookingId } }),
  owner: () => api.get('/api/reviews/owner'),
};

export default api;
