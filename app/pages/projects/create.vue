<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Create Project</h2>
      <UButton to="/projects" variant="outline" color="neutral">← Back to Projects</UButton>
    </div>

    <UCard>
      <form @submit.prevent="createProject" class="space-y-6">
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
            :loading="loading"
            :disabled="loading || !isValid"
          >
            {{ loading ? 'Creating...' : 'Create Project' }}
          </UButton>
        </div>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const form = ref({
  name: '',
  slug: '',
  description: '',
  status: 'active'
})

const loading = ref(false)
const error = ref('')
const user = useState('user', () => null)

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' }
]

const isValid = computed(() => form.value.name.trim() && form.value.slug.trim())

async function createProject() {
  if (!isValid.value) return

  error.value = ''
  loading.value = true

  try {
    const projectData = {
      ...form.value,
      owner_id: user.value?.id || 1
    }

    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: projectData
    })

    navigateTo(`/projects/${project.id}`)
  } catch (err) {
    error.value = err.data?.message || 'Failed to create project'
  } finally {
    loading.value = false
  }
}
</script>
