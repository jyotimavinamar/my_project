import { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [tab, setTab] = useState('exams')
  const [form, setForm] = useState({ title: '', duration: '', questions: [] })
  const [question, setQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '' })
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
    fetchResults()
  }, [])

  const fetchExams = async () => {
    const res = await api.get('/api/exam/all',
      { headers: { authorization: token } })
    setExams(res.data)
  }

  const fetchResults = async () => {
    try {
      const res = await api.get('/api/result/all',
        { headers: { authorization: token } })
      setResults(res.data)
    } catch (err) { console.log(err) }
  }

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, question] })
    setQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' })
  }

  const createExam = async () => {
    try {
      await api.post('/api/exam/create', form,
        { headers: { authorization: token } })
      alert('Exam created successfully! ✅')
      fetchExams()
      setForm({ title: '', duration: '', questions: [] })
    } catch (err) { alert('Error creating exam!') }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👨‍💼 Admin Dashboard - Welcome {name}!</h2>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      <div style={styles.tabs}>
        <button style={tab === 'exams' ? styles.activeTab : styles.tab}
          onClick={() => setTab('exams')}>📝 Create Exam</button>
        <button style={tab === 'list' ? styles.activeTab : styles.tab}
          onClick={() => setTab('list')}>📋 All Exams</button>
        <button style={tab === 'results' ? styles.activeTab : styles.tab}
          onClick={() => setTab('results')}>📊 Results</button>
      </div>

      {tab === 'exams' && (
        <div style={styles.card}>
          <h3>Create New Exam</h3>
          <input style={styles.input} placeholder="Exam Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={styles.input} placeholder="Duration (minutes)"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })} />

          <h4>Add Question ({form.questions.length} added)</h4>
          <input style={styles.input} placeholder="Question"
            value={question.question}
            onChange={e => setQuestion({ ...question, question: e.target.value })} />
          {question.options.map((opt, i) => (
            <input key={i} style={styles.input} placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => {
                const opts = [...question.options]
                opts[i] = e.target.value
                setQuestion({ ...question, options: opts })
              }} />
          ))}
          <input style={styles.input} placeholder="Correct Answer (exactly as option)"
            value={question.correctAnswer}
            onChange={e => setQuestion({ ...question, correctAnswer: e.target.value })} />
          <button style={styles.addBtn} onClick={addQuestion}>+ Add Question</button>
          <button style={styles.createBtn} onClick={createExam}>🚀 Create Exam</button>
        </div>
      )}

      {tab === 'list' && (
        <div style={styles.card}>
          <h3>All Exams</h3>
          {exams.map(exam => (
            <div key={exam._id} style={styles.examCard}>
              <h4>{exam.title}</h4>
              <p>⏱ Duration: {exam.duration} mins</p>
              <p>❓ Questions: {exam.questions.length}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'results' && (
        <div style={styles.card}>
          <h3>All Results</h3>
          {results.map(r => (
            <div key={r._id} style={styles.examCard}>
              <p>👤 Student: {r.student?.name}</p>
              <p>📝 Exam: {r.exam?.title}</p>
              <p>🎯 Score: {r.score}</p>
              <p>Status: <span style={{ color: r.status === 'pass' ? 'green' : 'red' }}>
                {r.status?.toUpperCase()}</span></p>
              <p>⚠️ Warnings: {r.warnings}</p>
              <p>🔄 Tab Switches: {r.tabSwitches || 0}</p>
              <p>📱 Mobile Phone Detected: {r.phoneDetected || 0}</p>
              <p>👁️ Face Not Detected: {r.faceNotDetected || 0}</p>
              <p>👥 Multiple Faces: {r.multipleFaces || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '20px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'white' },
  activeTab: { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#4CAF50', color: 'white' },
  card: { background: 'white', padding: '25px', borderRadius: '10px' },
  input: { width: '100%', padding: '10px', margin: '6px 0', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  addBtn: { padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', margin: '10px 0' },
  createBtn: { width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontSize: '16px' },
  examCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  logoutBtn: { padding: '8px 16px', background: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
}