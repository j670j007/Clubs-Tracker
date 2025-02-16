import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register'
import Landing from './components/Landing/Landing'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Landing/>}/>
        <Route path="*" element={<Navigate to ="/login" replace/>}/> /* this will be changed with some safety later */
      </Routes>
    </Router>
  )
}

export default App
