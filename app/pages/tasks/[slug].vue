<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading task...
    </div>

    <div v-else-if="task">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <nav class="flex items-center gap-2 text-sm flex-wrap">
          <UButton to="/" variant="link" color="primary" size="sm">Tasks</UButton>
          <span class="text-gray-400">/</span>
          <UButton :to="`/projects/${task.project_id}`" variant="link" color="primary" size="sm">
            {{ task.project_name }}
          </UButton>
          <span class="text-gray-400">/</span>
          <span class="text-gray-600 dark:text-gray-400">{{ task.title }}</span>
        </nav>

        <div class="flex gap-2">
          <UButton :to="`/tasks/${task.slug}/edit`" variant="outline" color="neutral" size="sm">
            Edit
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            @click="deleteTask"
          >
            Delete
          </UButton>
        </div>
      </div>

      <UCard>
        <div class="flex justify-between items-start gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
          <h1 class="text-2xl font-bold flex-1">{{ task.title }}</h1>
          <div class="flex gap-2 shrink-0">
            <UBadge
              :color="priorityColors[task.priority] || 'neutral'"
              variant="soft"
              size="md"
            >
              {{ priorityLabel(task.priority) }}
            </UBadge>
            <UBadge
              :color="statusColors[task.status] || 'neutral'"
              variant="soft"
              size="md"
            >
              {{ statusLabel(task.status) }}
            </UBadge>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Project</p>
            <NuxtLink :to="`/projects/${task.project_id}`" class="font-medium text-primary hover:underline">
              {{ task.project_name }}
            </NuxtLink>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Type</p>
            <p class="font-medium">{{ task.type }}</p>
          </div>
          <div v-if="task.user_name">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Created by</p>
            <p class="font-medium">👤 {{ task.user_name }}</p>
          </div>
          <div v-if="task.due_date">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Due date</p>
            <p class="font-medium">{{ formatDate(task.due_date) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Created</p>
            <p class="font-medium">{{ formatDate(task.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Updated</p>
            <p class="font-medium">{{ formatDate(task.updated_at) }}</p>
          </div>
        </div>

        <div v-if="task.description" class="mb-6">
          <h3 class="font-semibold mb-2">Description</h3>
          <div
            class="prose prose-sm max-w-none dark:prose-invert"
            v-html="renderMarkdown(task.description)"
          />
        </div>

        <div v-if="task.tags && Object.keys(task.tags).length > 0" class="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 class="font-semibold mb-2">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(tag, key) in task.tags"
              :key="key"
              color="info"
              variant="soft"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-else class="text-center py-12">
      <h2 class="text-xl font-semibold mb-2">Task not found</h2>
      <p class="text-gray-500 mb-4">The task you're looking for doesn't exist.</p>
      <UButton to="/" color="primary">Back to Tasks</UButton>
    </UCard>
  </div>
</template>

<script setup>
import markdownit from 'markdown-it'

const md = markdownit({ html: true, linkify: true })
const route = useRoute()
const task = ref(null)
const loading = ref(true)

const priorityLabels = ['Low', 'Medium', 'High', 'Urgent']
const statusLabels = ['Open', 'In Progress', 'Review', 'Done']

const priorityColors = ['success', 'info', 'warning', 'error']
const statusColors = ['info', 'warning', 'secondary', 'success']

function priorityLabel(priority) {
  return priorityLabels[priority] || 'Unknown'
}

function statusLabel(status) {
  return statusLabels[status] || 'Unknown'
}

function renderMarkdown(text) {
  if (!md) return text
  return md.render(text)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchTask() {
  try {
    task.value = await $fetch(`/api/tasks/get/${route.params.slug}`)
  } catch (error) {
    console.error('Error fetching task:', error)
  } finally {
    loading.value = false
  }
}

async function deleteTask() {
  if (!confirm(`Are you sure you want to delete "${task.value.title}"?`)) return

  try {
    await $fetch(`/api/tasks/${task.value.id}`, {
      method: 'DELETE'
    })
    navigateTo('/')
  } catch (error) {
    console.error('Error deleting task:', error)
    alert('Failed to delete task')
  }
}

onMounted(() => {
  fetchTask()
})
</script>
