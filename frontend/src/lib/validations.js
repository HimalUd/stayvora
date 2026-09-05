import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine((value) => /^\+94\d{9}$/.test(value), 'Phone must be a Sri Lanka number in +94 format, e.g. +94 77 123 4567'),
  role: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const bookingSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  check_in: z.string().min(1, 'Check-in date is required'),
  check_out: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest'),
  special_requests: z.string().optional(),
});

export const ownerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine((value) => /^\+94\d{9}$/.test(value), 'Phone must be a Sri Lanka number in +94 format, e.g. +94 77 123 4567'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const hotelRegistrationSchema = z.object({
  hotelName: z.string().min(2, 'Hotel name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine((value) => /^\+94\d{9}$/.test(value), 'Phone must be a Sri Lanka number in +94 format, e.g. +94 77 123 4567'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().min(1, 'Description is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
