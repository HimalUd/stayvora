/*
Run this in the browser console (F12 → Console tab) to seed dummy data:

  fetch('/seed-dummy-data.js')
    .then(r => r.text())
    .then(eval);

Or just copy-paste the entire content below into the console.
*/

(function seedDummyData() {
  // --- Hotel Owner ---
  const hotels = [
    {
      id: Date.now(),
      hotelName: 'Grand Plaza Hotel',
      email: 'owner@grandplaza.com',
      password: 'password123',
      phone: '+1 234 567 8900',
      address: '123 Main Street',
      city: 'New York',
      country: 'United States',
      description: 'A luxury 5-star hotel in the heart of Manhattan with stunning skyline views.',
      amenities: 'Free WiFi, Swimming Pool, Gym, Spa, Restaurant, Bar, Room Service, Parking',
      rating: 5,
      events: [
        { name: 'Summer Pool Party', date: '2026-07-15', description: 'Annual pool party with live music and cocktails' },
        { name: 'Wine Tasting Evening', date: '2026-08-20', description: 'Exclusive wine tasting featuring local vineyards' }
      ],
      destinations: [
        { name: 'Central Park', distance: '1.5 km', description: 'Iconic urban park with walking trails and attractions' },
        { name: 'Times Square', distance: '2 km', description: 'Famous commercial hub with theaters and billboards' }
      ],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600'
      ],
      registeredAt: new Date().toISOString()
    }
  ];
  localStorage.setItem('stayvora_hotels', JSON.stringify(hotels));

  // --- Bookings ---
  const bookings = [
    {
      bookingCode: 'BK001',
      hotelId: '1',
      hotelName: 'Grand Plaza Hotel',
      hotelLocation: 'New York',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      roomType: 'Deluxe Suite',
      roomNumber: '#305',
      checkIn: 'Mon, Jun 15, 2026',
      checkOut: 'Thu, Jun 18, 2026',
      guests: 2,
      nights: 3,
      total: 450,
      specialRequests: 'Late check-in requested (around 10 PM)',
      status: 'confirmed',
      bookedAt: new Date('2026-06-10').toISOString()
    },
    {
      bookingCode: 'BK002',
      hotelId: '1',
      hotelName: 'Grand Plaza Hotel',
      hotelLocation: 'New York',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.c@email.com',
      phone: '+1 (555) 234-5678',
      roomType: 'Standard Room',
      roomNumber: '#201',
      checkIn: 'Fri, Jun 12, 2026',
      checkOut: 'Sun, Jun 14, 2026',
      guests: 1,
      nights: 2,
      total: 200,
      specialRequests: 'Extra pillows please',
      status: 'checked_in',
      bookedAt: new Date('2026-06-08').toISOString()
    },
    {
      bookingCode: 'BK003',
      hotelId: '1',
      hotelName: 'Grand Plaza Hotel',
      hotelLocation: 'New York',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      roomType: 'Family Suite',
      roomNumber: '#402',
      checkIn: 'Mon, Jun 8, 2026',
      checkOut: 'Wed, Jun 10, 2026',
      guests: 4,
      nights: 2,
      total: 600,
      specialRequests: 'Need baby cot in the room',
      status: 'checked_out',
      bookedAt: new Date('2026-06-05').toISOString()
    },
    {
      bookingCode: 'BK004',
      hotelId: '1',
      hotelName: 'Grand Plaza Hotel',
      hotelLocation: 'New York',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.k@email.com',
      phone: '+1 (555) 456-7890',
      roomType: 'Executive Suite',
      roomNumber: '#501',
      checkIn: 'Sat, Jun 20, 2026',
      checkOut: 'Thu, Jun 25, 2026',
      guests: 2,
      nights: 5,
      total: 850,
      specialRequests: 'Airport pickup needed',
      status: 'confirmed',
      bookedAt: new Date('2026-06-15').toISOString()
    }
  ];
  localStorage.setItem('stayvora_bookings', JSON.stringify(bookings));

  console.log('✅ Dummy data seeded!');
  console.log('📧 Email: owner@grandplaza.com');
  console.log('🔑 Password: password123');
  console.log('Open /hotel-owner-login to sign in.');
})();
