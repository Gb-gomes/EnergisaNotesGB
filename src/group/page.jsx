import './page.css'
import searchIcon from '../assets/searchicon.png'
import { useMsal } from "@azure/msal-react"
// import arrowLeft from '../assets/arrowleft.png'
// import arrowRight from '../assets/arrowright.png'
import energisaIcon from '../assets/energisaicon.png'

import Header from "../header/page"

export default function Group() {

  const { instance } = useMsal()
  const account = instance.getActiveAccount()

  const groups = [
    "Impresa e Institucional",
    "Time de BPs e analistas",
    "Comunicação Interna, áreas corporativas e novos negócios",
    "Comunicação interna e Redes",
    "Experiência de Marca",
    "Eventos",
  ]

  return (
    <>
<div style={{ backgroundColor: '#009FC3', minHeight: '100vh' }}>
    <Header />
    <div className="group-page">
      <div className="group-header">

        <div className="search-row">
       
              <div className="search">
                  <img src={searchIcon} className="search-img" alt="search" />
                  <input placeholder="Pesquisar" />
              </div>
          
        </div>


        <h1>Área</h1>
        <div className="rowOrange"></div>
      </div>
      <div className="group-list">
        {groups.map((g, i) => (
          <div className="group-item" key={i}>
           
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
      <div className="bottom-logo">
              <img src={energisaIcon} alt="energisa" />
            </div>
  </div>

    </>
  )
}