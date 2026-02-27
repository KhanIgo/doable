<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Create User</h2>
      <UButton to="/users" variant="outline" color="neutral">← Back to Users</UButton>
    </div>

    <UCard>
      <form @submit.prevent="createUser" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UFormField label="Username">
            <UInput
              v-model="form.username"
              placeholder="Enter username"
            />
          </UFormField>

          <UFormField label="Email *">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UFormField label="Password *">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Enter password"
              required
              minlength="6"
            />
          </UFormField>

          <UFormField label="Confirm Password *">
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm password"
              required
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UFormField label="Role">
            <USelect
              v-model="form.role"
              :items="roleItems"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="statusItems"
              value-key="value"
            />
          </UFormField>
        </div>

        <UFormField label="Avatar URL">
          <UInput
            v-model="form.avatar"
            type="url"
            placeholder="https://example.com/avatar.png"
          />
        </UFormField>

        <div class="flex gap-4">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading || !isValid || !passwordsMatch"
          >
            {{ loading ? 'Creating...' : 'Create User' }}
          </UButton>
        </div>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>
        <p v-if="!passwordsMatch && form.confirmPassword" class="text-sm text-error">Passwords do not match</p>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  status: 'active',
  avatar: ''
})

const loading = ref(false)
const error = ref('')

const roleItems = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' }
]

const isValid = computed(() => form.value.email.trim() && form.value.password.trim())

const passwordsMatch = computed(() => form.value.password === form.value.confirmPassword)

async function createUser() {
  if (!isValid.value || !passwordsMatch.value) return

  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        username: form.value.username || null,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        status: form.value.status,
        avatar: form.value.avatar || null
      }
    })

    navigateTo('/users')
  } catch (err) {
    error.value = err.data?.message || 'Failed to create user'
  } finally {
    loading.value = false
  }
}
</script>
