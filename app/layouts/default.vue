<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
            Doable
          </NuxtLink>

          <nav class="flex items-center gap-4">
            <UButton to="/" variant="ghost" color="neutral">Tasks</UButton>
            <UButton to="/projects" variant="ghost" color="neutral">Projects</UButton>
            <UButton to="/sprints" variant="ghost" color="neutral">Sprints</UButton>

            <template v-if="user">
              <div class="flex items-center gap-2">
                <UAvatar
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.username"
                  size="sm"
                />
                <UBadge v-else color="primary" variant="soft" size="sm">
                  {{ user.username?.charAt(0)?.toUpperCase() || 'U' }}
                </UBadge>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ user.username }}
                </span>
              </div>
              <UButton to="/my" variant="ghost" color="neutral" size="sm">Profile</UButton>
              <UButton @click="logout" color="error" variant="solid" size="sm">
                Logout
              </UButton>
            </template>
            <template v-else>
              <UButton to="/auth" variant="ghost" color="neutral">Sign In</UButton>
              <UButton to="/reg" color="primary" variant="solid">Register</UButton>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
