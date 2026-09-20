import { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [tab, setTab] = useState('exams')
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
      const res = await api.get('/api/result/my',
        { headers: { authorization: token } })
      setResults(res.data)
    } catch (err) { console.log(err) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👨‍🎓 Student Dashboard - Welcome {name}!</h2>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      <div style={styles.tabs}>
        <button style={tab === 'exams' ? styles.activeTab : styles.tab}
          onClick={() => setTab('exams')}>📝 Available Exams</button>
        <button style={tab === 'results' ? styles.activeTab : styles.tab}
          onClick={() => setTab('results')}>📊 My Results</button>
      </div>

      {tab === 'exams' && (
        <div style={styles.card}>
          <h3>Available Exams</h3>
          {exams.length === 0 && <p>No exams available yet!</p>}
          {exams.map(exam => (
            <div key={exam._id} style={styles.examCard}>
              <h4>{exam.title}</h4>
              <p>⏱ Duration: {exam.duration} mins</p>
              <p>❓ Questions: {exam.questions.length}</p>
              <button style={styles.startBtn}
                onClick={() => navigate(`/exam/${exam._id}`)}>
                🚀 Start Exam
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'results' && (
        <div style={styles.card}>
          <h3>My Results</h3>
          {results.length === 0 && <p>No results yet!</p>}
          {results.map(r => (
            <div key={r._id} style={styles.examCard}>
              <p>📝 Exam: {r.exam?.title}</p>
              <p>🎯 Score: {r.score}</p>
              <p>Status: <span style={{ color: r.status === 'pass' ? 'green' : 'red' }}>
                {r.status?.toUpperCase()}</span></p>
              <p>⚠️ Warnings: {r.warnings}</p>
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
  activeTab: { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#2196F3', color: 'white' },
  card: { background: 'white', padding: '25px', borderRadius: '10px' },
  examCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  startBtn: { padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
  logoutBtn: { padding: '8px 16px', background: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
}