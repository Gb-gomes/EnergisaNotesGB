import { Routes, Route } from "react-router-dom"
import Home from "./home/page"
import Login from "./login/page"
import Group from "./group/page"
import PortaVozes from "./portavozes/page"
import Veiculos from "./veiculos/page"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/group" element={<Group />} />
      <Route path="/portavozes" element={<PortaVozes />} />
      <Route path="/veiculos" element={<Veiculos />} />
    </Routes>
  )
}

export default App
