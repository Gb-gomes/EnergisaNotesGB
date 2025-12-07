import { Routes, Route } from "react-router-dom"
import Home from "./home/page"
import Login from "./login/page"
import Group from "./group/page"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/group" element={<Group />} />
    </Routes>
  )
}

export default App
