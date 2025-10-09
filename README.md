# To-Do App - Aplicativo de Gerenciamento de Tarefas

Um aplicativo móvel e web moderno para gerenciamento de tarefas pessoais e colaborativas, construído com **Ionic 7+** e **Angular 16+**.

## 🚀 Características

- ✅ Gerenciamento de tarefas com diferentes status e prioridades
- 📁 Organização por projetos
- 👥 Colaboração em equipe
- 🏷️ Sistema de tags e categorias
- 🔐 Autenticação JWT com refresh tokens
- 🎨 Tema claro e escuro (automático)
- 📱 Progressive Web App (PWA)
- 🔄 Sincronização em tempo real
- 📊 Visualização de progresso de projetos

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Opcional (para desenvolvimento mobile)

- [Capacitor](https://capacitorjs.com/)
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS - somente macOS)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd MeuApp
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Edite o arquivo `src/environments/environment.ts` e configure a URL da sua API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Altere para a URL da sua API
  appVersion: '1.0.0',
  appName: 'To-Do App'
};
```

Para produção, edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api', // URL da API em produção
  appVersion: '1.0.0',
  appName: 'To-Do App'
};
```

## 🚀 Executando o Projeto

### Desenvolvimento Web

```bash
# Inicia o servidor de desenvolvimento
npm start
# ou
ionic serve
```

O aplicativo estará disponível em `http://localhost:8100`

### Build para Produção

```bash
# Build de produção
npm run build
# ou
ionic build --prod
```

Os arquivos compilados estarão na pasta `www/`

### Desenvolvimento Mobile

#### Android

```bash
# Adiciona a plataforma Android
ionic capacitor add android

# Sincroniza o código
ionic capacitor sync android

# Abre o Android Studio
ionic capacitor open android
```

#### iOS (somente macOS)

```bash
# Adiciona a plataforma iOS
ionic capacitor add ios

# Sincroniza o código
ionic capacitor sync ios

# Abre o Xcode
ionic capacitor open ios
```

## 📁 Estrutura do Projeto

```
MeuApp/
├── src/
│   ├── app/
│   │   ├── guards/              # Guards de roteamento (auth)
│   │   ├── interceptors/        # HTTP Interceptors
│   │   ├── models/              # Interfaces TypeScript
│   │   ├── pages/               # Páginas do aplicativo
│   │   │   ├── auth/            # Login e Registro
│   │   │   ├── tasks/           # Gerenciamento de tarefas
│   │   │   ├── projects/        # Gerenciamento de projetos
│   │   │   └── settings/        # Configurações
│   │   ├── services/            # Serviços (API, Auth, etc)
│   │   ├── shared/              # Componentes compartilhados
│   │   │   └── components/      # Componentes reutilizáveis
│   │   ├── tabs/                # Layout principal com tabs
│   │   ├── app.component.ts     # Componente raiz
│   │   └── app.routes.ts        # Configuração de rotas
│   ├── assets/                  # Recursos estáticos
│   ├── environments/            # Configurações de ambiente
│   ├── theme/                   # Temas e estilos globais
│   ├── global.scss              # Estilos globais
│   └── index.html               # HTML principal
├── capacitor.config.ts          # Configuração do Capacitor
├── ionic.config.json            # Configuração do Ionic
├── angular.json                 # Configuração do Angular
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

## 🔑 Principais Tecnologias

- **Framework**: Angular 20+
- **UI Framework**: Ionic 8+
- **State Management**: RxJS (BehaviorSubject)
- **HTTP Client**: Angular HttpClient
- **Autenticação**: JWT (JSON Web Tokens)
- **Styling**: SCSS/CSS Variables
- **Routing**: Angular Router
- **Forms**: Reactive Forms

## 📦 Modelos de Dados

### ITask (Tarefa)
```typescript
{
  id: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus; // TODO, IN_PROGRESS, COMPLETED, CANCELLED
  prioridade: TaskPriority; // LOW, MEDIUM, HIGH, URGENT
  dataVencimento?: Date;
  userId: string;
  tags: string[];
  isPublic: boolean;
  assignedTo: string[];
}
```

### IProject (Projeto)
```typescript
{
  id: string;
  nome: string;
  descricao?: string;
  status: ProjectStatus; // ACTIVE, COMPLETED, ARCHIVED, ON_HOLD
  ownerId: string;
  tasks: ITask[];
  members: IProjectMember[];
  isPublic: boolean;
}
```

### IUser (Usuário)
```typescript
{
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[]; // ADMIN, USER, GUEST
}
```

## 🔐 Autenticação

O aplicativo utiliza autenticação baseada em JWT com refresh tokens:

1. **Login**: Endpoint POST `/auth/login`
2. **Registro**: Endpoint POST `/auth/register`
3. **Refresh Token**: Endpoint POST `/auth/refresh`
4. **Logout**: Endpoint POST `/auth/logout`

Os tokens são armazenados no localStorage e automaticamente incluídos nas requisições através de um interceptor HTTP.

## 🛡️ Guards de Rota

- **authGuard**: Protege rotas que requerem autenticação
- **noAuthGuard**: Impede usuários autenticados de acessar páginas de login/registro

## 🎨 Temas

O aplicativo suporta tema claro e escuro:

- **Automático**: Detecta a preferência do sistema
- **Manual**: Pode ser configurado nas preferências do usuário

Personalize as cores em `src/theme/variables.scss`

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Lint
npm run lint
```

## 📱 PWA (Progressive Web App)

O aplicativo está configurado para funcionar como PWA com:

- Service Worker
- Manifest
- Ícones para diferentes plataformas
- Instalação no dispositivo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@todoapp.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/MeuApp/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/seu-usuario/MeuApp/wiki)

## 🗺️ Roadmap

- [ ] Notificações push
- [ ] Sincronização offline
- [ ] Integração com calendário
- [ ] Exportação de dados (PDF, Excel)
- [ ] Integração com Google Tasks / Microsoft To Do
- [ ] Aplicativo desktop (Electron)
- [ ] Modo Kanban
- [ ] Relatórios e análises
- [ ] Internacionalização (i18n)

## 👥 Autores

- **Nome do Desenvolvedor** - *Trabalho Inicial*

## 🙏 Agradecimentos

- Ionic Framework Team
- Angular Team
- Comunidade Open Source

---

**Nota**: Este é um projeto de demonstração. Configure adequadamente a API backend antes de usar em produção.
