<template>
  <div class="avatar-cropper-modal" @click.self="close">
    <div class="cropper-container-wrapper">
      <div class="cropper-header">
        <h3>Crop Avatar</h3>
        <button @click="close" class="close-btn">✕</button>
      </div>

      <div class="cropper-body">
        <div class="image-wrapper">
          <img ref="imageElement" :src="imageSrc" alt="Crop avatar" />
        </div>

        <div class="cropper-actions">
          <div class="zoom-controls">
            <button @click="zoom(-0.1)" class="btn-icon" title="Zoom out">−</button>
            <span>Zoom</span>
            <button @click="zoom(0.1)" class="btn-icon" title="Zoom in">+</button>
          </div>

          <div class="rotate-controls">
            <button @click="rotate(-90)" class="btn-icon" title="Rotate left">↺</button>
            <button @click="rotate(90)" class="btn-icon" title="Rotate right">↻</button>
          </div>
        </div>

        <div class="preview-section">
          <p>Preview:</p>
          <div class="preview-wrapper">
            <img ref="previewLarge" class="preview-large" alt="Preview" />
            <img ref="previewSmall" class="preview-small" alt="Preview" />
          </div>
        </div>
      </div>

      <div class="cropper-footer">
        <button @click="close" class="btn-cancel">Cancel</button>
        <button @click="crop" class="btn-primary" :disabled="cropping">
          {{ cropping ? 'Cropping...' : 'Crop & Upload' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'crop'])

const imageElement = ref(null)
const previewLarge = ref(null)
const previewSmall = ref(null)
let cropper = null
let cropperCanvas = null
let cropperImage = null
let cropperSelection = null
const cropping = ref(false)
const isClient = ref(false)

const AVATAR_SIZE = 400

onMounted(async () => {
  isClient.value = true
  
  // Import Cropper only on client side
  const { default: Cropper } = await import('cropperjs')
  
  if (imageElement.value) {
    // Create cropper instance
    cropper = new Cropper(imageElement.value, {
      aspectRatio: 1,
      viewMode: 1,
      responsive: true,
      background: false,
      autoCropArea: 0.9,
      zoomable: true,
      rotatable: true
    })

    // Get canvas, image and selection elements (Cropper.js v2 API)
    setTimeout(async () => {
      cropperCanvas = cropper.getCropperCanvas()
      cropperImage = cropper.getCropperImage()
      cropperSelection = cropper.getCropperSelection()

      // Enforce 1:1 (square) crop ratio
      if (cropperSelection) {
        cropperSelection.aspectRatio = 1
        cropperSelection.initialAspectRatio = 1
      }

      if (cropperCanvas) {
        cropperCanvas.addEventListener('actionend', updatePreview)
      }
      await updatePreview()
    }, 100)
  }
})

async function updatePreview() {
  // Use cropperSelection - it renders the selected/cropped area only
  const source = cropperSelection || cropperCanvas
  if (!source || !previewLarge.value || !previewSmall.value) return
  try {
    const [canvasLarge, canvasSmall] = await Promise.all([
      source.$toCanvas({ width: 100, height: 100 }),
      source.$toCanvas({ width: 50, height: 50 })
    ])
    previewLarge.value.src = canvasLarge.toDataURL('image/png')
    previewSmall.value.src = canvasSmall.toDataURL('image/png')
  } catch (e) {
    console.warn('Preview update failed:', e)
  }
}

function zoom(ratio) {
  if (cropperImage) {
    cropperImage.$zoom(ratio)
    updatePreview()
  }
}

function rotate(degree) {
  if (cropperImage) {
    cropperImage.$rotate(`${degree}deg`)
    updatePreview()
  }
}

async function crop() {
  const source = cropperSelection || cropperCanvas
  if (!source) return

  cropping.value = true

  try {
    // Use $toCanvas to get the cropped image (Selection = selected area only)
    const canvas = await source.$toCanvas({
      width: AVATAR_SIZE,
      height: AVATAR_SIZE
    })

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 0.95)
    })

    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })

    emit('crop', {
      arrayBuffer,
      file: new File([blob], 'avatar.png', { type: 'image/png' })
    })
  } catch (error) {
    console.error('Crop error:', error)
    alert('Failed to crop image')
  } finally {
    cropping.value = false
  }
}

function close() {
  emit('close')
}

onBeforeUnmount(() => {
  if (cropperCanvas) {
    cropperCanvas.removeEventListener('actionend', updatePreview)
  }
  if (cropper) {
    cropper.destroy()
  }
})
</script>

<style scoped>
/* Cropper.js required styles */
.cropper-container {
  direction: ltr;
  font-size: 0;
  line-height: 0;
  position: relative;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.cropper-container img {
  display: block;
  max-width: 100%;
}

.cropper-canvas,
.cropper-selection,
.cropper-grid,
.cropper-shade,
.cropper-viewer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.cropper-selection {
  border: 1px solid #667eea;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
}

.cropper-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
}

.cropper-handle-n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.cropper-handle-s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.cropper-handle-e { right: -5px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.cropper-handle-w { left: -5px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.cropper-handle-ne { top: -5px; right: -5px; cursor: ne-resize; }
.cropper-handle-nw { top: -5px; left: -5px; cursor: nw-resize; }
.cropper-handle-se { bottom: -5px; right: -5px; cursor: se-resize; }
.cropper-handle-sw { bottom: -5px; left: -5px; cursor: sw-resize; }

.cropper-grid {
  overflow: hidden;
}

.cropper-grid > * {
  position: absolute;
  background: none;
  border: 0;
  border-radius: 0;
  display: block;
  height: 100%;
  margin: 0;
  max-height: none;
  max-width: none;
  padding: 0;
  width: 100%;
}

.cropper-grid-line {
  background: rgba(255, 255, 255, 0.5);
}

.cropper-grid-line-h { height: 1px; width: 100%; left: 0; }
.cropper-grid-line-v { width: 1px; height: 100%; top: 0; }

/* Component styles */
.avatar-cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.cropper-container {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cropper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.cropper-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.cropper-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.image-wrapper {
  max-height: 400px;
  margin-bottom: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper img {
  max-width: 100%;
  display: block;
}

.cropper-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.zoom-controls,
.rotate-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  background: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
}

.preview-section {
  text-align: center;
}

.preview-section p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.preview-large,
.preview-small {
  background: #f0f0f0;
  border-radius: 50%;
  overflow: hidden;
  object-fit: cover;
}

.preview-large {
  width: 100px;
  height: 100px;
}

.preview-small {
  width: 50px;
  height: 50px;
}

.cropper-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
