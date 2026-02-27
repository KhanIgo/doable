<template>
  <div class="max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">Sign In</h2>
      </template>

      <form @submit.prevent="login" class="space-y-4">
        <UFormField label="Email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter email"
            size="lg"
            required
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            size="lg"
            required
          />
        </UFormField>

        <UButton
          to="/reg"
          variant="link"
          color="primary"
          class="w-full justify-center"
        >
          Don't have an account? Register
        </UButton>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </UButton>

        <p v-if="error" class="text-sm text-error text-center">{{ error }}</p>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const user = useState('user', () => null)

async function login() {
  error.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password
      }
    })

    user.value = response.user

    localStorage.setItem('user', JSON.stringify(response.user))

    navigateTo('/')
  } catch (err) {
    error.value = err.data?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>
