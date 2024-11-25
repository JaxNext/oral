import { pipeline } from '@huggingface/transformers'

class ASRWorker {
  static task = 'automatic-speech-recognition'
  static model = 'Xenova/whisper-small'
  static recognizer = null

  static async getInstance(progress_callback) {
    if (!this.recognizer) {
      this.recognizer = await pipeline(this.task, this.model, { progress_callback })
    }
    return this.recognizer
  }
}

function progressCallback(progress) {
  self.postMessage({ type: 'progress', progress })
}

self.onmessage = async (event) => {
  const { type } = event.data
  if (type === 'load') {
    await ASRWorker.getInstance(progressCallback)
  } else if (type === 'recognize') {
    const transcriber = await ASRWorker.getInstance(progressCallback)
    const { audio } = event.data
    const result = await transcriber(audio)
    self.postMessage({ type: 'result', result })
  }
}
