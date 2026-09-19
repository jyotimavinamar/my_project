import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('name', res.data.name)
      if (res.data.role === 'admin') navigate('/admin')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🎓 Exam Portal Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button style={styles.btn} onClick={handleSubmit}>Login</button>
        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
  box: { background: 'white', padding: '40px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  input: { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontSize: '16px' },
  error: { color: 'red', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '15px' }
}