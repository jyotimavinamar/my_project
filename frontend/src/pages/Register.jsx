import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' })
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      setMsg('Registered successfully! Please login.')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error registering!')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>📝 Register</h2>
        {msg && <p style={styles.msg}>{msg}</p>}
        <input style={styles.input} placeholder="Full Name"
          onChange={e => setForm({...form, name: e.target.value})} />
        <input style={styles.input} placeholder="Email"
          onChange={e => setForm({...form, email: e.target.value})} />
        <input style={styles.input} placeholder="Password" type="password"
          onChange={e => setForm({...form, password: e.target.value})} />
        <select style={styles.input}
          onChange={e => setForm({...form, role: e.target.value})}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button style={styles.btn} onClick={handleSubmit}>Register</button>
        <p style={styles.link}>Already have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f2f5' },
  box: { background:'white', padding:'40px', borderRadius:'10px', width:'350px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign:'center', marginBottom:'20px', color:'#333' },
  input: { width:'100%', padding:'10px', margin:'8px 0', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#2196F3', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', marginTop:'10px', fontSize:'16px' },
  msg: { color:'green', textAlign:'center' },
  link: { textAlign:'center', marginTop:'15px' }
}