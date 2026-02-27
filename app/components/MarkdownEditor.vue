<template>
  <div class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 ring-offset-2 dark:ring-offset-gray-900 transition-shadow">
    <div class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('**', '**')"
        title="Bold"
      >
        <span class="font-bold">B</span>
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('*', '*')"
        title="Italic"
      >
        <em>I</em>
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('# ', '')"
        title="Heading"
      >
        H
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('[', '](url)')"
        title="Link"
      >
        🔗
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('- ', '')"
        title="List"
      >
        •
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="insertMarkdown('```', '\n```')"
        title="Code"
      >
        &lt;/&gt;
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        title="Upload Image"
        :disabled="isUploading"
        @click="triggerImageUpload"
      >
        🖼️
      </UButton>
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="togglePreview"
      >
        {{ showPreview ? 'Edit' : 'Preview' }}
      </UButton>
    </div>

    <div v-if="isUploading" class="px-3 py-2 bg-primary/10 text-primary text-sm text-center border-b border-gray-200 dark:border-gray-800">
      Uploading image...
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <div
      ref="editorContainer"
      class="min-h-[150px] transition-colors"
      :class="{ 'bg-primary/5': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @paste="handlePaste"
    >
      <textarea
        v-if="!showPreview"
        :value="modelValue"
        class="w-full min-h-[150px] p-4 border-0 bg-transparent font-mono text-sm resize-y focus:outline-none focus:ring-0"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <div
        v-else
        class="p-4 prose prose-sm max-w-none dark:prose-invert min-h-[150px] max-h-[400px] overflow-y-auto"
        v-html="renderedMarkdown"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import markdownit from 'markdown-it'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Write your markdown here...'
  }
})

const emit = defineEmits(['update:modelValue'])

const showPreview = ref(false)
const fileInput = ref(null)
const editorContainer = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})

const renderedMarkdown = computed(() => md.render(props.modelValue || ''))

function insertMarkdown(prefix, suffix) {
  const textarea = document.activeElement
  if (!textarea || textarea.tagName !== 'TEXTAREA') return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = props.modelValue
  const selectedText = text.substring(start, end)

  const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end)
  emit('update:modelValue', newText)

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, end + prefix.length)
  })
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function insertImage(url) {
  const markdown = `![image](${url})\n\n`
  emit('update:modelValue', props.modelValue + markdown)
}

async function uploadImage(file) {
  isUploading.value = true

  try {
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: arrayBuffer,
      headers: {
        'Content-Type': file.type,
        'X-File-Name': file.name
      }
    })

    return response.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Failed to upload image: ' + (error.data?.message || error.message))
    return null
  } finally {
    isUploading.value = false
  }
}

function triggerImageUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    const url = await uploadImage(file)
    if (url) {
      insertImage(url)
    }
  }
  event.target.value = ''
}

async function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const url = await uploadImage(file)
    if (url) {
      insertImage(url)
    }
  }
}

async function handlePaste(event) {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        event.preventDefault()
        const url = await uploadImage(file)
        if (url) {
          insertImage(url)
        }
      }
      break
    }
  }
}
</script>
