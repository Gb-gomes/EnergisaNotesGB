import './page.css'
import energisaIcon from '../assets/energisaicon.png'
import searchIcon from '../assets/searchicon.png'
import arrowLeft from '../assets/arrowleft.png'
import arrowRight from '../assets/arrowright.png'
import { useMsal } from "@azure/msal-react"
import { useEffect, useState } from 'react'
import Header from "../header/page"

export default function Home() {
  // Estados de Dados
  const [categorias, setCategorias] = useState([])
  const [incidentes, setIncidentes] = useState([])
  
  // Estados de Navegação
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [incidenteSelecionado, setIncidenteSelecionado] = useState(null) 
  
  // Estados de Loading/Erro
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [loadingIncidentes, setLoadingIncidentes] = useState(false)
  const [error, setError] = useState(null)
  
  // Estados de Busca
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermIncidentes, setSearchTermIncidentes] = useState('')

  // NOVO: Estado para controlar o Pop-up (Toast) de sucesso
  const [showToast, setShowToast] = useState(false)

  const { instance } = useMsal()

  useEffect(() => {
    fetchCategorias()
  }, [])

  // ... (Funções fetchCategorias e fetchIncidentes mantidas iguais) ...
  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const response = await fetch('http://localhost:5038/api/Categorias')
      if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`)
      const data = await response.json()
      setCategorias(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro ao carregar categorias')
      console.error(err)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const fetchIncidentes = async (categoriaId, categoriaNome) => {
    try {
      setLoadingIncidentes(true)
      setCategoriaSelecionada({ id: categoriaId, nome: categoriaNome })
      const response = await fetch('http://localhost:5038/api/Incidentes')
      if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`)
      const data = await response.json()
      
      const incidentesDaCategoria = data.filter(incidente => 
        incidente.categoria?.toLowerCase() === categoriaNome?.toLowerCase() ||
        incidente.categoriaNome?.toLowerCase() === categoriaNome?.toLowerCase()
      )
      
      setIncidentes(incidentesDaCategoria)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro ao carregar incidentes')
      console.error(err)
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

  const handleIncidenteClick = (incidente) => {
    setIncidenteSelecionado(incidente);
  }

  const handleBack = () => {
    if (incidenteSelecionado) {
      setIncidenteSelecionado(null);
    } else if (categoriaSelecionada) {
      setCategoriaSelecionada(null);
      setIncidentes([]);
      setSearchTermIncidentes('');
    }
  }

  // ATUALIZADO: Copiar Texto com Pop-up visual
  const handleCopy = () => {
    if (incidenteSelecionado) {
      const textoParaCopiar = incidenteSelecionado.TextoTemplate || incidenteSelecionado.textoTemplate || "";
      navigator.clipboard.writeText(textoParaCopiar);
      
      // Mostra o Toast
      setShowToast(true);

      // Esconde o Toast depois de 3 segundos
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

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
          {/* BARRA DE NAVEGAÇÃO / BUSCA */}
          <div className="search-row">
            {categoriaSelecionada || incidenteSelecionado ? (
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
            
            {!incidenteSelecionado ? (
              <>
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
              </>
            ) : (
               <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#555' }}>
                 Copiar Modelo
               </div>
            )}
          </div>

          <div className="list-wrap">
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-button">
                  Tentar novamente
                </button>
              </div>
            )}
            
            {!error && (
              <>
                {/* 1. TELA DE VISUALIZAÇÃO DO TEXTO */}
                {incidenteSelecionado ? (
                   <div className="incidentes-section" style={{ padding: '0 10px' }}>
                     <div className="category-header">
                       <h2>{incidenteSelecionado.titulo}</h2>
                       <div className="rowOrange"></div>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                       <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Modelo de Texto:</label>
                       
                       <div style={{ 
                           backgroundColor: '#f8f9fa', 
                           padding: '20px', 
                           borderRadius: '8px', 
                           border: '1px solid #dee2e6',
                           whiteSpace: 'pre-wrap',
                           lineHeight: '1.6',
                           color: '#333',
                           fontSize: '1rem',
                           marginBottom: '20px'
                         }}>
                           {incidenteSelecionado.TextoTemplate || incidenteSelecionado.textoTemplate || "Texto não disponível."}
                       </div>

                       <button 
                         onClick={handleCopy}
                         style={{
                           backgroundColor: '#F37021',
                           color: 'white',
                           border: 'none',
                           padding: '15px',
                           borderRadius: '8px',
                           fontSize: '1.1rem',
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                         }}
                       >
                         Copiar Texto
                       </button>
                     </div>
                   </div>
                ) : categoriaSelecionada ? (
                  // ... (Lista de incidentes mantida igual)
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
                              onClick={() => handleIncidenteClick(incidente)}
                              style={{ cursor: 'pointer' }}
                            >
                              {incidente.titulo}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // ... (Lista de categorias mantida igual)
                  <div className="list">
                    {loadingCategorias && (
                      <div className="loading-state">Carregando categorias...</div>
                    )}
                    {!loadingCategorias && filteredCategorias.length === 0 ? (
                      <div className="empty-state">
                        {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
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
              </>
            )}
          </div>
        </main>
 
        <div className="bottom-logo">
          <img src={energisaIcon} alt="energisa" />
        </div>

        {/* NOVO: O Pop-up (Toast) renderizado condicionalmente */}
        {showToast && (
          <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#28a745', // Verde sucesso
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            fontWeight: '600',
            fontSize: '0.95rem',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            ✓ Texto copiado com sucesso!
          </div>
        )}

      </div>
    </>
  )
}