<template>
  <div class="chat-box flex flex-col h-full">
    <div ref="chatListRef" class="chat-list h-[calc(100%-120px)] border border-red-500 overflow-y-auto flex flex-col">
        <ChatItem
          v-for="(item, index) in chatList"
          :key="index"
          :info="item"
          class="msg" />
    </div>
    <div class="input-box h-[120px] mt-auto text-right">
      <div class="recording-status" v-if="isRecording">
        Recording... 🎤
      </div>
      <Button 
        class="mt-[12px] mr-2" 
        @click="startRecording" 
        :disabled="isRecording">
        Start Recording
      </Button>
      <Button 
        class="mt-[12px]" 
        @click="stopRecording" 
        :disabled="!isRecording"
        variant="destructive">
        Stop Recording
      </Button>
      <Button class="mt-[12px] mr-2" @click="loadModel">
        Load Model
      </Button>
      <div class="status text-white text-right mt-2">
        <div class="asr-status">{{ asrStatus }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import ChatItem from '@/components/ChatItem.vue'

type ChatMessage = {
  from: 'user' | 'bot'
  content: string
  audio: string
  timestamp: number
}

const asrStatus = ref('')
const asrWorker = new Worker(new URL('@/workers/asr.js', import.meta.url), { type: 'module' })
asrWorker.onmessage = (event) => {
  const { type, progress: progressData, result } = event.data
  if (type === 'progress') {
    const { name, file, status, progress } = progressData
    asrStatus.value = `ASR: ${name || ''} ${file || ''} ${status || ''} ${progress ? `${progress}%` : ''}`
  } else if (type === 'result') {
    console.log('asr result', result)
    const { text } = result
    asrStatus.value = `ASR: ${text}`
  }
}


const chatList = ref<ChatMessage[]>([])

const chatListRef = ref<HTMLElement | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const isRecording = ref(false)
const audioChunks = ref<Blob[]>([])

const getAudioData = async (audioBlob: Blob): Promise<Float32Array> => {
  const audioContext = new AudioContext()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  
  // Get audio data from the first channel
  const audioData = audioBuffer.getChannelData(0)
  return audioData
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      try {
        // Decode audio data before sending to worker
        const audioData = await getAudioData(audioBlob)
        asrWorker.postMessage({ type: 'recognize', audio: audioData })
      } catch (error) {
        console.error('Error processing audio:', error)
        asrStatus.value = 'Error processing audio'
      }

      // Add message to chat list
      chatList.value.push({
        from: 'user',
        content: '',
        audio: audioUrl,
        timestamp: Date.now()
      })
      
      // Clear chunks for next recording
      audioChunks.value = []
      autoScroll()
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (error) {
    console.error('Error accessing microphone:', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
    isRecording.value = false
  }
}

const autoScroll = () => {
  nextTick(() => {
    const chatContainer = chatListRef.value
    if (chatContainer) {
      const lastMessage = chatContainer.lastElementChild
      lastMessage?.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const loadModel = () => {
  console.log('load model')
  asrWorker.postMessage({ type: 'load' })
}

onMounted(() => {
  autoScroll()
})
</script>

<style scoped>
.chat-list {
  .msg:first-of-type {
    /* margin-top: calc(100% - 120px); */
  }
}
</style>
