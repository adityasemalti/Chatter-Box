import { create } from 'zustand';
import api from '../axios/axios.js';

export const userStore = create((set) => ({
  authUser: null,
  otherUsers: null,
  selectedUser:null,
  isRegistering:false,
  isLoggingIn:false,
  isLoggingOut:false,
  loading: false,
  setSelectedUser: (user) => set({ selectedUser: user }),
  login: async (data) => {
    set({
      isLoggingIn: true
    })
    try {
      const response = await api.post('/api/user/login', data, { withCredentials: true });
      set({ authUser: response.data.user });
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      throw err;
    }
    finally{
      set({ isLoggingIn:false})
    }
  },

  register: async (data) => {
    set({ isRegistering: true });
    try {
      const response = await api.post('/api/user/register', data, { withCredentials: true });
      set({ authUser: response.data.user });
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      throw err;
    }
    finally{
      set({ isRegistering:false}) }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await api.post('/api/user/logout', null, { withCredentials: true });
      set({ authUser: null });
    } catch (err) {
      console.error('Logout failed:', err.response?.data || err.message);
    }
    finally{
       set({ isLoggingOut:false})
    }
  },

  getOtherUsers: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/api/user/getOtherUsers', { withCredentials: true });
      set({ otherUsers: response.data });
    } catch (err) {
      console.error('Fetching other users failed:', err.response?.data || err.message);
    }
    finally{ set({ loading:false})}
  },

  updateProfile: async (data) => {
    set({ loading: true})
    try {
      const response = await api.post('/api/user/update-profile', data, { withCredentials: true });
      set({ authUser: response.data.user });
    } catch (err) {
      console.error('Profile update failed:', err.response?.data || err.message);
      throw err;
    } finally{ set({ loading:false}) }
  },
  checkAuth: async () => {
  try {
    const res = await api.get('/api/user/check', { withCredentials: true });
    set({ authUser: res.data }); 
  }catch(error)
  {
    console.log(error.message)
  }
}
}));
