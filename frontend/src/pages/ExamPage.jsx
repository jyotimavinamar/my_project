import { useState, useEffect, useRef } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'
import Proctor from '../components/Proctor'

export default function ExamPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [faceNotDetected, setFaceNotDetected] = useState(0)
  const [multipleFaces, setMultipleFaces] = useState(0)
  const [phoneDetected, setPhoneDetected] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const token = localStorage.getItem('token')
  const timerRef = useRef(null)

  useEffect(() => {
    fetchExam()

    const preventDefault = (e) => {
      e.preventDefault()
      alert('🚫 Copying, pasting, and cutting are disabled during the exam!')
    }

    const preventRightClick = (e) => {
      e.preventDefault()
      alert('🚫 Right-click context menu is disabled during the exam!')
    }

    const handleKeyDown = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U (View Source), F12 (Dev Tools)
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'u', 'C', 'V', 'X', 'U'].includes(e.key)) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'I', 'J'].includes(e.key))
      ) {
        e.preventDefault()
        alert('🚫 This action/shortcut is disabled during the exam!')
      }
    }

    document.addEventListener('visibilitychange', handleTabSwitch)
    document.addEventListener('copy', preventDefault)
    document.addEventListener('paste', preventDefault)
    document.addEventListener('cut', preventDefault)
    document.addEventListener('contextmenu', preventRightClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleTabSwitch)
      document.removeEventListener('copy', preventDefault)
      document.removeEventListener('paste', preventDefault)
      document.removeEventListener('cut', preventDefault)
      document.removeEventListener('contextmenu', preventRightClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && exam) {
      handleSubmit()
    }
    return () => clearTimeout(timerRef.current)
  }, [timeLeft, submitted])

  const fetchExam = async () => {
    const res = await api.get('/api/exam/all',
      { headers: { authorization: token } })
    const found = res.data.find(e => e._id === id)
    setExam(found)
    setTimeLeft(found.duration * 60)
    setAnswers(new Array(found.questions.length).fill(''))
  }

  const handleTabSwitch = () => {
    if (document.hidden) {
      setTabSwitches(t => t + 1)
      setWarnings(w => w + 1)
      alert('⚠️ Warning! Do not switch tabs during exam!')
    }
  }

  const handleFaceWarning = (type) => {
    setWarnings(w => w + 1)
    if (type === 'no-face') setFaceNotDetected(f => f + 1)
    if (type === 'multiple') setMultipleFaces(f => f + 1)
    if (type === 'phone' || type === 'mobile-phone') setPhoneDetected(p => p + 1)
  }

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    clearTimeout(timerRef.current)
    try {
      const res = await api.post('/api/result/submit',
        { examId: id, answers, warnings, tabSwitches, faceNotDetected, multipleFaces, phoneDetected },
        { headers: { authorization: token } })
      alert(`✅ Exam Submitted!\nScore: ${res.data.score}\nPercentage: ${res.data.percentage.toFixed(1)}%\nStatus: ${res.data.status.toUpperCase()}`)
      navigate('/student')
    } catch (err) {
      alert('Error submitting exam!')
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!exam) return <div style={styles.loading}>Loading exam... ⏳</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📝 {exam.title}</h2>
        <div style={styles.timer}>⏱ {formatTime(timeLeft)}</div>
        <div style={styles.warnings}>⚠️ Warnings: {warnings}</div>
      </div>

      <div style={styles.body}>
        <div style={styles.questions}>
          {exam.questions.map((q, i) => (
            <div key={i} style={styles.questionCard}>
              <p style={styles.questionText}>Q{i + 1}. {q.question}</p>
              {q.options.map((opt, j) => (
                <label key={j} style={styles.option}>
                  <input type="radio" name={`q${i}`} value={opt}
                    checked={answers[i] === opt}
                    onChange={() => {
                      const newAns = [...answers]
                      newAns[i] = opt
                      setAnswers(newAns)
                    }} />
                  {' '}{opt}
                </label>
              ))}
            </div>
          ))}
          <button style={styles.submitBtn} onClick={handleSubmit}>
            ✅ Submit Exam
          </button>
        </div>

        <div style={styles.proctorBox}>
          <Proctor onWarning={handleFaceWarning} />
          <div style={styles.proctorInfo}>
            <p>👁️ Face Not Detected: {faceNotDetected}</p>
            <p>👥 Multiple Faces: {multipleFaces}</p>
            <p>📱 Mobile Phone: {phoneDetected}</p>
            <p>🔄 Tab Switches: {tabSwitches}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { 
    background: '#f0f2f5', 
    minHeight: '100vh',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  timer: { fontSize: '24px', fontWeight: 'bold', color: 'red' },
  warnings: { fontSize: '16px', color: 'orange', fontWeight: 'bold' },
  body: { display: 'flex', gap: '20px', padding: '20px' },
  questions: { flex: 1 },
  questionCard: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px' },
  questionText: { fontWeight: 'bold', marginBottom: '10px' },
  option: { display: 'block', padding: '8px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' },
  proctorBox: { width: '300px' },
  proctorInfo: { background: 'white', padding: '15px', borderRadius: '10px', marginTop: '10px' }
}