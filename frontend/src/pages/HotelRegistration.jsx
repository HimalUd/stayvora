import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { hotelsAPI } from '../utils/api';
import { TRAVEL_PURPOSES } from '../lib/travelPurposes';
import { AMENITIES } from '../lib/amenities';
import './HotelRegistration.css';

const PRICE_RANGES = [
  { value: 'Budget', label: 'Budget', hint: 'Under Rs. 15,000 / night', icon: '₹' },
  { value: 'Mid-range', label: 'Mid-range', hint: 'Rs. 15,000 – Rs. 50,000 / night', icon: '₹₹' },
  { value: 'Luxury', label: 'Luxury', hint: 'Over Rs. 50,000 / night', icon: '₹₹₹' },
];

const hotelAddSchema = z.object({
  hotelName: z.string().min(2, 'Hotel name is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  priceRange: z.string().min(1, 'Select a price range'),
  travelPurposes: z.array(z.string()).min(1, 'Select at least one travel purpose'),
});

export default function HotelRegistration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [travelPurposes, setTravelPurposes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapSuccess, setMapSuccess] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(hotelAddSchema),
    defaultValues: {
      hotelName: '',
      description: '',
      address: '',
      city: '',
      priceRange: '',
      travelPurposes: [],
    },
  });

  const previewName = watch('hotelName');
  const previewCity = watch('city');
  const previewDescription = watch('description');

  const togglePurpose = (p) => {
    const next = travelPurposes.includes(p) ? travelPurposes.filter(x => x !== p) : [...travelPurposes, p];
    setTravelPurposes(next);
    setValue('travelPurposes', next, { shouldValidate: true });
  };

  const toggleAmenity = (a) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleExtractMap = async () => {
    setMapError('');
    setMapSuccess('');
    if (!mapUrl.trim()) {
      setMapError('Paste a Google Maps link first');
      return;
    }
    setExtracting(true);
    try {
      const res = await hotelsAPI.extractAddress(mapUrl.trim());
      const data = res.data;
      if (data.display_name) setValue('address', data.display_name, { shouldValidate: true });
      if (data.city) setValue('city', data.city, { shouldValidate: true });
      setMapSuccess('Address details fetched from the link! Review and adjust if needed.');
    } catch (err) {
      setMapError(err.response?.data?.message || 'Could not read that link. Paste a Google Maps share link.');
    } finally {
      setExtracting(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    try {
      const res = await hotelsAPI.create({
        name: data.hotelName,
        description: data.description,
        location: data.city,
        address: data.address,
        city: data.city,
        price_range: data.priceRange,
        rating,
        travel_purpose: travelPurposes.join(', '),
        amenities: amenities.join(', '),
        map_url: mapUrl.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ['hotels', 'owner'] });
      setSuccess('Hotel added successfully!');
      setTimeout(() => navigate('/hotel-owner-dashboard', {
        state: { selectHotelId: res.data?.hotel?.id },
      }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add hotel');
    }
  };

  return (
    <div className="hreg-page">
      <div className="hreg-topbar">
        <div className="hreg-topbar-inner">
          <button className="hreg-back-btn" onClick={() => navigate('/hotel-owner-dashboard')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <span className="hreg-topbar-title">Add Your Hotel</span>
        </div>
      </div>

      <div className="hreg-content">
        <div className="hreg-head">
          <div>
            <div className="hreg-eyebrow">Owner Tools</div>
            <h1 className="hreg-title">Add Your Hotel</h1>
            <p className="hreg-subtitle">Register your hotel on StayVora and start receiving bookings from travelers across Sri Lanka.</p>
          </div>
        </div>

        <div className="hreg-layout">
          {/* FORM */}
          <div className="hreg-form-card">
            <div className="hreg-form-header">
              <div className="hreg-form-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="hreg-form-title">Hotel Details</div>
                <div className="hreg-form-desc">You can manage rooms, images, events, and destinations later from your dashboard.</div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="hreg-form">
              <div className="hreg-field">
                <label className="hreg-label">Hotel Name *</label>
                <div className="hreg-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="1.33" width="10" height="13.33" rx="1.33" stroke="#90A1B9" strokeWidth="1.33"/>
                    <rect x="5.33" y="4" width="5.33" height="2" rx="0.67" stroke="#90A1B9" strokeWidth="1.33"/>
                  </svg>
                  <input className="hreg-input" placeholder="e.g. Grand Plaza Hotel, Colombo" {...register('hotelName')} />
                </div>
                {errors.hotelName && <span className="hreg-error">{errors.hotelName.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Star Rating</label>
                <div className="hreg-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`hreg-star ${i <= rating ? 'hreg-star-active' : ''}`}
                      onClick={() => setRating(i)}
                      aria-label={`${i} star`}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z"
                          fill={i <= rating ? '#F5A624' : 'none'}
                          stroke={i <= rating ? '#F5A624' : '#B7C2D4'}
                          strokeWidth="1.33"
                          strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                  <span className="hreg-stars-label">{rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap to select'}</span>
                </div>
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Description *</label>
                <div className="hreg-input-wrap">
                  <textarea
                    className="hreg-textarea"
                    placeholder="Describe your hotel, its unique features, and what makes it special..."
                    rows={4}
                    maxLength={500}
                    {...register('description')}
                  />
                </div>
                <div className="hreg-char-count">{(previewDescription || '').length}/500</div>
                {errors.description && <span className="hreg-error">{errors.description.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Address *</label>
                <div className="hreg-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 5L8 2L14 5V13.5C14 13.7761 13.7761 14 13.5 14H2.5C2.22386 14 2 13.7761 2 13.5V5Z" stroke="#90A1B9" strokeWidth="1.33"/>
                  </svg>
                  <input className="hreg-input" placeholder="e.g. 123 Main Street" {...register('address')} />
                </div>
                {errors.address && <span className="hreg-error">{errors.address.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Google Maps Link</label>
                <div className="hreg-input-wrap hreg-map-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14.5C8 14.5 13 10.5 13 6C13 3.2 10.8 1 8 1C5.2 1 3 3.2 3 6C3 10.5 8 14.5 8 14.5Z" stroke="#90A1B9" strokeWidth="1.33"/>
                    <circle cx="8" cy="6" r="2.67" stroke="#90A1B9" strokeWidth="1.33"/>
                    <path d="M8 9.67L8 12" stroke="#90A1B9" strokeWidth="1.33" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="hreg-input hreg-map-input"
                    placeholder="Paste Google Maps share link (auto-fills address, city)"
                    value={mapUrl}
                    onChange={e => setMapUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleExtractMap(); } }}
                  />
                  <button
                    type="button"
                    className="hreg-map-fetch"
                    onClick={handleExtractMap}
                    disabled={extracting}
                  >
                    {extracting ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
                {mapSuccess && (
                  <div className="hreg-banner hreg-banner-success" style={{ marginTop: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.33" stroke="#059669" strokeWidth="1.33"/>
                      <path d="M5 8.2L7 10.2L11 6" stroke="#059669" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {mapSuccess}
                  </div>
                )}
                {mapError && <span className="hreg-error">{mapError}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">City *</label>
                <div className="hreg-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="6" r="3.33" stroke="#90A1B9" strokeWidth="1.33"/>
                    <path d="M8 14.5C8 14.5 13 10.5 13 6C13 3.2 10.8 1 8 1C5.2 1 3 3.2 3 6C3 10.5 8 14.5 8 14.5Z" stroke="#90A1B9" strokeWidth="1.33"/>
                  </svg>
                  <input className="hreg-input" placeholder="e.g. Mirissa" {...register('city')} />
                </div>
                {errors.city && <span className="hreg-error">{errors.city.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Price Range *</label>
                <div className="hreg-price-grid">
                  {PRICE_RANGES.map(pr => (
                    <button
                      key={pr.value}
                      type="button"
                      className={`hreg-price ${watch('priceRange') === pr.value ? 'hreg-price-active' : ''}`}
                      onClick={() => setValue('priceRange', pr.value, { shouldValidate: true })}
                    >
                      <span className="hreg-price-icon">{pr.icon}</span>
                      <span className="hreg-price-name">{pr.label}</span>
                      <span className="hreg-price-hint">{pr.hint}</span>
                    </button>
                  ))}
                </div>
                {errors.priceRange && <span className="hreg-error">{errors.priceRange.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Special offers for *</label>
                <div className="hreg-chip-grid">
                  {TRAVEL_PURPOSES.map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`hreg-chip ${travelPurposes.includes(p) ? 'hreg-chip-active' : ''}`}
                      onClick={() => togglePurpose(p)}
                    >
                      {travelPurposes.includes(p) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L4.8 8.8L9.5 3.8" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {p}
                    </button>
                  ))}
                </div>
                {errors.travelPurposes && <span className="hreg-error">{errors.travelPurposes.message}</span>}
              </div>

              <div className="hreg-field">
                <label className="hreg-label">Amenities <span className="hreg-optional">(optional)</span></label>
                <div className="hreg-chip-grid hreg-chip-grid-3">
                  {AMENITIES.map(a => (
                    <button
                      key={a}
                      type="button"
                      className={`hreg-chip ${amenities.includes(a) ? 'hreg-chip-active' : ''}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {amenities.includes(a) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L4.8 8.8L9.5 3.8" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {a}
                    </button>
                  ))}
                </div>
                {amenities.length > 0 && <div className="hreg-selected-count">{amenities.length} selected</div>}
              </div>

              {error && (
                <div className="hreg-banner hreg-banner-error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.33" stroke="#D32F2F" strokeWidth="1.33"/>
                    <path d="M8 5V8.67" stroke="#D32F2F" strokeWidth="1.33" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.67" fill="#D32F2F"/>
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="hreg-banner hreg-banner-success">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.33" stroke="#059669" strokeWidth="1.33"/>
                    <path d="M5 8.2L7 10.2L11 6" stroke="#059669" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {success} Redirecting to your dashboard...
                </div>
              )}

              <div className="hreg-actions">
                <button
                  type="button"
                  className="hreg-btn hreg-btn-cancel"
                  onClick={() => navigate('/hotel-owner-dashboard')}
                >
                  Cancel
                </button>
                <button type="submit" className="hreg-btn hreg-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Hotel'}
                  {!isSubmitting && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* LIVE PREVIEW */}
          <div className="hreg-preview-wrap">
            <div className="hreg-preview-label">
              <span className="hreg-preview-dot" />
              Live Preview
            </div>
            <div className="hreg-preview">
              <div className="hreg-preview-top">
                {previewName ? (
                  <div className="hreg-preview-avatar">{(previewName || 'H').charAt(0).toUpperCase()}</div>
                ) : (
                  <div className="hreg-preview-avatar hreg-preview-avatar-empty">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="5" y="1.67" width="10" height="16.67" rx="1.67" stroke="#5B6B85" strokeWidth="1.67"/>
                      <rect x="1.67" y="10" width="3.33" height="8.33" rx="1.67" stroke="#5B6B85" strokeWidth="1.67"/>
                      <rect x="15" y="7.50" width="3.33" height="10.83" rx="1.67" stroke="#5B6B85" strokeWidth="1.67"/>
                    </svg>
                  </div>
                )}
                <div className="hreg-preview-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z"
                        fill={i <= rating ? '#F5A624' : 'none'}
                        stroke="#F5A624"
                        strokeWidth="1.33"
                        strokeLinejoin="round"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="hreg-preview-name">{previewName || 'Your Hotel Name'}</div>
              <div className="hreg-preview-location">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14.5C8 14.5 13 10.5 13 6C13 3.2 10.8 1 8 1C5.2 1 3 3.2 3 6C3 10.5 8 14.5 8 14.5Z" stroke="#93A5C3" strokeWidth="1.33"/>
                  <circle cx="8" cy="6" r="2" stroke="#93A5C3" strokeWidth="1.33"/>
                </svg>
                {previewCity || 'City'}
              </div>
              <div className="hreg-preview-desc">
                {previewDescription || 'Your hotel description will appear here as you type. Travelers use this to decide where to stay.'}
              </div>
              {(travelPurposes.length > 0 || amenities.length > 0) && (
                <div className="hreg-preview-chips">
                  {travelPurposes.map(p => (
                    <span key={p} className="hreg-preview-chip hreg-preview-chip-gold">{p}</span>
                  ))}
                  {amenities.slice(0, 4).map(a => (
                    <span key={a} className="hreg-preview-chip">{a}</span>
                  ))}
                  {amenities.length > 4 && <span className="hreg-preview-chip">+{amenities.length - 4} more</span>}
                </div>
              )}
              <div className="hreg-preview-foot">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.33" stroke="#F5A624" strokeWidth="1.33"/>
                  <path d="M5 8.2L7 10.2L11 6" stroke="#F5A624" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ready to receive bookings from travelers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}