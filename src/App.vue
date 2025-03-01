<template>
  <div class="app-container" :data-theme="theme">
    <header class="app-header">
      <div class="logo">
        <h1>MusicStream</h1>
      </div>
      <nav class="main-nav">
        <router-link to="/">Home</router-link>
        <router-link to="/search">Search</router-link>
        <router-link to="/library">Library</router-link>
      </nav>
      <div class="user-controls">
        <button @click="toggleTheme" class="theme-toggle">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <router-link to="/login" v-if="!isLoggedIn">Login</router-link>
        <div v-else class="user-menu">
          <span>{{ username }}</span>
          <button @click="logout">Logout</button>
        </div>
      </div>
    </header>

    <main class="content">
      <router-view />
    </main>

    <MusicPlayer v-if="currentTrack" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from './stores/player';
import { useUserStore } from './stores/user';
import MusicPlayer from './components/MusicPlayer.vue';

const router = useRouter();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const theme = ref('light');
const currentTrack = computed(() => playerStore.currentTrack);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const username = computed(() => userStore.user?.username || '');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

const logout = () => {
  userStore.logout();
  router.push('/');
};

// Watch for theme changes and update document attributes
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
});

onMounted(() => {
  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', theme.value);
});
</script>

<style lang="scss">
@import './assets/scss/theme.scss';

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);

  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--accent-color);
  }

  .main-nav {
    display: flex;
    gap: 1.5rem;

    a {
      color: var(--text-color);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: border-color 0.2s;

      &.router-link-active {
        border-bottom-color: var(--accent-color);
        color: var(--accent-color);
      }

      &:hover {
        color: var(--accent-color);
      }
    }
  }

  .user-controls {
    display: flex;
    align-items: center;
    gap: 1rem;

    .theme-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--background-color-light);
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      button {
        background-color: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 0.3rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;

        &:hover {
          background-color: var(--background-color-light);
        }
      }
    }
  }
}

.content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}
</style>