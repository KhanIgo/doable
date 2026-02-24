<template>
  <div class="page">
    <h2>Task Manager</h2>

    <form @submit.prevent="addTask" class="task-form">
      <input
        v-model="newTask.title"
        type="text"
        placeholder="What needs to be done?"
        required
        class="task-input"
      />
      <MarkdownEditor
        v-model="newTask.description"
        placeholder="Add a detailed description (markdown supported)..."
      />
      <button type="submit" class="add-btn" :disabled="!newTask.title.trim()">
        Add Task
      </button>
    </form>

    <div v-if="loading" class="loading">Loading tasks...</div>

    <ul v-else-if="tasks.length > 0" class="task-list">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <div class="task-content">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTask(task)"
            class="task-checkbox"
          />
          <div class="task-details">
            <h3>{{ task.title }}</h3>
            <div v-if="task.description" class="task-description" v-html="renderMarkdown(task.description)"></div>
          </div>
        </div>
        <button @click="deleteTask(task)" class="delete-btn">
          Delete
        </button>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p>No tasks yet. Add one above!</p>
    </div>
  </div>
</template>

<script setup>
import markdownit from 'markdown-it'

const md = markdownit({ html: true, linkify: true })

const tasks = ref([])
const loading = ref(true)
const newTask = ref({ title: '', description: '' })

function renderMarkdown(text) {
  return md.render(text)
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
  if (!newTask.value.title.trim()) return

  try {
    const task = await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        ...newTask.value,
        project_id: 1,
        user_id: 1,
        priority: 0,
        type: 'task'
      }
    })
    tasks.value.unshift(task)
    newTask.value = { title: '', description: '' }
  } catch (error) {
    console.error('Error adding task:', error)
  }
}

async function toggleTask(task) {
  try {
    const updated = await $fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: { status: task.status === 1 ? 0 : 1 }
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
  fetchTasks()
})
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.task-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.task-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-btn {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-list {
  list-style: none;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: border-color 0.2s;
}

.task-item:hover {
  border-color: #667eea;
}

.task-item.completed {
  background: #f8f9fa;
}

.task-item.completed .task-details h3 {
  text-decoration: line-through;
  color: #999;
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
}

.task-details h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.task-description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
}

.task-description :deep(h1),
.task-description :deep(h2),
.task-description :deep(h3),
.task-description :deep(h4),
.task-description :deep(h5),
.task-description :deep(h6) {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}

.task-description :deep(p) {
  margin-bottom: 0.5rem;
}

.task-description :deep(ul),
.task-description :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.task-description :deep(code) {
  background: #f0f0f0;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
}

.task-description :deep(pre) {
  background: #f6f8fa;
  padding: 0.75rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.task-description :deep(pre code) {
  background: transparent;
  padding: 0;
}

.task-description :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.task-description :deep(a:hover) {
  text-decoration: underline;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #ff3344;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
