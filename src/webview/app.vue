<template>
  <div class='flex items-center flex-col w-3/4 mx-auto'>
    <h1 class='text-lg'>
      Vue 3 Extension Template
    </h1>

    <p class='mt-4 mb-2'>
      Current File: {{ currentFile }}
    </p>
    <button>
      Open Last File
    </button>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

const currentFile = ref('guf.u')

</script>
