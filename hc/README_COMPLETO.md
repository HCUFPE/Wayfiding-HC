#  Sistema de Navegação Indoor - Hospital

Este é o sistema completo de navegação indoor para hospitais, com:
-  Tela de usuário (busca por lista ou prontuário)
-  Tela de administrador (editor de grafos)
-  Integração com backend
-  TypeScript + Tailwind CSS
-  Algoritmo Dijkstra para rotas otimizadas

---

## 📦 O Que Foi Criado

### **Arquivos Totais: 25+**

#### **1. Types (1 arquivo)**
- `src/types/navigation.ts` - Todas as tipagens TypeScript

#### **2. Services (4 arquivos)**
- `src/services/geometryUtils.ts` - Cálculos geométricos
- `src/services/graphService.ts` - Dijkstra + MinHeap
- `src/services/geoJsonService.ts` - Manipulação de GeoJSON
- `src/services/apiService.ts` - Integração com API

#### **3. Hooks (2 arquivos)**
- `src/hooks/useNavigation.ts` - Hook de navegação
- `src/hooks/useGraphEditor.ts` - Hook do editor

#### **4. Componentes de Mapa (5 arquivos)**
- `src/components/map/LeafletMap.tsx` - Mapa base
- `src/components/map/MapNodes.tsx` - Renderiza nós
- `src/components/map/MapEdges.tsx` - Renderiza arestas
- `src/components/map/MapRoute.tsx` - Renderiza rota
- `src/components/map/MapClickHandler.tsx` - Handler de cliques

#### **5. Componentes de Navegação (3 arquivos)**
- `src/components/navigation/PathInstructions.tsx` - Instruções passo-a-passo
- `src/components/navigation/SearchByList.tsx` - Busca por lista
- `src/components/navigation/SearchByProntuario.tsx` - Busca por prontuário

#### **6. Componentes do Editor (2 arquivos)**
- `src/components/editor/ControlPanel.tsx` - Painel de controles
- `src/components/editor/MapSelector.tsx` - Seletor de mapas

#### **7. Páginas (2 arquivos)**
- `src/pages/NavigationPage.tsx` - Página do usuário
- `src/pages/EditorPage.tsx` - Página do admin

#### **8. App Principal**
- `src/App.tsx` - Roteamento e splash screen

---

##  Como Instalar e Usar

### **Passo 1: Extrair o Projeto**
```bash
# Extrair o arquivo compactado
tar -xzf projeto-migrado-fase1.tar.gz
cd novo-projeto
```

### **Passo 2: Instalar Dependências**
```bash
npm install
```

### **Passo 3: Configurar Variáveis de Ambiente**
```bash
# criar um .env
# Editar .env com suas configurações
# VITE_API_URL=http://localhost:8000
```

### **Passo 4: Adicionar Arquivos Estáticos**

Coloque estes arquivos na pasta `public/`:
-  `logo-hc.png` - Logo do hospital (já existe)
-  `apenas-logo.png` - Logo simples (já existe)
-  `click.png` - Ícone de toque (já existe)
-  `e os mapas de cada andar exemplo mapa_andar1, mapa_andar2 ...`


### **Passo 5: Rodar o Projeto**
```bash
# Modo desenvolvimento
npm run dev

# O projeto abrirá em http://localhost:5173
```

---

## 🎯 Como Usar

### **Para Usuários (Navegação)**

1. **Splash Screen** 
   - Toque/clique na tela para começar

2. **Menu Principal**
   - "Tenho meu número" → Busca por prontuário
   - "Quero encontrar" → Busca por lista ou prontuário

3. **Busca**
   - **Por Lista**: Digite para filtrar, clique no destino
   - **Por Prontuário**: Digite número, clique em "Consultar"

4. **Navegação**
   - Veja o caminho no mapa (linha vermelha)
   - Siga as instruções passo-a-passo
   - Timer de 30s para resetar automaticamente

---

### **Para Administradores (Editor)**

#### **Acessar o Editor**
1. acesse a rota referente do editor "/editor na url"

#### **Usando o Editor**

**1. Carregar Mapa**
- Clique em "Upload GeoJSON" ou "Carregar Mapa Padrão"
- O mapa aparecerá na tela

**2. Modos de Edição**

| Modo | O Que Faz | Como Usar |
|------|-----------|-----------|
| **Adicionar Nó** | Cria pontos no grafo | Clique no mapa |
| **Adicionar Aresta** | Conecta 2 nós | Clique em 2 nós |
| **Nomear Nó** | Dá nome ao local | Clique no nó, digite nome |
| **Dar Instrução** | Adiciona instrução personalizada | Clique no nó, digite instrução |
| **Apagar** | Remove nó ou aresta | Clique no que quer apagar |
| **Visualizar/Testar** | Testa rotas | Clique em 2 nós para ver caminho |

**3. Salvar**
- Após editar, clique em "Salvar"
- Um arquivo `mapa_completo.geojson` será baixado
- Coloque este arquivo em `public/mapa_completo.geojson`

**4. Dicas**
-  Nós verdes = nomeados (aparecem na busca)
-  Nós laranjas = sem nome (só conectam caminhos)
-  Sempre teste rotas antes de salvar!
-  Crie um nó chamado "Você está aqui" como ponto de partida
-  Escadas e elevadores vão servir como nós especial trocando de lugar então lembre-se de colocar sempre eles em cada andar.

---

**Observação final** 
– Novos mapas e considerações de implementação
Na pasta novos_mapas estão incluídos os arquivos de mapa alterados conforme as solicitações feitas ao longo do desenvolvimento do projeto. Os principais ajustes realizados foram:

Redução significativa do tamanho do mapa original
O mapa inicial era excessivamente grande em relação à área efetivamente utilizada nos testes. Para melhorar a performance e a usabilidade, foi feita uma "corte" estratégica da planta, eliminando regiões e elementos que não impactavam diretamente a navegação.
Remoção de elementos não essenciais
Portas, detalhes arquitetônicos e outros itens que não eram necessários para o fluxo de navegação foram removidos, deixando a planta mais leve e focada no propósito principal da aplicação.

**Importante:**
Os mapas contidos na pasta são exemplos funcionais criados especificamente para demonstrar o funcionamento completo da aplicação (editor de mapa, cálculo de rotas, instruções personalizadas, busca por prontuário, etc.). Eles servem como prova de conceito e template completo.
A implementação real com a planta oficial do hospital (ou com a área completa desejada) fica a cargo da equipe responsável pela adoção do sistema. Basta seguir o mesmo padrão já utilizado nos arquivos de exemplo:

Manter a estrutura do GeoJSON (nav_node, nav_edge, nav_area, etc.)
Preencher corretamente os campos name e instruction nos nós quando necessário
Atualizar o caminho do arquivo carregado no código (/mapa_completo.geojson)

Todo o sistema foi projetado para ser flexível e aceitar novos mapas sem necessidade de alterar a lógica principal.
Caso haja necessidade de suporte para adaptação da planta real ou ajustes pontuais, fico à disposição para orientações adicionais.




##  Estrutura de Arquivos principais

novo-projeto/
├── public/
│   ├── logo-hc.png               Logo do hospital
│   ├── apenas-logo.png           Logo simples
│   ├── click.png                 Ícone de toque
│   └── mapa_completo.geojson     Gerado pelo editor
├── src/
│   ├── types/                    Tipagens TypeScript
│   ├── services/                 Lógica de negócio
│   ├── hooks/                    Hooks React
│   ├── components/               Componentes UI
│   │   ├── map/                  Componentes de mapa
│   │   ├── navigation/           Componentes de navegação
│   │   └── editor/               Componentes do editor
│   ├── pages/                    Páginas principais
│   ├── App.tsx                   App principal
│   └── main.tsx                  Entry point
├── package.json                  Dependências
├── tailwind.config.js            Config Tailwind
├── tsconfig.json                 Config TypeScript
└── vite.config.ts                Config Vite
```
---

## 📝 API do Backend

### **Endpoint Necessário**

```
GET /api/pacientes/{numero}

Response:
{
  "Numero": 12345,
  "Nome": "João Silva",
  "Local/Consultório": "pediatria"
}
```

**Campo crítico:** `Local/Consultório` deve corresponder a um nome no mapa

---

## 🎨 Customização

### **Cores do Hospital**

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      hospital: {
        primary: '#0066cc',   
        secondary: '#00aa44', 
        accent: '#ff6600'     
      }
    }
  }
}
```

### **Logo e Imagens**

Substitua os arquivos em `public/`:
- `logo-hc.png` - Logo principal
- `apenas-logo.png` - Logo do splash

---

## 🚀 Deploy para Produção

### **Build**
```bash
npm run build
```

### **Preview do Build**
```bash
npm run preview
```









