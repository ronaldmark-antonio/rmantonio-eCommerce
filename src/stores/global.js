import { defineStore } from 'pinia';
import { reactive } from 'vue';
import api from '../api';

export const useGlobalStore = defineStore('global', () => {
  let user = reactive({
    token: localStorage.getItem('token'),
    email: null,
    isAdmin: null,
    firstName: null,
    lastName: null
  });

  async function getUserDetails(token) {
    if (!token) {
      user.token = null;
      user.email = null;
      user.isAdmin = null;
      user.firstName = null;
      user.lastName = null;
      return;
    }

    try {
      const { data } = await api.get('https://rmantonio-ecommerceapi.onrender.com/users/details', {
        headers: { Authorization: `Bearer ${token}` }
      });

      user.token = token;
      user.email = data.user.email;
      user.isAdmin = data.user.isAdmin;
      user.firstName = data.user.firstName;
      user.lastName = data.user.lastName;
    } catch (err) {
      console.error('Failed to fetch user details', err);
      user.token = null;
      user.email = null;
      user.isAdmin = null;
      user.firstName = null;
      user.lastName = null;
    }
  }

  return {
    user,
    getUserDetails
  };
});
