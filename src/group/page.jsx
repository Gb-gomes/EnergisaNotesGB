import './page.css'
import searchIcon from '../assets/searchicon.png'
import { useMsal } from "@azure/msal-react"

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
        <div className="search-group">
          <img src={searchIcon} className="search-img" alt="Buscar" />
          <input type="text" placeholder="Pesquisar grupo..." />
        </div>
        <h1>Área</h1>
      </div>
      <div className="group-list">
        {groups.map((g, i) => (
          <div className="group-item" key={i}>
           
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)
    </>
  )
}
