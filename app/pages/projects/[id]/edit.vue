<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading project...
    </div>

    <div v-else-if="project">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Edit Project</h2>
        <UButton :to="`/projects/${project.id}`" variant="outline" color="neutral">← Back to Project</UButton>
      </div>

      <UCard>
        <form @submit.prevent="updateProject" class="space-y-6">
          <UFormField label="Project Name *">
            <UInput
              v-model="form.name"
              placeholder="Enter project name"
              required
            />
          </UFormField>

          <UFormField label="Slug *">
            <UInput
              v-model="form.slug"
              placeholder="project-slug"
              required
            />
            <p class="text-xs text-gray-500 mt-1">URL-friendly name (lowercase, hyphens allowed)</p>
          </UFormField>

          <UFormField label="Description">
            <ClientOnly>
              <MarkdownEditor
                v-model="form.description"
                placeholder="Describe your project using markdown..."
              />
            </ClientOnly>
          </UFormField>

          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="statusItems"
              value-key="value"
            />
          </UFormField>

          <div class="flex gap-4">
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              :disabled="saving || !isValid"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </UButton>
            <UButton :to="`/projects/${project.id}`" variant="outline" color="neutral">
              Cancel
            </UButton>
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>
          <p v-if="success" class="text-sm text-success">{{ success }}</p>
        </form>
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
const route = useRoute()
const project = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  slug: '',
  description: '',
  status: 'active'
})

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' }
]

const isValid = computed(() => form.value.name.trim() && form.value.slug.trim())

async function fetchProject() {
  try {
    const projects = await $fetch('/api/projects')
    project.value = projects.find(p => p.id === Number(route.params.id))

    if (project.value) {
      form.value = {
        name: project.value.name,
        slug: project.value.slug,
        description: project.value.description || '',
        status: project.value.status || 'active'
      }
    }
  } catch (err) {
    console.error('Error fetching project:', err)
  } finally {
    loading.value = false
  }
}

async function updateProject() {
  if (!isValid.value) return

  error.value = ''
  success.value = ''
  saving.value = true

  try {
    await $fetch(`/api/projects/${project.value.id}`, {
      method: 'PATCH',
      body: form.value
    })

    success.value = 'Project updated successfully!'

    setTimeout(() => {
      navigateTo(`/projects/${project.value.id}`)
    }, 1500)
  } catch (err) {
    error.value = err.data?.message || 'Failed to update project'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProject()
})
</script>
