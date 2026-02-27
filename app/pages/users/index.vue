<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Users</h2>
      <UButton to="/users/create" color="primary">+ New User</UButton>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading users...
    </div>

    <UCard v-else-if="users.length > 0" class="overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Avatar</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Username</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Created</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr
              v-for="row in users"
              :key="row.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <td class="px-4 py-3">
                <UAvatar
                  v-if="row.avatar"
                  :src="row.avatar"
                  :alt="row.username"
                  size="sm"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm"
                >
                  {{ row.username?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
              </td>
              <td class="px-4 py-3 font-medium">{{ row.username || 'N/A' }}</td>
              <td class="px-4 py-3">{{ row.email }}</td>
              <td class="px-4 py-3">
                <UBadge
                  :color="row.role === 'admin' ? 'warning' : 'info'"
                  variant="soft"
                  size="sm"
                >
                  {{ row.role }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="row.status === 'active' ? 'success' : row.status === 'suspended' ? 'warning' : 'error'"
                  variant="soft"
                  size="sm"
                >
                  {{ row.status }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(row.created_at) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <UButton
                    :to="`/users/${row.id}/edit`"
                    variant="outline"
                    color="neutral"
                    size="xs"
                  >
                    Edit
                  </UButton>
                  <UButton
                    color="error"
                    variant="outline"
                    size="xs"
                    :disabled="row.id === currentUser?.id"
                    @click="deleteUser(row)"
                  >
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UCard v-else class="text-center py-12">
      <p class="text-gray-500 mb-4">No users yet.</p>
      <UButton to="/users/create" color="primary">Create your first user</UButton>
    </UCard>
  </div>
</template>

<script setup>
const users = ref([])
const loading = ref(true)
const currentUser = useState('user', () => null)

async function fetchUsers() {
  try {
    const response = await $fetch('/api/users')
    users.value = response
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

async function deleteUser(user) {
  if (user.id === currentUser.value?.id) {
    alert('You cannot delete your own account')
    return
  }

  if (!confirm(`Are you sure you want to delete "${user.username || user.email}"?`)) return

  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'DELETE'
    })
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Failed to delete user')
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>
