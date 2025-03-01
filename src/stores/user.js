import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  // Estado
  const user = ref(null);
  const token = ref(null);
  
  // Getters
  const isLoggedIn = computed(() => !!user.value);
  
  // Acciones
  function setUser(userData) {
    user.value = userData;
    saveUserToStorage();
  }
  
  function setToken(tokenValue) {
    token.value = tokenValue;
    localStorage.setItem('musicPlayerToken', tokenValue);
  }
  
  function login(userData, tokenValue) {
    setUser(userData);
    setToken(tokenValue);
  }
  
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('musicPlayerToken');
    localStorage.removeItem('musicPlayerUser');
    localStorage.removeItem('isLoggedIn');
  }
  
  function saveUserToStorage() {
    try {
      localStorage.setItem('musicPlayerUser', JSON.stringify(user.value));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }
  
  function loadUserFromStorage() {
    try {
      const storedUser = localStorage.getItem('musicPlayerUser');
      const storedToken = localStorage.getItem('musicPlayerToken');
      
      if (storedUser) {
        user.value = JSON.parse(storedUser);
      }
      
      if (storedToken) {
        token.value = storedToken;
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }
  
  // Cargar usuario al inicializar el store
  loadUserFromStorage();
  
  return {
    // Estado
    user,
    token,
    
    // Getters
    isLoggedIn,
    
    // Acciones
    login,
    logout,
    setUser,
    setToken
  };
});