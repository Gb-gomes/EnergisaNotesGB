import './page.css'
import energisaIcon from '../assets/energisaicon.png'
import searchIcon from '../assets/searchicon.png'
import arrowLeft from '../assets/arrowleft.png'
import arrowRight from '../assets/arrowright.png'
import { useMsal } from "@azure/msal-react"
import { useEffect, useState } from 'react'
import Header from "../header/page"

export default function Home() {
  const [categorias, setCategorias] = useState([])
  const [incidentes, setIncidentes] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [loadingIncidentes, setLoadingIncidentes] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermIncidentes, setSearchTermIncidentes] = useState('')

  const { instance } = useMsal()
  //#const account = instance.getActiveAccount()

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const response = await fetch('http://localhost:5038/api/Categorias')
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
      }
      
      const data = await response.json()
      setCategorias(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro ao carregar categorias')
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const fetchIncidentes = async (categoriaId, categoriaNome) => {
    try {
      setLoadingIncidentes(true)
      setCategoriaSelecionada({ id: categoriaId, nome: categoriaNome })
      
      const response = await fetch('http://localhost:5038/api/Incidentes')
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
      }
      
      const data = await response.json()
      // Filtra incidentes pela categoria selecionada
      const incidentesDaCategoria = data.filter(incidente => 
        incidente.categoria?.toLowerCase() === categoriaNome?.toLowerCase() ||
        incidente.categoriaNome?.toLowerCase() === categoriaNome?.toLowerCase()
      )
      
      setIncidentes(incidentesDaCategoria)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro ao carregar incidentes')
      console.error('Erro ao buscar incidentes:', err)
    } finally {
      setLoadingIncidentes(false)
    }
  }

  const handleRetry = () => {
    if (categoriaSelecionada) {
      fetchIncidentes(categoriaSelecionada.id, categoriaSelecionada.nome)
    } else {
      fetchCategorias()
    }
  }

  const handleCategoriaClick = (categoriaId, categoriaNome) => {
    fetchIncidentes(categoriaId, categoriaNome)
  }

  const handleBack = () => {
    setCategoriaSelecionada(null)
    setIncidentes([])
    setSearchTermIncidentes('')
  }

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredIncidentes = incidentes.filter(incidente =>
    incidente.titulo.toLowerCase().includes(searchTermIncidentes.toLowerCase())
  )

  return (
    <>
      <Header />

      <div className="app" style={{ paddingTop: "90px" }}>
        <main className="main">
          {/* Barra de busca superior - FORMATO ORIGINAL */}
          <div className="search-row">
            {categoriaSelecionada ? (
              <img 
                src={arrowLeft} 
                alt="voltar" 
                onClick={handleBack}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <img 
                src={arrowLeft} 
                alt="voltar" 
                onClick={() => window.history.back()}
                style={{ cursor: 'pointer' }}
              />
            )}
            
            <div className="search">
              <img src={searchIcon} className="search-img" alt="search" />
              <input 
                placeholder={
                  categoriaSelecionada 
                    ? `Pesquisar em ${categoriaSelecionada.nome}...` 
                    : "Pesquisar categoria..."
                }
                value={categoriaSelecionada ? searchTermIncidentes : searchTerm}
                onChange={(e) => 
                  categoriaSelecionada 
                    ? setSearchTermIncidentes(e.target.value)
                    : setSearchTerm(e.target.value)
                }
              />
            </div>
            
            <img 
              src={arrowRight} 
              alt="atualizar" 
              onClick={() => 
                categoriaSelecionada 
                  ? fetchIncidentes(categoriaSelecionada.id, categoriaSelecionada.nome)
                  : fetchCategorias()
              }
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Lista de categorias ou incidentes */}
          <div className="list-wrap">
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-button">
                  Tentar novamente
                </button>
              </div>
            )}
            
            {!error && categoriaSelecionada ? (
              // SEÇÃO DE INCIDENTES (quando uma categoria está selecionada)
              <div className="incidentes-section">
                <div className="category-header">
                  <h2>{categoriaSelecionada.nome}</h2>
                   <div className="rowOrange"></div>
                </div>
                
                {loadingIncidentes ? (
                  <div className="loading-state">Carregando incidentes...</div>
                ) : (
                  <div className="list">
                    {filteredIncidentes.length === 0 ? (
                      <div className="empty-state">
                        {searchTermIncidentes 
                          ? 'Nenhum incidente encontrado para sua busca' 
                          : 'Nenhum incidente cadastrado nesta categoria'}
                      </div>
                    ) : (
                      filteredIncidentes.map((incidente) => (
                        <div 
                          key={incidente.id} 
                          className="list-item"
                        >
                          {incidente.titulo}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              // SEÇÃO DE CATEGORIAS (padrão)
              <div className="list">
                {loadingCategorias && (
                  <div className="loading-state">Carregando categorias...</div>
                )}
                
                {!loadingCategorias && filteredCategorias.length === 0 ? (
                  <div className="empty-state">
                    {searchTerm ? 'Nenhuma categoria encontrada para sua busca' : 'Nenhuma categoria cadastrada'}
                  </div>
                ) : (
                  !loadingCategorias && filteredCategorias.map((categoria) => (
                    <div 
                      key={categoria.id} 
                      className="list-item"
                      onClick={() => handleCategoriaClick(categoria.id, categoria.nome || categoria.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      {categoria.nome || categoria.name || `Categoria ${categoria.id}`}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
 
        <div className="bottom-logo">
          <img src={energisaIcon} alt="energisa" />
        </div>
      </div>
    </>
  )
}