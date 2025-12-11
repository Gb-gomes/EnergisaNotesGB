import './page.css'
import energisaIcon from '../assets/energisaicon.png'
import searchIcon from '../assets/searchicon.png'
// import arrowLeft from '../assets/arrowleft.png'
// import arrowRight from '../assets/arrowright.png'
import { useMsal } from "@azure/msal-react"


import Header from "../header/page"

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

  return (
    <>
 
      <Header />


      <div className="app" style={{ paddingTop: "90px" }}>

        <main className="main">

          <div className="search-row">
            <div className="search">
              <img src={searchIcon} className="search-img" alt="search" />
              <input placeholder="Pesquisar" />
            </div>
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
    </>
  )
}
