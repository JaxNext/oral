<template>
  <div :class="['time text-white mx-4 mt-2 mb-1', info.from === 'user' ? 'text-right' : 'text-left']">{{ formatTime(info.timestamp) }}</div>
  <div :class="[
    'chat-item flex items-center mx-4',
    info.from === 'user' ? 'flex-row-reverse' : ''
  ]">
    <audio :src="info.audio" controls />
    <Button class="mx-2" @click="isShowText = !isShowText">TEXT</Button>
  </div>
  <div
    v-if="isShowText"
    :class="[
      'chat-item-content bg-white rounded-lg p-4 w-[300px] mx-4 mt-2',
      info.from === 'user' ? 'ml-auto' : 'mr-auto'
    ]">
    <span>{{ info.content }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
defineProps<{
  info: {
    from: 'user' | 'bot'
    content: string
    audio: string
    timestamp: number
  }
}>()

const isShowText = ref(false)

// format time to YYYY-MM-DD HH:MM:SS
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}
</script>

<style scoped>

</style>
