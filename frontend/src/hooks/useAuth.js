import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../utils/api';

export function useLogin() {
  return useMutation({
    mutationFn: (data) => authAPI.login(data).then(r => r.data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data) => authAPI.register(data).then(r => r.data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authAPI.logout().then(r => r.data),
  });
}

export function useCheckSession() {
  return useMutation({
    mutationFn: () => authAPI.checkSession().then(r => r.data),
  });
}
