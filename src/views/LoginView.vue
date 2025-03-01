<template>
  <div class="login-view">
    <h1>Iniciar sesión</h1>
    
    <form @submit.prevent="login" class="login-form">
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
        <label for="password">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>
      
      <button type="submit" class="login-btn">Iniciar sesión</button>
    </form>
    
    <p class="register-link">
      ¿No tienes una cuenta? <a href="#" @click.prevent="register">Regístrate</a>
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
const password = ref('');

const login = () => {
  // En una aplicación real, aquí harías una llamada a la API
  console.log('Iniciando sesión con:', username.value, password.value);
  
  // Simular inicio de sesión exitoso
  const userData = {
    id: Date.now().toString(), // Simulamos un ID único
    username: username.value,
    // En una aplicación real, no almacenarías la contraseña
  };
  
  // Simular token de autenticación
  const tokenValue = `token_${Date.now()}`;
  
  // Usar el store para manejar el login
  userStore.login(userData, tokenValue);
  localStorage.setItem('isLoggedIn', 'true');
  
  // Redirigir a la página principal
  router.push('/');
};

const register = () => {
  // Redirigir a la página de registro
  router.push('/register');
};
</script>

<style lang="scss" scoped>
.login-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.login-form {
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
  
  .login-btn {
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

.register-link {
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