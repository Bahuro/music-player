<template>
  <div class="register-view">
    <h1>Crear cuenta</h1>
    
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label for="username">Usuario</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          placeholder="Ingresa tu nombre de usuario"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="Ingresa tu correo electrónico"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="confirmPassword" 
          placeholder="Confirma tu contraseña"
          required
        />
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" class="register-btn">Crear cuenta</button>
    </form>
    
    <p class="login-link">
      ¿Ya tienes una cuenta? <a href="#" @click.prevent="navigateToLogin">Iniciar sesión</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user.js';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

const register = () => {
  // Validar que las contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  // Validar longitud de contraseña
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }
  
  // Limpiar error previo
  error.value = '';
  
  // En una aplicación real, aquí harías una llamada a la API
  console.log('Registrando usuario:', username.value, email.value);
  
  // Crear objeto de usuario
  const userData = {
    id: Date.now().toString(), // Simulamos un ID único
    username: username.value,
    email: email.value,
    // No almacenar la contraseña en texto plano en una app real
  };
  
  // Simular token de autenticación
  const tokenValue = `token_${Date.now()}`;
  
  // Guardar en el store y localStorage
  userStore.login(userData, tokenValue);
  localStorage.setItem('isLoggedIn', 'true');
  
  // Redirigir a la página principal
  router.push('/');
};

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.register-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.register-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--background-color-light);
      color: var(--text-color);
      
      &:focus {
        outline: none;
        border-color: var(--accent-color);
      }
    }
  }
  
  .error-message {
    color: #e53e3e;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(229, 62, 62, 0.1);
    border-radius: 4px;
    text-align: center;
  }
  
  .register-btn {
    width: 100%;
    padding: 0.8rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #19a34a;
    }
  }
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--secondary-color);
  
  a {
    color: var(--accent-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>