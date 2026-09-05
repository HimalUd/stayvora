import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useOwnerBookings } from '../hooks/useBookings';
import { useOwnerHotels, useAddHotelImage, useDeleteHotelImage, useUpdateHotel } from '../hooks/useHotels';
import { useEvents, useCreateEvent, useDeleteEvent } from '../hooks/useEvents';
import { usePlaces, useCreatePlace, useDeletePlace } from '../hooks/usePlaces';
import { useRooms, useCreateRoom, useDeleteRoom } from '../hooks/useRooms';
import { useAddAmenity, useDeleteAmenity } from '../hooks/useAmenities';
import { formatLKRFixed } from '../utils/currency';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications';
import { placesAPI } from '../utils/api';
import { EVENT_TYPES } from '../lib/eventTypes';
import { AMENITIES } from '../lib/amenities';
import { TRAVEL_PURPOSES } from '../lib/travelPurposes';
import CalendarPicker, { toDateInput, formatDisplay } from '../components/CalendarPicker/CalendarPicker';
import badgeLight from '../assets/logos/badge-light.png';
import './HotelOwnerDashboard.css';

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#1976D2',
  cancelled: '#D32F2F',
};

const statusLabels = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
};

const statusTextColors = {
  pending: 'white',
  confirmed: 'white',
  cancelled: 'white',
};

const PRICE_RANGES = ['Budget', 'Mid-range', 'Luxury'];

const eventSchema = z.object({
  name: z.string().min(1, 'Select an event type'),
  description: z.string().min(1, 'Description is required'),
  event_date: z.string().min(1, 'Date is required'),
});

const placeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  location_url: z.string().min(1, 'Google Maps link is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  distance: z.string().optional(),
});

const roomSchema = z.object({
  room_type: z.string().min(1, 'Room type is required'),
  price: z.string().min(1, 'Price is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  description: z.string().optional(),
});

const imageSchema = z.object({
  image_url: z.string().optional(),
});

const hotelEditSchema = z.object({
  name: z.string().min(2, 'Hotel name is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  price_range: z.string().min(1, 'Select a price range'),
});

export default function HotelOwnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [selectedHotelId, setSelectedHotelId] = useState(() => {
    const saved = sessionStorage.getItem('hod_selected_hotel');
    return saved ? Number(saved) : null;
  });
  const { data: bookings = [], isLoading: loading } = useOwnerBookings(selectedHotelId);
  const { data: hotels = [], isLoading: hotelsLoading } = useOwnerHotels();
  const { data: notifData, refetch: refetchNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread || 0;
  const selectedHotel = hotels.find(h => h.id === selectedHotelId) || null;

  const { data: events = [], isLoading: eventsLoading } = useEvents(selectedHotelId);
  const { data: places = [], isLoading: placesLoading } = usePlaces(selectedHotelId);
  const { data: rooms = [], isLoading: roomsLoading } = useRooms(selectedHotelId);
  const addHotelImage = useAddHotelImage();
  const deleteHotelImage = useDeleteHotelImage();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const createPlace = useCreatePlace();
  const deletePlace = useDeletePlace();
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();
  const addAmenity = useAddAmenity();
  const deleteAmenity = useDeleteAmenity();

  const [tab, setTab] = useState('bookings');
  const [showNotifications, setShowNotifications] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const topbarRightRef = useRef(null);
  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageSuccess, setImageSuccess] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [eventCalOpen, setEventCalOpen] = useState(false);
  const eventDateFieldRef = useRef(null);

  useEffect(() => {
    if (!eventCalOpen) return;
    const handleClickOutside = (e) => {
      if (eventDateFieldRef.current && !eventDateFieldRef.current.contains(e.target)) {
        setEventCalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [eventCalOpen]);

  useEffect(() => {
    if (hotels.length === 0) return;
    const saved = sessionStorage.getItem('hod_selected_hotel');
    const savedId = saved ? Number(saved) : null;
    const navigateTo = location.state?.selectHotelId ? Number(location.state.selectHotelId) : null;
    const currentValid = selectedHotelId && hotels.some(h => h.id === selectedHotelId);
    const fallback = (currentValid && selectedHotelId)
      || (navigateTo && hotels.some(h => h.id === navigateTo) && navigateTo)
      || (savedId && hotels.some(h => h.id === savedId) && savedId)
      || hotels[0].id;
    if (fallback !== selectedHotelId) setSelectedHotelId(fallback);
    if (navigateTo && navigateTo === fallback) {
      sessionStorage.setItem('hod_selected_hotel', String(fallback));
    }
  }, [hotels, selectedHotelId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topbarRightRef.current && !topbarRightRef.current.contains(e.target)) {
        setShowNotifications(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const { register: regEvent, handleSubmit: handleEventSubmit, formState: { errors: eventErrors }, reset: resetEvent, setValue: setEventValue, watch: watchEvent } = useForm({
    resolver: zodResolver(eventSchema),
  });
  const { register: regPlace, handleSubmit: handlePlaceSubmit, formState: { errors: placeErrors }, reset: resetPlace, setValue: setPlaceValue } = useForm({
    resolver: zodResolver(placeSchema),
  });
  const { register: regImage, handleSubmit: handleImageSubmit, formState: { errors: imageErrors }, reset: resetImage } = useForm({
    resolver: zodResolver(imageSchema),
  });
  const { register: regRoom, handleSubmit: handleRoomSubmit, formState: { errors: roomErrors }, reset: resetRoom } = useForm({
    resolver: zodResolver(roomSchema),
  });
  const updateHotel = useUpdateHotel();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editTravelPurposes, setEditTravelPurposes] = useState([]);
  const [editAmenities, setEditAmenities] = useState([]);
  const { register: regEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEdit, setValue: setEditValue, watch: watchEdit } = useForm({
    resolver: zodResolver(hotelEditSchema),
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
    avgRating: hotels.length > 0
      ? (Number(selectedHotel?.rating) || hotels.reduce((sum, h) => sum + (Number(h.rating) || 0), 0) / hotels.length).toFixed(1)
      : '—',
  };

  const formatRevenue = (value) => {
    if (!value) return 'Rs. 0';
    return 'Rs. ' + Number(value).toLocaleString('en-IN');
  };

  const onEventSubmit = async (data) => {
    await createEvent.mutateAsync({ ...data, hotel_id: selectedHotelId });
    resetEvent();
  };
  const onPlaceSubmit = async (data) => {
    await createPlace.mutateAsync({
      ...data,
      hotel_id: selectedHotelId,
      name: data.name || 'Unknown Place',
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
    });
    resetPlace();
  };

  const onImageSubmit = async (data) => {
    setImageError('');
    setImageSuccess('');
    try {
      if (uploadMode === 'file') {
        if (!selectedFile) return;
        if (selectedFile.size > 5 * 1024 * 1024) {
          setImageError('Image must be 5MB or smaller');
          return;
        }
        const formData = new FormData();
        formData.append('hotel_id', selectedHotelId);
        formData.append('image', selectedFile);
        await addHotelImage.mutateAsync(formData);
      } else {
        if (!data.image_url) return;
        if (!/^https?:\/\//i.test(data.image_url)) {
          setImageError('Image URL must start with http:// or https://');
          return;
        }
        await addHotelImage.mutateAsync({ hotel_id: selectedHotelId, image_url: data.image_url });
      }
      resetImage();
      setSelectedFile(null);
      setImageSuccess('Image added successfully');
    } catch (err) {
      setImageError(err?.response?.data?.message || 'Failed to add image. Please try again.');
    }
  };

  const validateFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setImageError('Only JPG, PNG, GIF, and WEBP images are allowed');
      setSelectedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be 5MB or smaller');
      setSelectedFile(null);
      return;
    }
    setImageError('');
    setSelectedFile(file);
  };

  const onRoomSubmit = async (data) => {
    await createRoom.mutateAsync({ ...data, hotel_id: selectedHotelId, price: Number(data.price), capacity: Number(data.capacity) });
    resetRoom();
  };

  const openEditModal = () => {
    if (!selectedHotel) return;
    setEditError('');
    setEditSuccess('');
    setEditTravelPurposes((selectedHotel.travel_purpose || '').split(',').map(s => s.trim()).filter(Boolean));
    setEditAmenities((selectedHotel.amenities || '').split(',').map(s => s.trim()).filter(Boolean));
    resetEdit({
      name: selectedHotel.name || '',
      description: selectedHotel.description || '',
      address: selectedHotel.address || '',
      city: selectedHotel.city || '',
      country: selectedHotel.country || '',
      price_range: selectedHotel.price_range || '',
    });
    setShowEditModal(true);
  };

  const toggleEditPurpose = (p) => {
    const next = editTravelPurposes.includes(p) ? editTravelPurposes.filter(x => x !== p) : [...editTravelPurposes, p];
    setEditTravelPurposes(next);
  };

  const toggleEditAmenity = (a) => {
    setEditAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const onEditSubmit = async (data) => {
    setEditError('');
    setEditSuccess('');
    try {
      await updateHotel.mutateAsync({
        id: selectedHotelId,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        location: data.city,
        price_range: data.price_range,
        travel_purpose: editTravelPurposes.join(', '),
        amenities: editAmenities.join(', '),
      });
      setEditSuccess('Hotel details updated successfully');
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update hotel. Please try again.');
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderBookingList = () => (
    <div className="hod-booking-list">
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="hod-empty">
          <div className="hod-empty-icon">📋</div>
          <p>No bookings yet{selectedHotel ? ` for ${selectedHotel.name}` : ''}</p>
        </div>
      ) : (
        bookings.map((b) => {
          const guestName = b.guest_name || b.user_name || 'Guest';
          const initial = guestName.charAt(0).toUpperCase();
          const status = b.status || 'pending';
          const nights = Math.max(Math.round((new Date(b.check_out) - new Date(b.check_in)) / 86400000), 1);
          return (
            <div
              key={b.id}
              className="hod-booking-card"
              onClick={() => {
                if (b.hotel_id) sessionStorage.setItem('hod_selected_hotel', String(b.hotel_id));
                navigate(`/hotel-owner-booking/${b.booking_code}`);
              }}
            >
              <div className="hod-booking-top">
                <div className="hod-booking-user">
                  <div className="hod-avatar">{initial}</div>
                  <div>
                    <div className="hod-guest-name">{guestName}</div>
                    <div className="hod-booking-id">Booking ID: {b.booking_code}</div>
                  </div>
                </div>
                <div className="hod-status-badge" style={{ background: statusColors[status] || '#1976D2' }}>
                  <span style={{ color: statusTextColors[status] || 'white' }}>{statusLabels[status] || status.toUpperCase()}</span>
                </div>
              </div>
              <div className="hod-booking-details">
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Room</span>
                  <span className="hod-bd-value">{b.room_type}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Hotel</span>
                  <span className="hod-bd-value">{b.hotel_name}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Check-in</span>
                  <span className="hod-bd-value">{formatDate(b.check_in)}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Check-out</span>
                  <span className="hod-bd-value">{formatDate(b.check_out)}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Guests</span>
                  <span className="hod-bd-value">{b.guests} guest(s) &middot; {nights} night(s)</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Total</span>
                  <span className="hod-bd-value hod-bd-total">{formatRevenue(b.total_price)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderEvents = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#2563EB" strokeWidth="2"/><path d="M16 2V6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><path d="M8 2V6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><path d="M3 10H21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/></svg>
          Add Event
        </h3>
        <form onSubmit={handleEventSubmit(onEventSubmit)}>
          <div className="hod-mgmt-form-grid">
            <div className="hod-mgmt-row">
              <label className="hod-mgmt-label">Event Type *</label>
              <select className="hod-select hod-select-block" {...regEvent('name')}>
                <option value="">Select an event type</option>
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {eventErrors.name && <span className="hod-error">{eventErrors.name.message}</span>}
            </div>
            <div className="hod-mgmt-row hod-mgmt-row-full">
              <label className="hod-mgmt-label">Date *</label>
              <div className="hod-date-field" ref={eventDateFieldRef}>
                <button
                  type="button"
                  className="hod-date-trigger"
                  onClick={() => setEventCalOpen(prev => !prev)}
                  aria-label="Pick date"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#2563EB" strokeWidth="1.25" />
                    <path d="M4 1v3M12 1v3M1.5 6h13" stroke="#2563EB" strokeWidth="1.25" />
                  </svg>
                </button>
                <input
                  className="hod-input hod-date-input"
                  type="text"
                  readOnly
                  placeholder="Select event date"
                  value={watchEvent('event_date') ? formatDisplay(watchEvent('event_date')) : ''}
                  onClick={() => setEventCalOpen(prev => !prev)}
                />
                {eventCalOpen && (
                  <CalendarPicker
                    value={watchEvent('event_date')}
                    minDate={toDateInput(new Date())}
                    onSelect={(d) => setEventValue('event_date', d, { shouldValidate: true })}
                    onClose={() => setEventCalOpen(false)}
                    alignRight
                  />
                )}
              </div>
              {eventErrors.event_date && <span className="hod-error">{eventErrors.event_date.message}</span>}
            </div>
            <div className="hod-mgmt-row hod-mgmt-row-full">
              <label className="hod-mgmt-label">Description *</label>
              <textarea className="hod-textarea" placeholder="Event description" {...regEvent('description')} />
              {eventErrors.description && <span className="hod-error">{eventErrors.description.message}</span>}
            </div>
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createEvent.isPending}>
            {createEvent.isPending ? 'Adding...' : 'Add Event'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {eventsLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : events.length === 0 ? (
          <div className="hod-empty">
            <div className="hod-empty-icon">📅</div>
            <p>No events scheduled yet</p>
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{ev.name}</strong>
                <p className="hod-mgmt-item-desc">{ev.event_date} — {ev.description}</p>
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteEvent.mutate(ev.id)} disabled={deleteEvent.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Add Destination
        </h3>
        <form onSubmit={handlePlaceSubmit(onPlaceSubmit)}>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Paste Google Maps link here" {...regPlace('location_url')} onBlur={async (e) => {
              regPlace('location_url').onBlur(e);
              const url = e.target.value.trim();
              if (!url) return;

              try {
                const res = await placesAPI.extract(url);
                const data = res.data;
                if (data) {
                  if (data.name) setPlaceValue('name', data.name);
                  if (data.latitude) setPlaceValue('latitude', String(data.latitude));
                  if (data.longitude) setPlaceValue('longitude', String(data.longitude));
                  if (data.display_name) setPlaceValue('description', data.display_name);
                }
              } catch (_) {}
            }} />
            {placeErrors.location_url && <span className="hod-error">{placeErrors.location_url.message}</span>}
          </div>
          <div className="hod-mgmt-form-grid">
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Place name (auto-detected)" {...regPlace('name')} />
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Distance (e.g. 2.5 km)" {...regPlace('distance')} />
            </div>
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createPlace.isPending}>
            {createPlace.isPending ? 'Adding...' : 'Add Destination'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {placesLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : places.length === 0 ? (
          <div className="hod-empty">
            <div className="hod-empty-icon">📍</div>
            <p>No destinations added yet</p>
          </div>
        ) : (
          places.map(p => (
            <div key={p.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{p.name}</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {p.distance && <span className="hod-mgmt-item-dist">{p.distance}</span>}
                  {p.location_url && <span className="hod-mgmt-item-url"><a href={p.location_url} target="_blank" rel="noopener noreferrer">View on Maps</a></span>}
                  {(p.latitude && p.longitude) && <span className="hod-mgmt-item-coords">{Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}</span>}
                </div>
                {p.description && <p className="hod-mgmt-item-desc">{p.description}</p>}
              </div>
              <button className="hod-mgmt-del" onClick={() => deletePlace.mutate(p.id)} disabled={deletePlace.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7V21H21V7" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7" stroke="#2563EB" strokeWidth="2"/><path d="M12 5V3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><rect x="7" y="10" width="4" height="4" rx="1" stroke="#2563EB" strokeWidth="2"/><rect x="13" y="10" width="4" height="4" rx="1" stroke="#2563EB" strokeWidth="2"/></svg>
          Add Room
        </h3>
        <form onSubmit={handleRoomSubmit(onRoomSubmit)}>
          <div className="hod-mgmt-form-grid">
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Room type (e.g. Deluxe Suite)" {...regRoom('room_type')} />
              {roomErrors.room_type && <span className="hod-error">{roomErrors.room_type.message}</span>}
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" type="number" step="1" placeholder="Price per night (LKR)" {...regRoom('price')} />
              {roomErrors.price && <span className="hod-error">{roomErrors.price.message}</span>}
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" type="number" placeholder="Max guests" {...regRoom('capacity')} />
              {roomErrors.capacity && <span className="hod-error">{roomErrors.capacity.message}</span>}
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Room description (optional)" {...regRoom('description')} />
            </div>
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createRoom.isPending}>
            {createRoom.isPending ? 'Adding...' : 'Add Room'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {roomsLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : rooms.length === 0 ? (
          <div className="hod-empty">
            <div className="hod-empty-icon">🛏️</div>
            <p>No rooms added yet</p>
          </div>
        ) : (
          rooms.map(r => (
            <div key={r.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{r.room_type}</strong> — <span style={{ color: '#059669', fontWeight: 600 }}>{formatLKRFixed(r.price)}</span>/night &middot; {r.capacity} guests
                {r.description && <p className="hod-mgmt-item-desc">{r.description}</p>}
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteRoom.mutate(r.id)} disabled={deleteRoom.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const amenityList = typeof selectedHotel?.amenities === 'string'
    ? selectedHotel.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const handleAddAmenity = async () => {
    if (!newAmenity.trim()) return;
    await addAmenity.mutateAsync({ hotel_id: selectedHotelId, amenity: newAmenity.trim() });
    setNewAmenity('');
  };

  const renderAmenities = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.318 6.318C4.318 4.971 5.41 3.879 6.757 3.879C7.79 3.879 8.675 4.47 9.101 5.322C9.527 4.47 10.412 3.879 11.445 3.879C12.792 3.879 13.884 4.971 13.884 6.318C13.884 9.876 9.101 12.879 9.101 12.879C9.101 12.879 4.318 9.876 4.318 6.318Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21C20 17.134 16.418 14 12 14C7.582 14 4 17.134 4 21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Amenities
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="hod-select hod-select-block"
            style={{ flex: 1 }}
            value={newAmenity}
            onChange={e => setNewAmenity(e.target.value)}
          >
            <option value="">Select an amenity</option>
            {AMENITIES
              .filter(a => !amenityList.includes(a))
              .map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
          </select>
          <button className="hod-mgmt-btn" onClick={handleAddAmenity} disabled={addAmenity.isPending || !newAmenity.trim()}>
            {addAmenity.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
        {AMENITIES.every(a => amenityList.includes(a)) && amenityList.length > 0 && (
          <p className="hod-mgmt-hint">All available amenities have been added</p>
        )}
      </div>
      {amenityList.length === 0 ? (
        <div className="hod-empty">
          <div className="hod-empty-icon">⭐</div>
          <p>No amenities added yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {amenityList.map((amenity, idx) => (
            <div key={idx} className="hod-amenity-chip">
              <span>{amenity}</span>
              <button
                onClick={() => deleteAmenity.mutate({ hotel_id: selectedHotelId, amenity })}
                disabled={deleteAmenity.isPending}
                className="hod-amenity-chip-del"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderImages = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="2" stroke="#2563EB" strokeWidth="2"/><path d="M10 10.5C10.8284 10.5 11.5 9.82843 11.5 9C11.5 8.17157 10.8284 7.5 10 7.5C9.17157 7.5 8.5 8.17157 8.5 9C8.5 9.82843 9.17157 10.5 10 10.5Z" stroke="#2563EB" strokeWidth="2"/><path d="M21 15L16 10L5 21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Add Image
        </h3>
        <form onSubmit={handleImageSubmit(onImageSubmit)}>
          <div className="hod-upload-toggle">
            <button type="button" className={`hod-toggle-btn ${uploadMode === 'file' ? 'active' : ''}`} onClick={() => { setUploadMode('file'); setImageError(''); setImageSuccess(''); }}>Upload File</button>
            <button type="button" className={`hod-toggle-btn ${uploadMode === 'url' ? 'active' : ''}`} onClick={() => { setUploadMode('url'); setImageError(''); setImageSuccess(''); setSelectedFile(null); }}>Image URL</button>
          </div>
          {uploadMode === 'file' ? (
            <div className="hod-mgmt-row">
              <label
                className={`hod-dropzone ${dragOver ? 'hod-dropzone-drag' : ''} ${selectedFile ? 'hod-dropzone-has' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); validateFile(e.dataTransfer.files[0]); }}
              >
                <input
                  type="file"
                  className="hod-file-input"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={e => validateFile(e.target.files[0])}
                />
                {selectedFile ? (
                  <div className="hod-dropzone-preview">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="hod-dropzone-thumb" />
                    <div className="hod-dropzone-info">
                      <span className="hod-dropzone-name">{selectedFile.name}</span>
                      <span className="hod-dropzone-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button
                      type="button"
                      className="hod-dropzone-clear"
                      onClick={() => { setSelectedFile(null); setImageError(''); }}
                      aria-label="Remove file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#94A3B8" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#94A3B8"/><path d="M21 15L16 10L5 21" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="hod-dropzone-main">Drag &amp; drop image here or <span className="hod-dropzone-link">browse</span></span>
                    <span className="hod-dropzone-sub">JPG, PNG, GIF or WEBP · Max 5MB</span>
                  </>
                )}
              </label>
            </div>
          ) : (
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="https://example.com/image.jpg" {...regImage('image_url')} />
              {imageErrors.image_url && <span className="hod-error">{imageErrors.image_url.message}</span>}
            </div>
          )}
          {imageError && <p className="hod-image-error">{imageError}</p>}
          {imageSuccess && <p className="hod-image-success">{imageSuccess}</p>}
          <button className="hod-mgmt-btn" type="submit" disabled={addHotelImage.isPending || (uploadMode === 'file' && !selectedFile)}>
            {addHotelImage.isPending ? 'Adding...' : 'Add Image'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list hod-images-grid">
        {(selectedHotel?.images || []).length === 0 ? (
          <div className="hod-empty" style={{ gridColumn: '1 / -1', padding: '56px 24px' }}>
            <div className="hod-empty-icon">🖼️</div>
            <p>No images added yet</p>
          </div>
        ) : (
          (selectedHotel?.images || []).map((img, idx) => (
            <div key={idx} className="hod-mgmt-item hod-image-item">
              <img src={img.image_url || img} alt={`Hotel ${idx + 1}`} className="hod-image-preview" />
              <button className="hod-mgmt-del" onClick={() => deleteHotelImage.mutate(img.id)} disabled={deleteHotelImage.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="hod-page">
      <header className="hod-topbar">
        <div className="hod-topbar-inner">
          <div className="hod-topbar-left">
            <Link to="/" className="hod-topbar-logo">
              <img src={badgeLight} alt="StayVora" className="hod-topbar-logo-img" />
            </Link>
            <span className="hod-topbar-title">Hotel Manager Dashboard</span>
          </div>
          <div className="hod-topbar-right" ref={topbarRightRef}>
            <div className="hod-notif-wrap" onClick={() => {
              setShowNotifications(prev => {
                const next = !prev;
                if (next) setUserMenuOpen(false);
                if (next) refetchNotifications();
                return next;
              });
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unreadCount > 0 && (
                <div className="hod-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
              )}
            </div>
            {showNotifications && (
              <div className="hod-notif-panel">
                <div className="hod-notif-panel-header">
                  <span className="hod-notif-panel-title">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="hod-notif-mark-all"
                      onClick={() => markAllRead.mutate()}
                      disabled={markAllRead.isPending}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="hod-notif-panel-body">
                  {notifications.length === 0 ? (
                    <div className="hod-notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`hod-notif-item ${n.is_read ? '' : 'hod-notif-item-unread'}`}
                        onClick={() => {
                          if (!n.is_read) markRead.mutate(n.id);
                          if (n.type === 'review') {
                            navigate('/hotel-owner-reviews');
                          } else if (n.booking_code) {
                            if (n.hotel_id) sessionStorage.setItem('hod_selected_hotel', String(n.hotel_id));
                            navigate(`/hotel-owner-booking/${n.booking_code}`);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="hod-notif-item-title">{n.title}</div>
                        <div className="hod-notif-item-msg">{n.message}</div>
                        <div className="hod-notif-item-time">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="hod-user-wrap" onClick={() => {
              setUserMenuOpen(prev => {
                const next = !prev;
                if (next) setShowNotifications(false);
                return next;
              });
            }}>
              <div className="hod-user-chip">
                <div className="hod-user-avatar">{(user?.name || 'O').charAt(0).toUpperCase()}</div>
                <span className="hod-user-name">{user?.name || 'Owner'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {userMenuOpen && (
                <div className="hod-user-menu">
                  <div className="hod-user-menu-header">
                    <div className="hod-user-menu-name">{user?.name || 'Owner'}</div>
                    <div className="hod-user-menu-email">{user?.email}</div>
                  </div>
                  <button
                    className="hod-user-menu-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/hotel-owner-reviews');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L12 2z" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                    My Reviews
                  </button>
                  <button className="hod-user-menu-item" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="hod-content">
        <div className="hod-welcome-header">
          <div>
            
            <h1 className="hod-welcome">Welcome back, {(user?.name || 'Owner').split(' ')[0]}!</h1>
            <p className="hod-sub">
              {selectedHotel
                ? `Showing insights for ${selectedHotel.name}`
                : "Here's what's happening with your hotel today"}
            </p>
          </div>
          <div className="hod-welcome-actions">
            <button className="hod-welcome-btn hod-welcome-btn-primary" onClick={() => navigate('/hotel-registration')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              New Hotel
            </button>
          </div>
        </div>

        {/* HOTEL SELECTOR */}
        {(hotels.length > 0) && (
          <div className="hod-selector-wrap">
            <div className="hod-selector-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#F5A624" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <label className="hod-selector-label">Select Hotel:</label>
            <select
              className="hod-select"
              value={selectedHotelId || ''}
              onChange={e => {
                const id = Number(e.target.value);
                setSelectedHotelId(id);
                sessionStorage.setItem('hod_selected_hotel', String(id));
              }}
            >
              <option value="" disabled>Choose a hotel</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <button type="button" className="hod-selector-edit" onClick={openEditModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V13" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Details
            </button>
          </div>
        )}

        {/* NO HOTEL EMPTY STATE */}
        {!hotelsLoading && hotels.length === 0 && (
          <div className="hod-empty-state">
            <div className="hod-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="hod-empty-title">No hotels yet</h3>
            <p className="hod-empty-text">Add your first hotel to start receiving bookings from travelers.</p>
            <button className="hod-welcome-btn hod-welcome-btn-primary" onClick={() => navigate('/hotel-registration')}>
              Add Your Hotel
            </button>
          </div>
        )}

        {hotelsLoading && (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        )}

        {/* STATS */}
        <div className="hod-stats">
          <div className="hod-stat-card">
            <div>
              <div className="hod-stat-label">Total Bookings</div>
              <div className="hod-stat-value">{stats.total}</div>
            </div>
            <div className="hod-stat-icon hod-stat-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="hod-stat-card">
            <div>
              <div className="hod-stat-label">Pending Bookings</div>
              <div className="hod-stat-value">{stats.pending}</div>
            </div>
            <div className="hod-stat-icon hod-stat-icon-yellow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 6V12L16 14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="#D97706" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="hod-stat-card">
            <div>
              <div className="hod-stat-label">Total Revenue</div>
              <div className="hod-stat-value hod-stat-value-gold">{formatRevenue(stats.revenue)}</div>
            </div>
            <div className="hod-stat-icon hod-stat-icon-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 1V23" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 5H9.5C7.84315 5 6.5 6.34315 6.5 8C6.5 9.65685 7.84315 11 9.5 11H14.5C16.1569 11 17.5 12.3431 17.5 14C17.5 15.6569 16.1569 17 14.5 17H7" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="hod-stat-card">
            <div>
              <div className="hod-stat-label">Average Rating</div>
              <div className="hod-stat-value">{stats.avgRating}</div>
            </div>
            <div className="hod-stat-icon hod-stat-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="hod-tabs">
          <button className={`hod-tab ${tab === 'bookings' ? 'hod-tab-active' : ''}`} onClick={() => setTab('bookings')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Bookings
          </button>
            <button className={`hod-tab ${tab === 'events' ? 'hod-tab-active' : ''}`} onClick={() => setTab('events')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Events
            </button>
            <button className={`hod-tab ${tab === 'amenities' ? 'hod-tab-active' : ''}`} onClick={() => setTab('amenities')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4.318 6.318C4.318 4.971 5.41 3.879 6.757 3.879C7.79 3.879 8.675 4.47 9.101 5.322C9.527 4.47 10.412 3.879 11.445 3.879C12.792 3.879 13.884 4.971 13.884 6.318C13.884 9.876 9.101 12.879 9.101 12.879C9.101 12.879 4.318 9.876 4.318 6.318Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 21C20 17.134 16.418 14 12 14C7.582 14 4 17.134 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Amenities
            </button>
            <button className={`hod-tab ${tab === 'places' ? 'hod-tab-active' : ''}`} onClick={() => setTab('places')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Destinations
          </button>
          <button className={`hod-tab ${tab === 'rooms' ? 'hod-tab-active' : ''}`} onClick={() => setTab('rooms')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V21H21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <rect x="7" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="13" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Rooms
          </button>
          <button className={`hod-tab ${tab === 'images' ? 'hod-tab-active' : ''}`} onClick={() => setTab('images')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 10.5C10.8284 10.5 11.5 9.82843 11.5 9C11.5 8.17157 10.8284 7.5 10 7.5C9.17157 7.5 8.5 8.17157 8.5 9C8.5 9.82843 9.17157 10.5 10 10.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Images
          </button>
        </div>

        {tab === 'bookings' && renderBookingList()}
        {tab === 'events' && selectedHotelId && renderEvents()}
        {tab === 'amenities' && selectedHotelId && renderAmenities()}
        {tab === 'places' && selectedHotelId && renderPlaces()}
        {tab === 'rooms' && selectedHotelId && renderRooms()}
        {tab === 'images' && selectedHotelId && renderImages()}
      </div>

      {showEditModal && (
        <div className="hod-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="hod-modal" onClick={e => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <div className="hod-modal-title">Edit Hotel Details</div>
                <div className="hod-modal-sub">{selectedHotel?.name || ''}</div>
              </div>
              <button className="hod-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#5B6B85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="hod-modal-scroll">
              <form onSubmit={handleEditSubmit(onEditSubmit)} className="hod-edit-form">
                <div className="hod-field">
                  <label className="hod-label">Hotel Name *</label>
                  <input className="hod-input" placeholder="Hotel name" {...regEdit('name')} />
                  {editErrors.name && <span className="hod-error">{editErrors.name.message}</span>}
                </div>

                <div className="hod-field">
                  <label className="hod-label">Description *</label>
                  <textarea className="hod-textarea" rows={4} maxLength={500} placeholder="Describe your hotel..." {...regEdit('description')} />
                  <div className="hod-char-count">{(watchEdit('description') || '').length}/500</div>
                  {editErrors.description && <span className="hod-error">{editErrors.description.message}</span>}
                </div>

                <div className="hod-field">
                  <label className="hod-label">Address *</label>
                  <input className="hod-input" placeholder="Address" {...regEdit('address')} />
                  {editErrors.address && <span className="hod-error">{editErrors.address.message}</span>}
                </div>

                <div className="hod-field-row">
                  <div className="hod-field">
                    <label className="hod-label">City *</label>
                    <input className="hod-input" placeholder="City" {...regEdit('city')} />
                    {editErrors.city && <span className="hod-error">{editErrors.city.message}</span>}
                  </div>
                  <div className="hod-field">
                    <label className="hod-label">Country *</label>
                    <input className="hod-input" placeholder="Country" {...regEdit('country')} />
                    {editErrors.country && <span className="hod-error">{editErrors.country.message}</span>}
                  </div>
                </div>

                <div className="hod-field">
                  <label className="hod-label">Price Range *</label>
                  <div className="hod-price-grid">
                    {PRICE_RANGES.map(pr => (
                      <button
                        key={pr}
                        type="button"
                        className={`hod-price-card ${watchEdit('price_range') === pr ? 'hod-price-card-active' : ''}`}
                        onClick={() => setEditValue('price_range', pr, { shouldValidate: true })}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                  {editErrors.price_range && <span className="hod-error">{editErrors.price_range.message}</span>}
                </div>

                <div className="hod-field">
                  <label className="hod-label">Travel Purposes</label>
                  <div className="hod-chip-grid">
                    {TRAVEL_PURPOSES.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`hod-chip ${editTravelPurposes.includes(p) ? 'hod-chip-active' : ''}`}
                        onClick={() => toggleEditPurpose(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hod-field">
                  <label className="hod-label">Amenities</label>
                  <div className="hod-chip-grid">
                    {AMENITIES.map(a => (
                      <button
                        key={a}
                        type="button"
                        className={`hod-chip ${editAmenities.includes(a) ? 'hod-chip-active' : ''}`}
                        onClick={() => toggleEditAmenity(a)}
                      >
                        {a}
                      </button>
                    ))}
                    {editAmenities.length > 0 && <span className="hod-chip-count">{editAmenities.length} selected</span>}
                  </div>
                </div>

                {editError && (
                  <div className="hod-banner hod-banner-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.33" stroke="#D32F2F" strokeWidth="1.33"/>
                      <path d="M8 5V8.67" stroke="#D32F2F" strokeWidth="1.33" strokeLinecap="round"/>
                      <circle cx="8" cy="11" r="0.67" fill="#D32F2F"/>
                    </svg>
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="hod-banner hod-banner-success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.33" stroke="#059669" strokeWidth="1.33"/>
                      <path d="M5 8.2L7 10.2L11 6" stroke="#059669" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {editSuccess}
                  </div>
                )}

                <div className="hod-modal-footer">
                  <button type="button" className="hod-btn hod-btn-cancel" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="hod-btn hod-btn-submit" disabled={updateHotel.isPending}>
                    {updateHotel.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
