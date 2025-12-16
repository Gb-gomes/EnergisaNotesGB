import "./page.css"
import { useMsal } from "@azure/msal-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import energisaIcon from '../assets/energisaicon.png'

export default function Login() {
  const { instance } = useMsal()
  const navigate = useNavigate()

  function handleLogin() {
    instance.loginRedirect({
      scopes: ["user.read"]
    })
  }

  useEffect(() => {
    const accounts = instance.getAllAccounts()
    if (accounts.length > 0) {
      navigate("/home")
    }
  }, [instance])

  return (
    <div className="login-container">
      <div className="logos">
        {/* Texto "Energisa Notes" lado a lado */}
        <div className="brand-text">
          <h3>Energisa</h3>
          <h4>Notes</h4>
        </div>
        {/* Logo com tamanho maior */}
        <img className="logo-notes" src={energisaIcon} alt="Energisa Logo" />
      </div>
    
      <h1 className="login-title">Login Corporativo</h1>
      <p className="login-subtitle">Acesse usando sua conta Microsoft Energisa.</p>

      <button className="login-btn" onClick={handleLogin}>
        Entrar com Microsoft
      </button>
    </div>
  )
}