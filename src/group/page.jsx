import './page.css'
import searchIcon from '../assets/searchicon.png'
import arrowLeft from '../assets/arrowleft.png'
import arrowRight from '../assets/arrowright.png'
import energisaIcon from '../assets/energisaicon.png'
import { useMsal } from "@azure/msal-react"
import { useEffect, useState } from 'react'
import Header from "../header/page"

export default function Group() {
  const { instance } = useMsal()

  // --- ESTADOS DE DADOS ---
  const [areas, setAreas] = useState([])
  const [equipes, setEquipes] = useState([])
  
  // Estado para o "Detalhe" de uma pessoa (seja coordenador ou colaborador comum)
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null) 
  
  // Estado para a lista de colaboradores da área
  const [colaboradoresArea, setColaboradoresArea] = useState([]) 

  // --- ESTADOS DE NAVEGAÇÃO ---
  const [areaSelecionada, setAreaSelecionada] = useState(null) 
  const [equipeSelecionada, setEquipeSelecionada] = useState(null)
  
  // Controla se estamos vendo a tela de detalhes de uma pessoa
  const [visualizandoPessoa, setVisualizandoPessoa] = useState(false)

  // --- ESTADOS DE UI ---
  const [loadingAreas, setLoadingAreas] = useState(true)
  const [loadingEquipes, setLoadingEquipes] = useState(false)
  const [loadingPessoa, setLoadingPessoa] = useState(false)
  const [loadingColaboradores, setLoadingColaboradores] = useState(false)
  const [error, setError] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermEquipes, setSearchTermEquipes] = useState('')
  
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    fetchAreas()
  }, [])

  // --- FUNÇÕES DE API ---

  const fetchAreas = async () => {
    try {
      setLoadingAreas(true)
      const response = await fetch('http://localhost:5038/api/Areas')
      if (!response.ok) throw new Error(`Erro: ${response.status}`)
      const data = await response.json()
      setAreas(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro ao carregar áreas')
    } finally {
      setLoadingAreas(false)
    }
  }

  // Busca detalhes de uma pessoa específica pelo ID (usado para o Coordenador)
  const fetchDetalhesPessoa = async (id) => {
    if (!id) return;

    try {
      setLoadingPessoa(true)
      setPessoaSelecionada(null) 

      const response = await fetch(`http://localhost:5038/api/Colaboradores/${id}`)
      
      if (!response.ok) {
         // Fallback
         const responseAll = await fetch(`http://localhost:5038/api/Colaboradores`)
         const allData = await responseAll.json()
         const found = allData.find(c => c.id === id || c.Id === id)
         if(found) setPessoaSelecionada(found)
      } else {
         const data = await response.json()
         setPessoaSelecionada(data)
      }
    } catch (err) {
      console.error("Erro ao buscar pessoa:", err)
    } finally {
      setLoadingPessoa(false)
    }
  }

  // Busca TODOS os colaboradores da área
  const fetchColaboradoresDaArea = async (areaId) => {
    try {
      setLoadingColaboradores(true)
      setColaboradoresArea([])

      // Assume que precisamos pegar todos e filtrar, ou use api/Colaboradores?areaId=X se existir
      const response = await fetch('http://localhost:5038/api/Colaboradores')
      if (!response.ok) throw new Error(`Erro: ${response.status}`)
      
      const allData = await response.json()
      
      // Filtra por areaId
      const filtrados = allData.filter(c => c.areaId === areaId)
      
      setColaboradoresArea(filtrados)

    } catch (err) {
      console.error("Erro ao buscar colaboradores da área", err)
    } finally {
      setLoadingColaboradores(false)
    }
  }

  const fetchEquipes = async (areaId, areaNome) => {
    try {
      setLoadingEquipes(true)
      setEquipes([]) 
      
      const response = await fetch('http://localhost:5038/api/Areas')
      if (!response.ok) throw new Error(`Erro: ${response.status}`)
      const data = await response.json()
      
      const equipesDaArea = data.filter(equipe => 
        equipe.area?.toLowerCase() === areaNome?.toLowerCase() ||
        equipe.areaNome?.toLowerCase() === areaNome?.toLowerCase()
      )
      setEquipes(equipesDaArea)
      setError(null)

    } catch (err) {
      setError(err.message || 'Erro ao carregar equipes')
    } finally {
      setLoadingEquipes(false)
    }
  }

  // --- HANDLERS ---

  const handleAreaClick = (area) => {
    setAreaSelecionada(area) 
    
    // 1. Busca Equipes
    fetchEquipes(area.id, area.nome)
    
    // 2. Busca o Coordenador (apenas para ter os detalhes completos caso clique nele)
    if (area.coordenadorId) {
        fetchDetalhesPessoa(area.coordenadorId)
    } else {
        setPessoaSelecionada(null)
    }

    // 3. Busca a lista de colaboradores da área
    fetchColaboradoresDaArea(area.id)
  }

  const handleEquipeClick = (equipe) => {
    setEquipeSelecionada(equipe)
  }

  // Ação ao clicar no card da Coordenação
  const handleCoordenadorClick = () => {
    if (pessoaSelecionada) {
      setVisualizandoPessoa(true)
    }
  }

  // Ação ao clicar em um Colaborador da lista
  const handleColaboradorClick = (colaborador) => {
    // Define a pessoa selecionada como o colaborador clicado
    setPessoaSelecionada(colaborador)
    setVisualizandoPessoa(true)
  }

  const handleBack = () => {
    if (visualizandoPessoa) {
      // Se estava vendo detalhes, volta para a lista da área
      setVisualizandoPessoa(false)
      // Se tivermos um coordenador salvo na área, restauramos ele no "pessoaSelecionada" para o card de cima funcionar rápido? 
      // Não é estritamente necessário pois o clique no card busca de novo ou usa cache, mas podemos resetar:
      if (areaSelecionada?.coordenadorId) {
          fetchDetalhesPessoa(areaSelecionada.coordenadorId) 
      }
    } else if (equipeSelecionada) {
      setEquipeSelecionada(null)
    } else if (areaSelecionada) {
      setAreaSelecionada(null)
      setEquipes([])
      setColaboradoresArea([])
      setPessoaSelecionada(null)
      setSearchTermEquipes('')
    }
  }

  const handleRetry = () => {
    if (areaSelecionada) {
      fetchEquipes(areaSelecionada.id, areaSelecionada.nome)
      fetchColaboradoresDaArea(areaSelecionada.id)
      if(areaSelecionada.coordenadorId) {
          fetchDetalhesPessoa(areaSelecionada.coordenadorId)
      }
    } else {
      fetchAreas()
    }
  }

  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  // --- FILTROS ---
  const filteredAreas = areas.filter(area => 
    (area.nome || area.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEquipes = equipes.filter(equipe => 
    (equipe.nome || equipe.titulo || '').toLowerCase().includes(searchTermEquipes.toLowerCase())
  )

  // Filtra colaboradores para NÃO mostrar o coordenador duplicado na lista de baixo (opcional, mas recomendado)
  const filteredColaboradoresList = colaboradoresArea.filter(c => 
     c.id !== areaSelecionada?.coordenadorId
  )

  return (
    <>
      <div style={{ backgroundColor: '#009FC3', minHeight: '100vh' }}>
        <Header />
        
        <div className="group-page">
          <div className="group-header">
            
            <div className="search-row">
              {/* SETA VOLTAR */}
              {areaSelecionada || equipeSelecionada || visualizandoPessoa ? (
                <img 
                  src={arrowLeft} 
                  alt="voltar" 
                  onClick={handleBack}
                  style={{ cursor: 'pointer', marginRight: '10px' }}
                />
              ) : (
                <div style={{ width: '24px', marginRight: '10px' }}></div> 
              )}

              {/* TÍTULO OU SEARCH */}
              {visualizandoPessoa ? (
                 <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                   Dados Pessoais
                 </div>
              ) : !equipeSelecionada ? (
                <div className="search">
                  <img src={searchIcon} className="search-img" alt="search" />
                  <input 
                    placeholder={areaSelecionada ? `Buscar em ${areaSelecionada.nome}` : "Pesquisar Área"}
                    value={areaSelecionada ? searchTermEquipes : searchTerm}
                    onChange={(e) => areaSelecionada 
                      ? setSearchTermEquipes(e.target.value) 
                      : setSearchTerm(e.target.value)
                    }
                  />
                </div>
              ) : (
                <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Detalhes da Equipe
                </div>
              )}

              {/* SETA ATUALIZAR */}
              {!equipeSelecionada && !visualizandoPessoa && (
                <img 
                  src={arrowRight} 
                  alt="atualizar" 
                  onClick={() => areaSelecionada 
                    ? handleRetry()
                    : fetchAreas()
                  }
                  style={{ cursor: 'pointer', marginLeft: '10px' }} 
                />
              )}
            </div>

            {/* HEADER DA PÁGINA */}
            <h1 style={{ marginTop: '20px' }}>
              {visualizandoPessoa 
                ? (pessoaSelecionada?.id === areaSelecionada?.coordenadorId ? "Coordenação" : "Colaborador")
                : equipeSelecionada 
                  ? equipeSelecionada.nome 
                  : areaSelecionada 
                    ? areaSelecionada.nome 
                    : "Áreas"}
            </h1>
            <div className="rowOrange"></div>
          </div>
          
          <div className="list-wrap">
            {error && (
              <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
                <p>{error}</p>
                <button onClick={handleRetry} style={{cursor:'pointer', padding:'5px 10px'}}>Tentar novamente</button>
              </div>
            )}

            {!error && (
              <div className="list">
                
                {/* 1. TELA DETALHES PESSOA (Genérico para Coordenador e Colaborador) */}
                {visualizandoPessoa && pessoaSelecionada ? (
                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                      
                      <h2 style={{ marginBottom: '5px' }}>{pessoaSelecionada.nome}</h2>
                      <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '25px', fontStyle: 'italic' }}>
                        {pessoaSelecionada.cargo?.nome || "Cargo não informado"}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Email */}
                        {pessoaSelecionada.email && (
                            <div>
                                <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#eee'}}>Email</label>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px'}}>
                                    <span style={{fontSize: '1rem'}}>{pessoaSelecionada.email}</span>
                                    <button onClick={() => handleCopy(pessoaSelecionada.email)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', padding: '4px 10px'}}>Copiar</button>
                                </div>
                            </div>
                        )}
                        {/* Telefone */}
                        {pessoaSelecionada.telefone && (
                             <div>
                                <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#eee'}}>Telefone</label>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px'}}>
                                    <span style={{fontSize: '1rem'}}>{pessoaSelecionada.telefone}</span>
                                    <button onClick={() => handleCopy(pessoaSelecionada.telefone)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', padding: '4px 10px'}}>Copiar</button>
                                </div>
                            </div>
                        )}
                        {/* Empresa */}
                        {pessoaSelecionada.empresa && (
                             <div>
                                <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#eee'}}>Empresa</label>
                                <div style={{borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px'}}>
                                    <span style={{fontSize: '1rem'}}>{pessoaSelecionada.empresa}</span>
                                </div>
                            </div>
                        )}
                        {/* Endereço */}
                        {pessoaSelecionada.endereco && (
                             <div>
                                <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#eee'}}>Endereço</label>
                                <div style={{borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px'}}>
                                    <span style={{fontSize: '1rem'}}>{pessoaSelecionada.endereco}</span>
                                </div>
                            </div>
                        )}
                         {/* Aniversário */}
                         {pessoaSelecionada.aniversario && (
                             <div>
                                <label style={{fontWeight: 'bold', display: 'block', fontSize: '0.8rem', color: '#eee'}}>Aniversário</label>
                                <div style={{borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px'}}>
                                    <span style={{fontSize: '1rem'}}>Dia {pessoaSelecionada.aniversario}</span>
                                </div>
                            </div>
                        )}
                      </div>
                    </div>

                // 2. TELA DETALHES EQUIPE
                ) : equipeSelecionada ? (
                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                      <h3 style={{marginBottom: '10px'}}>Descrição da Equipe:</h3>
                      <p style={{marginBottom: '20px', lineHeight: '1.5'}}>
                        {equipeSelecionada.descricao || "Sem descrição disponível."}
                      </p>
                      <button 
                        onClick={() => handleCopy(equipeSelecionada.descricao)}
                        style={{ backgroundColor: '#F37021', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                      >
                        Copiar Informações
                      </button>
                    </div>

                // 3. LISTA DENTRO DA ÁREA
                ) : areaSelecionada ? (
                  <>
                    {/* --- A: COORDENAÇÃO --- */}
                    {loadingPessoa ? (
                        <div style={{color: 'white', fontStyle: 'italic', padding: '10px'}}>Carregando coordenação...</div>
                    ) : (
                        <div 
                          className="group-item" 
                          // Se tiver dados completos (pessoaSelecionada) e for o coordenador, usa; senão usa fallback
                          onClick={handleCoordenadorClick}
                          style={{ 
                              cursor: 'pointer', 
                              borderLeft: '5px solid #F37021', 
                              marginBottom: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.25)' 
                          }}
                        >
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.9 }}>Coordenação</span>
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                { (pessoaSelecionada && pessoaSelecionada.id === areaSelecionada.coordenadorId) ? pessoaSelecionada.nome : (areaSelecionada.nomeCoordenador || "Não definida") }
                              </span>
                          </div>
                        </div>
                    )}

                    {/* --- B: EMPRESAS --- */}
                    {areaSelecionada.empresas && areaSelecionada.empresas.length > 0 && (
                        <div style={{ marginBottom: '20px', paddingLeft: '5px' }}>
                           <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
                             Empresas vinculadas:
                           </label>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {areaSelecionada.empresas.map((empresa) => (
                                  <div key={empresa.id} style={{
                                      backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      color: '#fff',
                                      fontSize: '0.9rem',
                                      borderLeft: '3px solid rgba(255,255,255,0.5)'
                                  }}>
                                    {empresa.nome}
                                  </div>
                              ))}
                           </div>
                        </div>
                    )}

                    {/* --- C: COLABORADORES (NOVO) --- */}
                    <div style={{borderTop: '1px solid rgba(255,255,255,0.3)', margin: '15px 0', width: '100%'}}></div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>
                        Colaboradores:
                    </label>

                    {loadingColaboradores && <div style={{color: 'white', fontStyle: 'italic'}}>Carregando colaboradores...</div>}
                    
                    {!loadingColaboradores && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {filteredColaboradoresList.length === 0 ? (
                                <div style={{color: 'rgba(255,255,255,0.6)', fontStyle: 'italic'}}>Nenhum colaborador encontrado.</div>
                            ) : (
                                filteredColaboradoresList.map(colab => (
                                    <div 
                                      key={colab.id}
                                      onClick={() => handleColaboradorClick(colab)}
                                      className="group-item"
                                      style={{ 
                                          cursor: 'pointer',
                                          padding: '12px 15px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center'
                                      }}
                                    >
                                        <span>{colab.nome}</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Ver dados</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}


                    {/* --- D: EQUIPES --- */}
                    <div style={{borderTop: '1px solid rgba(255,255,255,0.3)', margin: '10px 0', width: '100%'}}></div>
                    <h3 style={{color: '#fff', fontSize: '1rem', marginBottom: '10px'}}>Equipes:</h3>

                    {loadingEquipes && <p style={{color:'white', textAlign:'center'}}>Carregando equipes...</p>}
                    
                    {!loadingEquipes && equipes.length === 0 ? (
                      <p style={{color:'white', textAlign:'center'}}>Nenhuma equipe cadastrada.</p>
                    ) : (
                      equipes.map((equipe, i) => (
                        <div 
                          className="group-item" 
                          key={equipe.id || i}
                          onClick={() => handleEquipeClick(equipe)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span>{equipe.nome || equipe.titulo || "Equipe sem nome"}</span>
                        </div>
                      ))
                    )}
                  </>

                // 4. LISTA DE ÁREAS (HOME)
                ) : (
                  <>
                    {loadingAreas && <p style={{color:'white', textAlign:'center'}}>Carregando áreas...</p>}
                    {!loadingAreas && filteredAreas.map((area, i) => (
                        <div 
                          className="group-item" 
                          key={area.id || i}
                          onClick={() => handleAreaClick(area)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span>{area.nome || area.name}</span>
                        </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="bottom-logo">
            <img src={energisaIcon} alt="energisa" />
          </div>

          {showToast && (
            <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#28a745', color: 'white', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: '600', animation: 'fadeIn 0.3s' }}>
              ✓ Copiado com sucesso!
            </div>
          )}
        </div>
      </div>
    </>
  )
}