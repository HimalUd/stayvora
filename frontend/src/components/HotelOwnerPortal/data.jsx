import {
  AnalyticsIcon,
  GlobeIcon,
  CalendarIcon,
  RevenueIcon,
  ShieldIcon,
  BellIcon,
  StatRevenueIcon,
  StatBookingsIcon,
  StatRatingIcon,
} from './icons';

export const features = [
  {
    icon: GlobeIcon,
    bg: '#DBEAFE',
    title: 'Local Reach, Islandwide',
    desc: 'Get discovered by travelers searching for stays in your area — from Colombo business trips to Ella hill escapes and Mirissa beach holidays.',
  },
  {
    icon: AnalyticsIcon,
    bg: '#F3E8FF',
    title: 'Seasonal Pricing Insights',
    desc: 'Understand how peak season (Dec–Apr) vs off-peak demand shapes your bookings, so you can price smart and fill rooms all year round.',
  },
  {
    icon: CalendarIcon,
    bg: '#DCFCE7',
    title: 'Booking Management',
    desc: 'Manage all reservations in one dashboard — confirm stays, filter by dates, and track every booking across your property.',
  },
  {
    icon: RevenueIcon,
    bg: '#FFEDD4',
    title: 'Revenue Tracking',
    desc: 'Monitor earnings per booking, spot your best-performing room types, and grow your monthly revenue with clear reports.',
  },
  {
    icon: ShieldIcon,
    bg: '#FCE7F3',
    title: 'Reputation & Reviews',
    desc: 'Build guest trust with verified reviews. Respond to feedback, improve your stay experience, and turn happy guests into repeat bookings.',
  },
  {
    icon: BellIcon,
    bg: '#E0E7FF',
    title: 'Instant Booking Alerts',
    desc: 'Get notified the moment a new booking lands, so you can confirm fast and never miss a reservation.',
  },
];

export const growthPoints = [
  {
    title: 'List for Free',
    desc: 'Register your hotel with photos, amenities and room details — no upfront costs, no listing fees.',
  },
  {
    title: 'Get Found by Travelers',
    desc: 'The moment a guest searches for stays in your city or area, your hotel appears in their results.',
  },
  {
    title: 'Turn Guests into Regulars',
    desc: 'Direct bookings, guest reviews and your own dashboard help you build long-term relationships and repeat stays.',
  },
];

export const steps = [
  {
    num: '1',
    bg: '#F5A623',
    title: 'Register Your Hotel',
    desc: 'Fill in your hotel details, amenities, and upload photos. Takes less than 10 minutes.',
  },
  {
    num: '2',
    bg: '#155DFC',
    title: 'Get Discovered',
    desc: 'Your hotel appears in search results for travelers looking in your area.',
  },
  {
    num: '3',
    bg: '#00A63E',
    title: 'Manage & Grow',
    desc: 'Receive bookings, manage reservations, and watch your business grow.',
  },
];

export const stats = [
  { value: '50+', label: 'Partner Hotels' },
  { value: '50+', label: 'Bookings Monthly' },
  { value: '2M+ LKR', label: 'Revenue Generated' },
  { value: '4.9★', label: 'Average Rating' },
];

export const heroStats = [
  {
    label: 'Monthly Revenue',
    value: '100000+ LKR',
    valueClass: 'hop-stat-value-blue',
    boxClass: 'hop-stat-purple',
    icon: StatRevenueIcon,
  },
  {
    label: 'Total Bookings',
    value: '187',
    valueClass: 'hop-stat-value-gold',
    boxClass: 'hop-stat-yellow',
    icon: StatBookingsIcon,
  },
  {
    label: 'Guest Satisfaction',
    value: '4.8',
    valueClass: 'hop-stat-value-blue',
    boxClass: 'hop-stat-blue',
    icon: StatRatingIcon,
    stars: true,
  },
];

export const testimonials = [
  {
    text: '"Since joining this platform, our bookings have increased by 150%. The dashboard makes it so easy to manage everything in one place."',
    name: 'Nuwan Perera',
    hotel: 'Sunset Villa - Mirissa',
    iconBg: '#F3E8FF',
    iconColor: '#9810FA',
  },
  {
    text: '"The real-time analytics help us make better business decisions. We can track everything from revenue to guest satisfaction effortlessly."',
    name: 'Chamari Silva',
    hotel: 'Ocean Pearl - Galle',
    iconBg: '#DBEAFE',
    iconColor: '#155DFC',
  },
  {
    text: '"Simple to use, powerful features, and excellent support. This platform has transformed how we manage our hotel business."',
    name: 'Kasun Fernando',
    hotel: 'Ella Rock Retreat',
    iconBg: '#DCFCE7',
    iconColor: '#00A63E',
  },
];
