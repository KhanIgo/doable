<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <h2 class="text-2xl font-bold">Task Manager</h2>

    <UCard>
      <form @submit.prevent="addTask" class="space-y-4">
        <UFormField label="Task title">
          <UInput
            v-model="newTask.title"
            placeholder="What needs to be done?"
            size="lg"
            required
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Project">
            <USelect
              v-model="newTask.project_id"
              :items="projectItems"
              placeholder="Select Project"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Priority">
            <USelect
              v-model="newTask.priority"
              :items="priorityItems"
              value-key="value"
            />
          </UFormField>
        </div>

        <UFormField label="Description">
          <ClientOnly>
            <MarkdownEditor
              v-model="newTask.description"
              placeholder="Add a detailed description (markdown supported)..."
            />
          </ClientOnly>
        </UFormField>

        <div class="flex flex-col gap-2">
          <UButton
            type="submit"
            color="primary"
            :disabled="!newTask.title.trim() || !newTask.project_id"
          >
            Add Task
          </UButton>
          <p v-if="!newTask.project_id" class="text-xs text-error">* Please select a project</p>
        </div>
      </form>
    </UCard>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading tasks...
    </div>

    <div v-else-if="tasks.length > 0" class="space-y-4">
      <UCard
        v-for="task in tasks"
        :key="task.id"
        :class="{ 'opacity-60': task.status === 3 }"
      >
        <div class="flex items-start gap-4">
          <UCheckbox
            :model-value="task.status === 3"
            @update:model-value="toggleTask(task)"
            class="mt-1"
          />
          <div class="flex-1 min-w-0">
            <h3 class="font-medium" :class="{ 'line-through text-gray-500': task.status === 3 }">
              <NuxtLink :to="`/tasks/${task.project_slug}-${task.id}`" class="hover:text-primary">
                {{ task.title }}
              </NuxtLink>
            </h3>
            <div
              v-if="task.description"
              class="text-sm text-gray-600 dark:text-gray-400 mt-2 prose prose-sm max-w-none dark:prose-invert"
              v-html="renderMarkdown(task.description)"
            />
            <div class="flex flex-wrap gap-2 mt-2">
              <UBadge v-if="task.project_name" color="neutral" variant="soft" size="sm">
                📁 {{ task.project_name }}
              </UBadge>
              <UBadge
                :color="priorityColors[task.priority] || 'neutral'"
                variant="soft"
                size="sm"
              >
                {{ priorityLabel(task.priority) }}
              </UBadge>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UButton
              :to="`/tasks/${task.project_slug}-${task.id}`"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-eye"
            />
            <UButton
              :to="`/tasks/${task.project_slug}-${task.id}/edit`"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-pencil"
            />
            <UButton
              variant="ghost"
              color="error"
              size="sm"
              icon="i-lucide-trash-2"
              @click="deleteTask(task)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-else class="text-center py-12">
      <p class="text-gray-500">No tasks yet. Add one above!</p>
    </UCard>
  </div>
</template>

<script setup>
import markdownit from 'markdown-it'

const md = markdownit({ html: true, linkify: true })

const tasks = ref([])
const projects = ref([])
const loading = ref(true)
const newTask = ref({
  title: '',
  description: '',
  project_id: null,
  priority: 0,
  type: 'task'
})

const priorityLabels = ['Low', 'Medium', 'High', 'Urgent']
const priorityColors = ['success', 'info', 'warning', 'error']

const projectItems = computed(() => [
  { label: 'Select Project', value: null, disabled: true },
  ...projects.value.map(p => ({ label: p.name, value: p.id }))
])

const priorityItems = computed(() =>
  priorityLabels.map((label, i) => ({ label: `Priority: ${label}`, value: i }))
)

function priorityLabel(priority) {
  return priorityLabels[priority] || 'Unknown'
}

function renderMarkdown(text) {
  return md.render(text)
}

async function fetchProjects() {
  try {
    const response = await $fetch('/api/projects')
    projects.value = response
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

async function fetchTasks() {
  try {
    const response = await $fetch('/api/tasks')
    tasks.value = response
  } catch (error) {
    console.error('Error fetching tasks:', error)
  } finally {
    loading.value = false
  }
}

async function addTask() {
  if (!newTask.value.title.trim() || !newTask.value.project_id) return

  try {
    const user = useState('user', () => null)
    const task = await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        title: newTask.value.title,
        description: newTask.value.description,
        project_id: newTask.value.project_id,
        user_id: user.value?.id || 1,
        priority: newTask.value.priority,
        type: newTask.value.type || 'task',
        status: 0
      }
    })
    tasks.value.unshift(task)
    newTask.value = { title: '', description: '', project_id: null, priority: 0, type: 'task' }
  } catch (error) {
    console.error('Error adding task:', error)
  }
}

async function toggleTask(task) {
  try {
    const newStatus = task.status === 3 ? 0 : 3
    const updated = await $fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

async function deleteTask(task) {
  try {
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE'
    })
    tasks.value = tasks.value.filter(t => t.id !== task.id)
  } catch (error) {
    console.error('Error deleting task:', error)
  }
}

onMounted(() => {
  fetchProjects()
  fetchTasks()
})
</script>
