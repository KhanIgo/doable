<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div v-if="!currentUser">
      <UCard>
        <div class="text-center py-8 space-y-4">
          <h2 class="text-xl font-semibold">Not Logged In</h2>
          <p class="text-gray-600 dark:text-gray-400">Please log in to view and edit your profile.</p>
          <UButton to="/auth" color="primary">Sign In</UButton>
        </div>
      </UCard>
    </div>

    <div v-else-if="loading" class="text-center py-12 text-gray-500">
      Loading profile...
    </div>

    <div v-else-if="user" class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">My Profile</h2>
        <UButton to="/" variant="outline" color="neutral">← Back to Home</UButton>
      </div>

      <UCard>
        <div class="flex flex-col sm:flex-row gap-8">
          <div class="flex flex-col items-center gap-4 shrink-0">
            <div
              class="relative cursor-pointer group"
              @click="triggerFileUpload"
            >
              <UAvatar
                v-if="form.avatar"
                :src="form.avatar"
                :alt="form.username"
                size="2xl"
              />
              <div
                v-else
                class="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white"
              >
                {{ form.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div
                class="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <span class="text-2xl">📷</span>
                <span class="text-xs font-medium">Change</span>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="flex gap-2">
              <UBadge :color="user.role === 'admin' ? 'warning' : 'info'" variant="soft" size="sm">
                {{ user.role }}
              </UBadge>
              <UBadge
                :color="user.status === 'active' ? 'success' : user.status === 'suspended' ? 'warning' : 'error'"
                variant="soft"
                size="sm"
              >
                {{ user.status }}
              </UBadge>
            </div>
            <p v-if="isUploading" class="text-sm text-primary">Uploading...</p>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-semibold">{{ form.username || 'No username' }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Member since {{ formatDate(user.created_at) }}
            </p>
          </div>
        </div>
      </UCard>

      <ClientOnly>
        <AvatarCropper
          v-if="showCropper && selectedImage"
          :image-src="selectedImage"
          @close="closeCropper"
          @crop="handleCrop"
        />
      </ClientOnly>

      <UCard>
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField label="Username">
              <UInput v-model="form.username" placeholder="Enter username" />
            </UFormField>

            <UFormField label="Email">
              <UInput v-model="form.email" type="email" required />
            </UFormField>
          </div>

          <UFormField label="Avatar URL">
            <UInput
              v-model="form.avatar"
              type="url"
              placeholder="https://example.com/avatar.png"
            />
            <p class="text-xs text-gray-500 mt-1">Paste a URL to your profile picture</p>
          </UFormField>

          <div class="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
            <h4 class="font-semibold">Change Password</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Leave blank to keep your current password</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UFormField label="New Password">
                <UInput
                  v-model="form.password"
                  type="password"
                  placeholder="Enter new password"
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
          </div>

          <div class="flex gap-4">
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              :disabled="saving || !isValid || !passwordsMatch"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </UButton>
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>
          <p v-if="success" class="text-sm text-success">{{ success }}</p>
          <p v-if="!passwordsMatch && form.confirmPassword" class="text-sm text-error">
            Passwords do not match
          </p>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup>
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
  avatar: ''
})

function getStoredUser() {
  if (process.client) {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return null
      }
    }
  }
  return null
}

const currentUser = ref(getStoredUser())
const fileInput = ref(null)
const isUploading = ref(false)
const showCropper = ref(false)
const selectedImage = ref(null)

const isValid = computed(() => form.value.email.trim())

const passwordsMatch = computed(() => {
  if (!form.value.password) return true
  return form.value.password === form.value.confirmPassword
})

async function fetchUser() {
  const storedUser = getStoredUser()
  if (!storedUser) {
    loading.value = false
    return
  }

  currentUser.value = storedUser

  try {
    const users = await $fetch('/api/users')
    user.value = users.find(u => u.id === storedUser.id)

    if (user.value) {
      form.value = {
        username: user.value.username || '',
        email: user.value.email,
        password: '',
        confirmPassword: '',
        avatar: user.value.avatar || ''
      }
    }
  } catch (err) {
    console.error('Error fetching user:', err)
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  if (!isValid.value || !passwordsMatch.value || !user.value) return

  error.value = ''
  success.value = ''
  saving.value = true

  try {
    const updateData = {
      username: form.value.username || null,
      email: form.value.email,
      avatar: form.value.avatar || null
    }

    if (form.value.password) {
      updateData.password = form.value.password
    }

    await $fetch(`/api/users/${user.value.id}`, {
      method: 'PATCH',
      body: updateData
    })

    user.value.username = form.value.username
    user.value.email = form.value.email
    user.value.avatar = form.value.avatar

    currentUser.value = {
      ...currentUser.value,
      username: form.value.username,
      email: form.value.email,
      avatar: form.value.avatar
    }
    localStorage.setItem('user', JSON.stringify(currentUser.value))

    success.value = 'Profile updated successfully!'

    form.value.password = ''
    form.value.confirmPassword = ''
  } catch (err) {
    error.value = err.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function triggerFileUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

async function handleCrop({ arrayBuffer, file }) {
  isUploading.value = true
  showCropper.value = false
  selectedImage.value = null

  try {
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: arrayBuffer,
      headers: {
        'Content-Type': file.type,
        'X-File-Name': file.name
      }
    })

    form.value.avatar = response.url
  } catch (err) {
    console.error('Upload error:', err)
    alert('Failed to upload image: ' + (err.data?.message || err.message))
  } finally {
    isUploading.value = false
  }
}

function closeCropper() {
  showCropper.value = false
  selectedImage.value = null
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('storage', () => {
      currentUser.value = getStoredUser()
    })
  }
  fetchUser()
})
</script>
