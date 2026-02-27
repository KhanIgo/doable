<template>
  <div class="max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">Register</h2>
      </template>

      <form @submit.prevent="register" class="space-y-4">
        <UFormField label="Username">
          <UInput
            v-model="form.username"
            type="text"
            placeholder="Enter username"
            size="lg"
            required
          />
        </UFormField>

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
            minlength="6"
          />
        </UFormField>

        <UFormField label="Confirm Password">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm password"
            size="lg"
            required
          />
        </UFormField>

        <UButton
          to="/auth"
          variant="link"
          color="primary"
          class="w-full justify-center"
        >
          Already have an account? Sign In
        </UButton>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </UButton>

        <p v-if="error" class="text-sm text-error text-center">{{ error }}</p>
        <p v-if="success" class="text-sm text-success text-center">{{ success }}</p>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

async function register() {
  error.value = ''
  success.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        role: 'user',
        status: 'active'
      }
    })

    success.value = 'Registration successful! Redirecting to login...'
    
    setTimeout(() => {
      navigateTo('/auth')
    }, 2000)
  } catch (err) {
    error.value = err.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
