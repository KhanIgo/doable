<template>
  <div class="markdown-editor">
    <div class="toolbar">
      <button type="button" @click="insertMarkdown('**', '**')" title="Bold" class="toolbar-btn">
        <strong>B</strong>
      </button>
      <button type="button" @click="insertMarkdown('*', '*')" title="Italic" class="toolbar-btn">
        <em>I</em>
      </button>
      <button type="button" @click="insertMarkdown('# ', '')" title="Heading" class="toolbar-btn">
        H
      </button>
      <button type="button" @click="insertMarkdown('[', '](url)')" title="Link" class="toolbar-btn">
        🔗
      </button>
      <button type="button" @click="insertMarkdown('- ', '')" title="List" class="toolbar-btn">
        •
      </button>
      <button type="button" @click="insertMarkdown('```', '\n```')" title="Code" class="toolbar-btn">
        &lt;/&gt;
      </button>
      <button type="button" @click="triggerImageUpload" title="Upload Image" class="toolbar-btn" :disabled="isUploading">
        🖼️
      </button>
      <button type="button" @click="togglePreview" class="toolbar-btn">
        {{ showPreview ? 'Edit' : 'Preview' }}
      </button>
    </div>
    
    <div v-if="isUploading" class="uploading-indicator">
      Uploading image...
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="file-input"
    />
    
    <div 
      ref="editorContainer"
      class="editor-container"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @paste="handlePaste"
    >
      <textarea
        v-if="!showPreview"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="editor-textarea"
      />
      <div v-else class="editor-preview" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script setup>
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

const renderedMarkdown = computed(() => {
  return md.render(props.modelValue || '')
})

async function uploadImage(file) {
  isUploading.value = true
  
  try {
    const reader = new FileReader()
    
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    
    const base64 = await base64Promise
    const base64Data = base64.split(',')[1]
    
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: base64Data,
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

function insertImage(url) {
  const markdown = `![${props.modelValue || 'image'}](${url})\n\n`
  emit('update:modelValue', props.modelValue + markdown)
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
  const files = event.dataTransfer?.files
  const file = files?.[0]
  
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

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.markdown-editor:focus-within {
  border-color: #667eea;
}

.toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-btn {
  padding: 0.375rem 0.625rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #555;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.editor-container {
  position: relative;
  min-height: 150px;
}

.editor-container.drag-over {
  background: #f0f0ff;
}

.uploading-indicator {
  padding: 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  text-align: center;
  font-size: 0.875rem;
  border-bottom: 1px solid #bbdefb;
}

.editor-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: none;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

.editor-textarea:focus {
  outline: none;
}

.editor-preview {
  padding: 1rem;
  min-height: 150px;
  background: #fafafa;
  overflow-y: auto;
  max-height: 400px;
}

.editor-preview :deep(h1),
.editor-preview :deep(h2),
.editor-preview :deep(h3),
.editor-preview :deep(h4),
.editor-preview :deep(h5),
.editor-preview :deep(h6) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.editor-preview :deep(p) {
  margin-bottom: 0.75rem;
}

.editor-preview :deep(ul),
.editor-preview :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.editor-preview :deep(code) {
  background: #f0f0f0;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
}

.editor-preview :deep(pre) {
  background: #f6f8fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.editor-preview :deep(pre code) {
  background: transparent;
  padding: 0;
}

.editor-preview :deep(blockquote) {
  border-left: 3px solid #667eea;
  padding-left: 1rem;
  margin-left: 0;
  color: #666;
}

.editor-preview :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.editor-preview :deep(a:hover) {
  text-decoration: underline;
}
</style>
