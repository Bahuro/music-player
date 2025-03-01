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
          autocomplete="username"
          maxlength="50"
          @input="validateUsername"
        />
        <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña</label>
        <div class="password-input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            placeholder="Ingresa tu contraseña"
            required
            autocomplete="current-password"
            @input="validatePassword"
          />
          <button 
            type="button" 
            class="toggle-password" 
            @click="togglePasswordVisibility"
            aria-label="Toggle password visibility"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </div>
      
      <div v-if="loginError" class="error-message login-error">
        {{ loginError }}
      </div>
      
      <button type="submit" class="login-btn" :disabled="isSubmitting">{{ isSubmitting ? 'Procesando...' : 'Iniciar sesión' }}</button>
    </form>
    
    <p class="register-link">
      ¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link>
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
const usernameError = ref('');
const passwordError = ref('');
const loginError = ref('');
const isSubmitting = ref(false);
const showPassword = ref(false);

// Validación de nombre de usuario
const validateUsername = () => {
  usernameError.value = '';
  
  if (username.value.length < 3) {
    usernameError.value = 'El nombre de usuario debe tener al menos 3 caracteres';
    return false;
  }
  
  // Verificar caracteres válidos (letras, números, guiones y guiones bajos)
  const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validUsernameRegex.test(username.value)) {
    usernameError.value = 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos';
    return false;
  }
  
  return true;
};

// Validación de contraseña
const validatePassword = () => {
  passwordError.value = '';
  
  if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
    return false;
  }
  
  return true;
};

// Mostrar/ocultar contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const login = async () => {
  // Validar campos antes de enviar
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  
  if (!isUsernameValid || !isPasswordValid) {
    return;
  }
  
  // Limpiar errores previos
  loginError.value = '';
  isSubmitting.value = true;
  
  try {
    // En una aplicación real, aquí harías una llamada a la API
    console.log('Iniciando sesión con:', username.value);
    
    // Simular un pequeño retraso para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    loginError.value = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
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
  
  .password-input-container {
    position: relative;
    
    input {
      padding-right: 40px; // Space for the toggle button
    }
    
    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--secondary-color);
      
      &:hover {
        color: var(--accent-color);
      }
    }
  }
  
  .error-message {
    color: var(--error-color);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
  
  .login-error {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(229, 62, 62, 0.1);
    border-radius: 4px;
    text-align: center;
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
    
    &:hover:not(:disabled) {
      background-color: #19a34a;
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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