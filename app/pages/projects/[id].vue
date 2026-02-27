<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading project...
    </div>

    <div v-else-if="project">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <nav class="flex items-center gap-2 text-sm">
          <UButton to="/projects" variant="link" color="primary" size="sm">Projects</UButton>
          <span class="text-gray-400">/</span>
          <span class="text-gray-600 dark:text-gray-400">{{ project.name }}</span>
        </nav>

        <div class="flex gap-2">
          <UButton :to="`/projects/${project.id}/edit`" variant="outline" color="neutral" size="sm">
            Edit
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            @click="deleteProject"
          >
            Delete
          </UButton>
        </div>
      </div>

      <UCard>
        <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
          <h1 class="text-2xl font-bold">{{ project.name }}</h1>
          <UBadge
            :color="statusColors[project.status] || 'neutral'"
            variant="soft"
            size="md"
          >
            {{ project.status }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Slug</p>
            <p class="font-medium">{{ project.slug }}</p>
          </div>
          <div v-if="project.owner_name">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Owner</p>
            <p class="font-medium">👤 {{ project.owner_name }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Created</p>
            <p class="font-medium">{{ formatDate(project.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Updated</p>
            <p class="font-medium">{{ formatDate(project.updated_at) }}</p>
          </div>
        </div>

        <div v-if="project.description" class="mb-6">
          <h3 class="font-semibold mb-2">Description</h3>
          <div
            class="prose prose-sm max-w-none dark:prose-invert"
            v-html="renderMarkdown(project.description)"
          />
        </div>

        <div class="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">Tasks</h3>
            <UButton :to="`/tasks?project=${project.id}`" variant="outline" color="neutral" size="sm">
              View Tasks
            </UButton>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Manage tasks for this project in the Tasks section.</p>
        </div>
      </UCard>
    </div>

    <UCard v-else class="text-center py-12">
      <h2 class="text-xl font-semibold mb-2">Project not found</h2>
      <p class="text-gray-500 mb-4">The project you're looking for doesn't exist.</p>
      <UButton to="/projects" color="primary">Back to Projects</UButton>
    </UCard>
  </div>
</template>

<script setup>
import markdownit from 'markdown-it'

const md = markdownit({ html: true, linkify: true })
const route = useRoute()
const project = ref(null)
const loading = ref(true)

const statusColors = {
  active: 'success',
  planning: 'warning',
  completed: 'info',
  archived: 'error'
}

function renderMarkdown(text) {
  return md ? md.render(text) : text
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

async function fetchProject() {
  try {
    const projects = await $fetch('/api/projects')
    project.value = projects.find(p => p.id === Number(route.params.id))
  } catch (error) {
    console.error('Error fetching project:', error)
  } finally {
    loading.value = false
  }
}

async function deleteProject() {
  if (!confirm(`Are you sure you want to delete "${project.value.name}"?`)) return

  try {
    await $fetch(`/api/projects/${project.value.id}`, {
      method: 'DELETE'
    })
    navigateTo('/projects')
  } catch (error) {
    console.error('Error deleting project:', error)
    alert('Failed to delete project')
  }
}

onMounted(() => {
  fetchProject()
})
</script>
