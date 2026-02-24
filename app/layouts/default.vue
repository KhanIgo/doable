<template>
  <div class="app-container">
    <nav class="navbar">
      <h1>Doable</h1>
      <div class="nav-links">
        <NuxtLink to="/" class="nav-link">Tasks</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/sprints" class="nav-link">Sprints</NuxtLink>
        <template v-if="user">
          <span class="user-info">
            <img v-if="user.avatar" :src="user.avatar" alt="Avatar" class="avatar" />
            <span>{{ user.username }}</span>
          </span>
          <button @click="logout" class="logout-btn">Logout</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth" class="nav-link">Sign In</NuxtLink>
          <NuxtLink to="/reg" class="nav-link btn-primary">Register</NuxtLink>
        </template>
      </div>
    </nav>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
const user = useState('user', () => null)

function logout() {
  user.value = null
  localStorage.removeItem('user')
  navigateTo('/auth')
}

onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (e) {
      localStorage.removeItem('user')
    }
  }
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.navbar h1 {
  color: #333;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-link.btn-primary:hover {
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
  font-weight: 500;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #ff3344;
}

.content {
  padding: 2rem;
}
</style>
