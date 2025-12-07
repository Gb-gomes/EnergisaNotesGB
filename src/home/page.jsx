import './page.css'
import energisaIcon from '../assets/energisaicon.png'
import energisaNotesLogo from '../assets/energisaNotesLogo.png'
import profileIcon from '../assets/profileicon.png'
import settingsIcon from '../assets/settingsicon.png'
import helpIcon from '../assets/helpicon.png'
import searchIcon from '../assets/searchicon.png'
import arrowLeft from '../assets/arrowleft.png'
import arrowRight from '../assets/arrowright.png'
import { useState } from "react"
import { useMsal } from "@azure/msal-react"

export default function Home() {

  const items = [
    'Acidentes com a comunidade',
    'Acidentes com colaboradores próprios ou terceirizados',
    'Acidentes de trânsito',
    'Ações de órgãos públicos e agências reguladoras',
    'Atendimento ao cliente',
    'Conta',
    'Contingências climáticas',
    'Contrato com terceiros',
    'Danos',
    'Eleições',
    'Projeto técnico'
  ]

  const { instance } = useMsal()
  const account = instance.getActiveAccount()

  const [open, setOpen] = useState(false)

  function togglePopup() {
    setOpen(!open)
  }

  return (
    <>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <img className="brand-img" src={energisaNotesLogo} alt="Energisa Notes Logo" />
          </div>

          <nav className="nav">
            <button className="nav-pill active">BOOKS</button>
            <button className="nav-pill">VEÍCULOS</button>
            <button className="nav-pill">EQUIPES</button>
            <button className="nav-pill">PORTA-VOZES</button>
          </nav>

          <div className="icons">
            <div className="icon" onClick={togglePopup}>
              <img src={profileIcon} alt="profile" />
            </div>
            <div className="icon"><img src={settingsIcon} alt="settings" /></div>
            <div className="icon"><img src={helpIcon} alt="help" /></div>
          </div>
        </header>

        <main className="main">
          <div className="search-row">
            <img src={arrowLeft} />
            <div className="search">
              <img src={searchIcon} className="search-img" alt="search" />
              <input placeholder="Pesquisar" />
            </div>
            <img src={arrowRight} alt="go" />
          </div>

          <div className="list-wrap">
            <div className="list">
              {items.map((t, i) => (
                <div key={i} className="list-item">{t}</div>
              ))}
            </div>
          </div>
        </main>

        <div className="bottom-logo">
          <img src={energisaIcon} alt="energisa" />
        </div>
      </div>

      {/* POP-UP DO PERFIL */}
      {open && (
        <div className="profile-popup">
          <div className="profile-card">

            <h3>Perfil</h3>

            <p><strong>Nome:</strong> {account?.name}</p>
            <p><strong>Email:</strong> {account?.username}</p>
            <p><strong>Sobrenome:</strong> {account?.idTokenClaims?.family_name}</p>
            <p><strong>Telefone:</strong> {account?.idTokenClaims?.phone_number || "Não disponível"}</p>

            <button onClick={() => setOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  )
}
