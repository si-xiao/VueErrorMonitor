<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="props.visible" class="app-loading flex loading-bg"
      >
        <div
            class="w-[max-content] h-[max-content] absolute left-0 right-0 top-0 bottom-0 m-auto flex items-center justify-center">
          <svg width="20px" height="20px" viewBox="0 0 20 20" class="e-loading-10">
            <circle cx="10" cy="10" r="8" stroke-width="3" fill="none"></circle>
            <circle cx="10" cy="10" r="8" stroke-width="3" fill="none" stroke-linecap="round"
                    stroke-dasharray="50.26548245743669" stroke-dashoffset="20.106192982974676"></circle>
          </svg>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>
<style scoped>
.back-color-0 {
  background: transparent;
}
.loading-bg {
  background: rgba(32,34,34,.2);
}

.app-loading {
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10000;
}

.e-loading-10 {
  animation: spin 1s linear infinite;
}

.e-loading-10 > circle:first-of-type {
  stroke: var(--color-bg-num-19);
}

.e-loading-10 > circle:last-of-type {
  stroke: var(--color-bg-num-29);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>