import './page.css'
import energisaNotesLogo from '../assets/energisaNotesLogo.png'
import profileIcon from '../assets/profileicon.png'
import settingsIcon from '../assets/settingsicon.png'
import helpIcon from '../assets/helpicon.png'
import { Link } from "react-router-dom"
import { useMsal } from "@azure/msal-react"
import { useState } from "react"

export default function Header() {

  const { instance } = useMsal()
  const account = instance.getActiveAccount()

  const [openProfile, setOpenProfile] = useState(false)
  const [openHelp, setOpenHelp] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img className="brand-img" src={energisaNotesLogo} alt="logo" />
        </div>

        <nav className="nav">
          <Link to="/home" className="nav-pill">BOOKS</Link>
          <Link to="/veiculos" className="nav-pill">VEÍCULOS</Link>
          <Link to="/group" className="nav-pill">EQUIPES</Link>
          <Link to="/porta-vozes" className="nav-pill">PORTA-VOZES</Link>
        </nav>

        <div className="icons">
          <div className="icon" onClick={() => setOpenProfile(!openProfile)}>
            <img src={profileIcon} alt="profile" />
          </div>

          <div className="icon">
            <img src={settingsIcon} alt="settings" />
          </div>

          <div className="icon" onClick={() => setOpenHelp(!openHelp)}>
            <img src={helpIcon} alt="help" />
          </div>
        </div>
      </header>

      {/* Perfil */}
      {openProfile && (
        <div className="profile-popup">
          <div className="profile-card">
            <h3>Perfil</h3>

            <p><strong>Nome:</strong> {account?.name}</p>
            <p><strong>Email:</strong> {account?.username}</p>
            <p><strong>Sobrenome:</strong> {account?.idTokenClaims?.family_name}</p>
            <p><strong>Telefone:</strong> {account?.idTokenClaims?.phone_number || "Não disponível"}</p>

            <button onClick={() => setOpenProfile(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Ajuda */}
      {openHelp && (
        <div className="help-popup">
          <div className="help-card">
            <h3>Dúvidas Frequentes</h3>
            <ul>
              <li>Como usar o sistema?</li>
              <li>Como reportar um problema?</li>
              <li>Como alterar minhas informações?</li>
              <li>Quem posso contatar?</li>
            </ul>
            <button onClick={() => setOpenHelp(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
