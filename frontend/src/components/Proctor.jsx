import { useEffect, useRef, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export default function Proctor({ onWarning }) {
  const videoRef = useRef()
  const cocoModelRef = useRef(null)
  const [status, setStatus] = useState('Initializing AI models...')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setStatus('Loading Face & Mobile AI Models... ⏳')

      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
      
      // Load Face Detection & Landmark models
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)

      // Load COCO-SSD Mobile Phone Detection model
      const loadedCoco = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
      cocoModelRef.current = loadedCoco

      setStatus('AI Proctoring Ready ✅ Starting Camera...')
      startCamera()
    } catch (err) {
      console.error('Model load error:', err)
      setStatus(`❌ Model Load Error: ${err.message || 'Failed to load AI models'}`)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setStatus('✅ Camera Active - AI Monitoring Started')
          startDetection()
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setStatus('❌ Camera access denied or unavailable')
    }
  }

  const startDetection = () => {
    const interval = setInterval(async () => {
      const video = videoRef.current
      if (!video || video.paused || video.ended || video.readyState < 2) return

      try {
        // 1. Face Detection
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.SsdMobilenetv1Options()
        )

        // 2. Object Detection (Mobile Phone)
        let phoneDetected = false
        let detectedPhoneScore = 0
        let detectedObjectsStr = ''

        if (cocoModelRef.current) {
          const predictions = await cocoModelRef.current.detect(video)
          if (predictions && predictions.length > 0) {
            detectedObjectsStr = predictions
              .map(p => `${p.class} (${Math.round(p.score * 100)}%)`)
              .join(', ')

            const phoneMatch = predictions.find(
              p => ['cell phone', 'phone', 'mobile phone', 'remote'].includes(p.class.toLowerCase()) && p.score >= 0.30
            )
            if (phoneMatch) {
              phoneDetected = true
              detectedPhoneScore = Math.round(phoneMatch.score * 100)
            }
          }
        }

        setDebugInfo(detectedObjectsStr ? `🔍 AI Sees: ${detectedObjectsStr}` : '🔍 Scanning frame...')

        // 3. Handle Warnings & Status Updates
        const warningsList = []

        if (phoneDetected) {
          warningsList.push(`📱 Mobile Phone Detected! (${detectedPhoneScore}%)`)
          onWarning('phone')
        }

        if (detections.length === 0) {
          warningsList.push('⚠️ No face detected!')
          onWarning('no-face')
        } else if (detections.length > 1) {
          warningsList.push(`⚠️ ${detections.length} faces detected!`)
          onWarning('multiple')
        }

        if (warningsList.length > 0) {
          setStatus(warningsList.join(' | '))
        } else {
          setStatus('✅ AI Monitoring Active')
        }
      } catch (err) {
        console.error('Detection loop error:', err)
      }
    }, 2500)

    return () => clearInterval(interval)
  }

  return (
    <div style={styles.container}>
      <p style={styles.title}>🤖 AI Proctor</p>
      <video ref={videoRef} style={styles.video} muted autoPlay playsInline />
      <p style={styles.status}>{status}</p>
      {debugInfo && <p style={styles.debug}>{debugInfo}</p>}
    </div>
  )
}

const styles = {
  container: { background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' },
  title: { fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' },
  video: { width: '100%', borderRadius: '8px', border: '2px solid #ddd', minHeight: '180px', background: '#111' },
  status: { marginTop: '10px', fontWeight: 'bold', color: '#111', fontSize: '14px' },
  debug: { marginTop: '5px', fontSize: '12px', color: '#666', fontStyle: 'italic' }
}