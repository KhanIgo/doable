<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading user...
    </div>

    <div v-else-if="user">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Edit User</h2>
        <UButton to="/users" variant="outline" color="neutral">← Back to Users</UButton>
      </div>

      <UCard>
        <form @submit.prevent="updateUser" class="space-y-6">
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
            <UFormField label="New Password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Leave blank to keep current"
                minlength="6"
              />
            </UFormField>

            <UFormField label="Confirm Password">
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm new password"
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
              :loading="saving"
              :disabled="saving || !isValid || !passwordsMatch"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </UButton>
            <UButton to="/users" variant="outline" color="neutral">
              Cancel
            </UButton>
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>
          <p v-if="success" class="text-sm text-success">{{ success }}</p>
          <p v-if="!passwordsMatch && form.confirmPassword" class="text-sm text-error">Passwords do not match</p>
        </form>
      </UCard>
    </div>

    <UCard v-else class="text-center py-12">
      <h2 class="text-xl font-semibold mb-2">User not found</h2>
      <p class="text-gray-500 mb-4">The user you're looking for doesn't exist.</p>
      <UButton to="/users" color="primary">Back to Users</UButton>
    </UCard>
  </div>
</template>

<script setup>
const route = useRoute()
const user = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  status: 'active',
  avatar: ''
})

const roleItems = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' }
]

const isValid = computed(() => form.value.email.trim())

const passwordsMatch = computed(() => {
  if (!form.value.password) return true
  return form.value.password === form.value.confirmPassword
})

async function fetchUser() {
  try {
    const users = await $fetch('/api/users')
    user.value = users.find(u => u.id === Number(route.params.id))

    if (user.value) {
      form.value = {
        username: user.value.username || '',
        email: user.value.email,
        password: '',
        confirmPassword: '',
        role: user.value.role || 'user',
        status: user.value.status || 'active',
        avatar: user.value.avatar || ''
      }
    }
  } catch (err) {
    console.error('Error fetching user:', err)
  } finally {
    loading.value = false
  }
}

async function updateUser() {
  if (!isValid.value || !passwordsMatch.value) return

  error.value = ''
  success.value = ''
  saving.value = true

  try {
    const updateData = {
      username: form.value.username || null,
      email: form.value.email,
      role: form.value.role,
      status: form.value.status,
      avatar: form.value.avatar || null
    }

    if (form.value.password) {
      updateData.password = form.value.password
    }

    await $fetch(`/api/users/${user.value.id}`, {
      method: 'PATCH',
      body: updateData
    })

    success.value = 'User updated successfully!'

    setTimeout(() => {
      navigateTo('/users')
    }, 1500)
  } catch (err) {
    error.value = err.data?.message || 'Failed to update user'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>
