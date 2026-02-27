<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Projects</h2>
      <UButton to="/projects/create" color="primary">+ New Project</UButton>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading projects...
    </div>

    <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="project in projects"
        :key="project.id"
        class="hover:border-primary/50 transition-colors"
      >
        <template #header>
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-semibold text-lg truncate">{{ project.name }}</h3>
            <UBadge
              :color="statusColors[project.status] || 'neutral'"
              variant="soft"
              size="sm"
            >
              {{ project.status }}
            </UBadge>
          </div>
        </template>

        <p v-if="project.description" class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
          {{ project.description }}
        </p>

        <div class="flex flex-col gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span v-if="project.owner_name">👤 {{ project.owner_name }}</span>
          <span>🔗 {{ project.slug }}</span>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton :to="`/projects/${project.id}`" variant="outline" color="neutral" size="sm">
              View
            </UButton>
            <UButton :to="`/projects/${project.id}/edit`" variant="outline" color="neutral" size="sm">
              Edit
            </UButton>
            <UButton
              color="error"
              variant="outline"
              size="sm"
              icon="i-lucide-trash-2"
              @click="deleteProject(project)"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <UCard v-else class="text-center py-12">
      <p class="text-gray-500 mb-4">No projects yet.</p>
      <UButton to="/projects/create" color="primary">Create your first project</UButton>
    </UCard>
  </div>
</template>

<script setup>
const projects = ref([])
const loading = ref(true)

const statusColors = {
  active: 'success',
  planning: 'warning',
  completed: 'info',
  archived: 'error'
}

async function fetchProjects() {
  try {
    const response = await $fetch('/api/projects')
    projects.value = response
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

async function deleteProject(project) {
  if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return

  try {
    await $fetch(`/api/projects/${project.id}`, {
      method: 'DELETE'
    })
    projects.value = projects.value.filter(p => p.id !== project.id)
  } catch (error) {
    console.error('Error deleting project:', error)
    alert('Failed to delete project')
  }
}

onMounted(() => {
  fetchProjects()
})
</script>
