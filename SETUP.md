# Setup do Projeto InspectorLS

## Requisitos

- Node.js 18+ 
- pnpm (gerenciador de pacotes recomendado)
- Conta Supabase (gratuita em https://supabase.com)

## Instalação Inicial

### 1. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd project-ita-pae
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e adicione suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
# Em seu dashboard Supabase, copie:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
SUPABASE_JWT_SECRET=seu-jwt-secret
```

### 4. Obter Credenciais do Supabase

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Project Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
project-ita-pae/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── inspections/      # GET - lista inspeções
│   │   └── save-inspection/  # POST - salva inspeção
│   ├── scanner/              # Página do scanner
│   ├── history/              # Página de histórico
│   └── layout.tsx            # Layout raiz
├── components/               # Componentes React
│   ├── ui/                   # Componentes shadcn/ui
│   ├── scanner/              # Componentes do scanner
│   └── providers.tsx         # Providers (QueryClient, Sonner)
├── lib/                      # Bibliotecas e utilitários
│   ├── supabase/            # Cliente Supabase
│   ├── inspections/         # Lógica de inspeções
│   ├── ocr/                 # OCR e processamento de imagem
│   └── hooks/               # Custom hooks
├── data/                     # Dados estáticos
│   ├── CodigoJuliano.ts     # Tabelas de código juliano
│   └── ShelfLifeWeekly.ts   # Dados de shelf life
└── public/                   # Assets estáticos
```

## Funcionalidades Principais

### 1. Scanner Industrial
- Captura contínua de câmera
- OCR em tempo real (Tesseract.js)
- Validação de data de validade
- Validação de código juliano
- Análise de qualidade de impressão

### 2. Histórico de Inspeções
- Lista todas as inspeções salvas
- Filtros por data, status
- Detalhes de cada inspeção
- Exportação de dados

### 3. API Backend
- Gerenciamento de dados no Supabase
- Persistência de inspeções
- Autenticação e segurança RLS

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor em modo desenvolvimento

# Build
pnpm build        # Compila para produção
pnpm start        # Inicia servidor de produção

# Linting
pnpm lint         # Verifica erros de lint

# Formatação
pnpm format       # Formata código com Prettier
```

## Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solução:** Certifique-se de que as variáveis de ambiente estão definidas em `.env.local`

### Erro: "Supabase connection refused"
**Solução:** Verifique se a URL do Supabase está correta e se o projeto está ativo

### Scanner não aparece
**Solução:** Permita acesso à câmera no seu navegador

### OCR lento
**Solução:** Primeira vez carrega o modelo Tesseract (~60MB). Subsequentes são mais rápidas.

## Deploy no Vercel

### 1. Configurar Repositório Git

```bash
git remote add origin <seu-repositorio>
git push -u origin main
```

### 2. Conectar ao Vercel

1. Acesse https://vercel.com
2. Clique em **New Project**
3. Selecione seu repositório GitHub
4. Vercel detectará automáticamente que é um projeto Next.js

### 3. Configurar Variáveis de Ambiente

No dashboard do Vercel:
- Vá para **Project Settings** → **Environment Variables**
- Adicione todas as variáveis do seu `.env.local`
- **NÃO** inclua variáveis locais como `VERCEL_OIDC_TOKEN`

### 4. Deploy

Clique em **Deploy** e aguarde a conclusão.

## Performance

- **LCP (Largest Contentful Paint):** < 2.5s
- **INP (Interaction to Next Paint):** < 200ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Responsivo:** 100% em todos os dispositivos

## Suporte

Para dúvidas ou issues:
1. Verifique a documentação em `MIGRATION_SUMMARY.md`
2. Consulte logs em `Console > Network` no navegador
3. Verifique variáveis de ambiente
4. Teste em navegadores modernos (Chrome, Firefox, Safari, Edge)
