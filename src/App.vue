<script setup lang="ts">
import DarkMode from '@/components/DarkMode.vue'
import ChatBox from '@/components/ChatBox.vue'
</script>

<template>
  <div class="dark:bg-[rgb(2,8,23)] min-h-screen box-border p-6">
    <DarkMode class="fixed right-2 top-2" />
    <div class="chat-container w-[70vw] min-w-[300px] mx-auto h-[calc(100vh-48px)]">
      <ChatBox />
    </div>
  </div>
</template>