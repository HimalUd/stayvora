import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HotelOwnerRegister.css';

const STAR_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z" stroke="#99A1AF" strokeWidth="1.33"/>
  </svg>
);

const STAR_SVG_FILLED = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FDC700">
    <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z"/>
  </svg>
);

const STEP_LABELS = ['Hotel Details', 'Events', 'Destinations', 'Images'];

export default function HotelOwnerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [events, setEvents] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [images, setImages] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    hotelName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    country: '',
    description: '',
    amenities: '',
  });

  const [eventForm, setEventForm] = useState({ name: '', date: '', description: '' });
  const [destForm, setDestForm] = useState({ name: '', distance: '', description: '' });
  const [imageUrl, setImageUrl] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addEvent = () => {
    if (!eventForm.name || !eventForm.date) return;
    setEvents(prev => [...prev, { ...eventForm, id: Date.now() }]);
    setEventForm({ name: '', date: '', description: '' });
  };

  const addDestination = () => {
    if (!destForm.name || !destForm.distance) return;
    setDestinations(prev => [...prev, { ...destForm, id: Date.now() }]);
    setDestForm({ name: '', distance: '', description: '' });
  };

  const addImage = () => {
    if (!imageUrl) return;
    setImages(prev => [...prev, imageUrl]);
    setImageUrl('');
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const completeRegistration = () => {
    const registration = {
      id: Date.now(),
      ...form,
      rating,
      events,
      destinations,
      images,
      registeredAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('stayvora_hotels') || '[]');
    existing.push(registration);
    localStorage.setItem('stayvora_hotels', JSON.stringify(existing));
    setShowSuccess(true);
  };

  const renderStars = () => (
    <div className="hor-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="hor-star" onClick={() => setRating(i)}>
          {i <= rating ? STAR_SVG_FILLED : STAR_SVG}
        </span>
      ))}
    </div>
  );

  return (
    <div className="hor-page">
      <div className="hor-bg">
        <div className="hor-center">
          <div className="hor-content">

            {/* HEADER */}
            <h1 className="hor-title">Register Your Hotel</h1>
            <p className="hor-subtitle">Join our platform and reach thousands of travelers</p>
            <p className="hor-login-text">
              Already registered? <Link to="/hotel-owner-login" className="hor-login-link">Login here</Link>
            </p>

            {/* CARD */}
            <div className="hor-card">
              <div className="hor-card-header">
                <div className="hor-card-title">Hotel Registration</div>
                <div className="hor-card-desc">Complete all steps to register your hotel</div>
              </div>

              {/* STEPS TABS */}
              <div className="hor-steps-tabs">
                <div className="hor-steps-track">
                  {STEP_LABELS.map((label, i) => (
                    <div
                      key={i}
                      className={`hor-step-tab ${i === step ? 'hor-step-tab-active' : ''}`}
                      style={{ left: i * 243 + 3 }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== STEP 0: HOTEL DETAILS ===== */}
              {step === 0 && (
                <div className="hor-form-body">
                  <div className="hor-row">
                    <div className="hor-field">
                      <label className="hor-label">Hotel Name *</label>
                      <input className="hor-input" placeholder="Grand Plaza Hotel" value={form.hotelName} onChange={e => update('hotelName', e.target.value)} />
                    </div>
                    <div className="hor-field">
                      <label className="hor-label">Star Rating *</label>
                      {renderStars()}
                    </div>
                  </div>
                  <div className="hor-row">
                    <div className="hor-field">
                      <label className="hor-label">Email *</label>
                      <input className="hor-input" placeholder="contact@grandplaza.com" value={form.email} onChange={e => update('email', e.target.value)} />
                    </div>
                    <div className="hor-field">
                      <label className="hor-label">Password *</label>
                      <input type="password" className="hor-input" placeholder="Enter a password" value={form.password} onChange={e => update('password', e.target.value)} />
                    </div>
                  </div>
                  <div className="hor-row">
                    <div className="hor-field">
                      <label className="hor-label">Phone *</label>
                      <input className="hor-input" placeholder="+1 234 567 8900" value={form.phone} onChange={e => update('phone', e.target.value)} />
                    </div>
                    <div className="hor-field" />
                  </div>
                  <div className="hor-field hor-field-full">
                    <label className="hor-label">Address *</label>
                    <input className="hor-input" placeholder="123 Main Street" value={form.address} onChange={e => update('address', e.target.value)} />
                  </div>
                  <div className="hor-row">
                    <div className="hor-field">
                      <label className="hor-label">City *</label>
                      <input className="hor-input" placeholder="New York" value={form.city} onChange={e => update('city', e.target.value)} />
                    </div>
                    <div className="hor-field">
                      <label className="hor-label">Country *</label>
                      <input className="hor-input" placeholder="United States" value={form.country} onChange={e => update('country', e.target.value)} />
                    </div>
                  </div>
                  <div className="hor-field hor-field-full">
                    <label className="hor-label">Description *</label>
                    <textarea className="hor-textarea" placeholder="Describe your hotel, its unique features, and what makes it special..." value={form.description} onChange={e => update('description', e.target.value)} />
                  </div>
                  <div className="hor-field hor-field-full">
                    <label className="hor-label">Amenities</label>
                    <div className="hor-amenity-row">
                      <input className="hor-input hor-input-amenity" placeholder="e.g., Free WiFi, Pool, Gym" value={form.amenities} onChange={e => update('amenities', e.target.value)} />
                    </div>
                  </div>
                  <div className="hor-actions">
                    <button className="hor-btn hor-btn-next" onClick={() => setStep(1)}>Next: Events</button>
                  </div>
                </div>
              )}

              {/* ===== STEP 1: EVENTS ===== */}
              {step === 1 && (
                <div className="hor-form-body">
                  <div className="hor-sub-card">
                    <div className="hor-card-header">
                      <div className="hor-card-title">Add Events</div>
                      <div className="hor-card-desc">Add events and activities conducted at your hotel</div>
                    </div>
                    <div className="hor-events-form">
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Event Name</label>
                        <input className="hor-input" placeholder="e.g., Summer Pool Party" value={eventForm.name} onChange={e => setEventForm(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Event Date</label>
                        <input type="date" className="hor-input" value={eventForm.date} onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))} />
                      </div>
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Event Description</label>
                        <textarea className="hor-textarea" placeholder="Describe the event..." value={eventForm.description} onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} />
                      </div>
                      <button className="hor-btn hor-btn-add" onClick={addEvent}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.33"/>
                          <rect x="5.33" y="7.33" width="5.33" height="1.33" fill="white"/>
                          <rect x="7.33" y="5.33" width="1.33" height="5.33" fill="white"/>
                        </svg>
                        Add Event
                      </button>
                      {events.length > 0 && (
                        <div className="hor-tags">
                          {events.map(e => (
                            <span key={e.id} className="hor-tag">{e.name} - {e.date}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hor-actions hor-actions-between">
                    <button className="hor-btn hor-btn-prev" onClick={() => setStep(0)}>Previous</button>
                    <button className="hor-btn hor-btn-next" onClick={() => setStep(2)}>Next: Destinations</button>
                  </div>
                </div>
              )}

              {/* ===== STEP 2: DESTINATIONS ===== */}
              {step === 2 && (
                <div className="hor-form-body">
                  <div className="hor-sub-card">
                    <div className="hor-card-header">
                      <div className="hor-card-title">Nearby Destinations</div>
                      <div className="hor-card-desc">Add popular travel destinations near your hotel</div>
                    </div>
                    <div className="hor-dest-form">
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Destination Name</label>
                        <input className="hor-input" placeholder="e.g., Central Park" value={destForm.name} onChange={e => setDestForm(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Distance from Hotel</label>
                        <input className="hor-input" placeholder="e.g., 2.5 km or 15 min walk" value={destForm.distance} onChange={e => setDestForm(prev => ({ ...prev, distance: e.target.value }))} />
                      </div>
                      <div className="hor-field hor-field-full">
                        <label className="hor-label">Description</label>
                        <textarea className="hor-textarea" placeholder="Describe the destination..." value={destForm.description} onChange={e => setDestForm(prev => ({ ...prev, description: e.target.value }))} />
                      </div>
                      <button className="hor-btn hor-btn-add" onClick={addDestination}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.33"/>
                          <rect x="5.33" y="7.33" width="5.33" height="1.33" fill="white"/>
                          <rect x="7.33" y="5.33" width="1.33" height="5.33" fill="white"/>
                        </svg>
                        Add Destination
                      </button>
                      {destinations.length > 0 && (
                        <div className="hor-tags">
                          {destinations.map(d => (
                            <span key={d.id} className="hor-tag">{d.name} - {d.distance}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hor-actions hor-actions-between">
                    <button className="hor-btn hor-btn-prev" onClick={() => setStep(1)}>Previous</button>
                    <button className="hor-btn hor-btn-next" onClick={() => setStep(3)}>Next: Images</button>
                  </div>
                </div>
              )}

              {/* ===== STEP 3: IMAGES ===== */}
              {step === 3 && (
                <div className="hor-form-body">
                  <div className="hor-sub-card">
                    <div className="hor-card-header">
                      <div className="hor-card-title">Hotel Images</div>
                      <div className="hor-card-desc">Add images of your hotel (URL format)</div>
                    </div>
                    <div className="hor-image-add">
                      <input className="hor-input hor-input-url" placeholder="Enter image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                      <button className="hor-btn hor-btn-add-small" onClick={addImage}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="10" width="12" height="4" stroke="white" strokeWidth="1.33"/>
                          <rect x="4.67" y="2" width="6.67" height="3.33" stroke="white" strokeWidth="1.33"/>
                        </svg>
                        Add
                      </button>
                    </div>
                    <div className="hor-image-area">
                      {images.length === 0 ? (
                        <div className="hor-image-empty">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect x="6" y="6" width="36" height="36" rx="4" stroke="#99A1AF" strokeWidth="4"/>
                            <rect x="14" y="14" width="8" height="8" rx="4" stroke="#99A1AF" strokeWidth="4"/>
                            <rect x="12" y="22.66" width="30" height="19.34" rx="2" stroke="#99A1AF" strokeWidth="4"/>
                          </svg>
                          <p className="hor-image-empty-text">No images added yet</p>
                        </div>
                      ) : (
                        <div className="hor-image-grid">
                          {images.map((url, i) => (
                            <div key={i} className="hor-image-thumb">
                              <img src={url} alt="" />
                              <button className="hor-image-remove" onClick={() => removeImage(i)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hor-actions hor-actions-between">
                    <button className="hor-btn hor-btn-prev" onClick={() => setStep(2)}>Previous</button>
                    <button className="hor-btn hor-btn-complete" onClick={completeRegistration}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="4" y="1.33" width="8" height="13.33" rx="1.33" stroke="white" strokeWidth="1.33"/>
                        <rect x="1.33" y="8" width="2.67" height="6.67" rx="1.33" stroke="white" strokeWidth="1.33"/>
                        <rect x="12" y="6" width="2.67" height="8.67" rx="1.33" stroke="white" strokeWidth="1.33"/>
                      </svg>
                      Complete Registration
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ===== SUCCESS OVERLAY ===== */}
      {showSuccess && (
        <div className="hor-overlay" onClick={() => setShowSuccess(false)}>
          <div className="hor-overlay-card" onClick={e => e.stopPropagation()}>
            <div className="hor-success-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="6.67" y="6.66" width="66.67" height="66.67" rx="33.33" stroke="#00A63E" strokeWidth="6.67"/>
                <rect x="30" y="13.33" width="43.33" height="33.33" rx="4" stroke="#00A63E" strokeWidth="6.67"/>
              </svg>
            </div>
            <h2 className="hor-success-title">Registration Successfully!</h2>
            <p className="hor-success-text">Your Registration has been successfully confirmed</p>
            <button className="hor-dashboard-btn" onClick={() => navigate('/hotel-owner-dashboard')}>Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
