# Arquitetura do Projeto To-Do App

## Visão Geral

Este documento descreve a arquitetura e as decisões de design do aplicativo To-Do App, construído com Ionic 7+ e Angular 16+.

## Padrão de Arquitetura

O projeto segue uma arquitetura modular baseada em componentes standalone do Angular, organizada em camadas bem definidas:

### 1. **Camada de Apresentação (UI Layer)**

Responsável pela interface do usuário e interação.

- **Pages**: Páginas completas do aplicativo
  - `auth/` - Login e Registro
  - `tasks/` - Listagem e gerenciamento de tarefas
  - `projects/` - Gerenciamento de projetos
  - `settings/` - Configurações do usuário

- **Shared Components**: Componentes reutilizáveis
  - `task-item` - Exibição de tarefa individual
  - `loading-spinner` - Indicador de carregamento
  - `empty-state` - Estado vazio

### 2. **Camada de Serviços (Service Layer)**

Gerencia a lógica de negócios e comunicação com APIs.

- **ApiService**: Serviço genérico para requisições HTTP
- **AuthService**: Gerenciamento de autenticação e sessão
- **TaskService**: Operações CRUD de tarefas
- **UserService**: Gerenciamento de perfil do usuário

### 3. **Camada de Modelos (Model Layer)**

Define interfaces TypeScript para type safety.

- **ITask**: Modelo de tarefa
- **IProject**: Modelo de projeto
- **IUser**: Modelo de usuário
- **IAuth**: Modelos de autenticação (Login, Register, etc.)
- **ICategory**: Modelo de categoria

### 4. **Camada de Roteamento (Routing Layer)**

Gerencia navegação e proteção de rotas.

- **app.routes.ts**: Configuração principal de rotas
- **Guards**: Proteção de rotas
  - `authGuard` - Requer autenticação
  - `noAuthGuard` - Impede acesso se autenticado

### 5. **Camada de Interceptores (Interceptor Layer)**

Intercepta requisições HTTP para adicionar funcionalidades.

- **authInterceptor**: Adiciona token JWT às requisições
- **errorInterceptor**: Tratamento global de erros

## Fluxo de Dados

### Autenticação

```
LoginPage → AuthService → ApiService → Backend
                ↓
        localStorage (token)
                ↓
        BehaviorSubject (state)
                ↓
        Outros componentes
```

### Operações CRUD

```
Component → Service → ApiService → Backend
                ↓
        BehaviorSubject (state)
                ↓
        Component (auto-update via Observable)
```

## Gerenciamento de Estado

O projeto utiliza **RxJS BehaviorSubject** para gerenciamento de estado reativo:

### AuthService State
- `currentUser$: Observable<IUser | null>`
- `isAuthenticated$: Observable<boolean>`

### TaskService State
- `tasks$: Observable<ITask[]>`

### Vantagens
- Reativo e em tempo real
- Fácil de implementar
- Sem dependências externas
- Adequado para apps de médio porte

### Alternativas para Escala
Para aplicações maiores, considere:
- **NgRx** - Redux pattern
- **Akita** - State management mais simples
- **NgRx Component Store** - Estado local de componentes

## Padrões de Design Utilizados

### 1. **Singleton Pattern**
Serviços são fornecidos na raiz (`providedIn: 'root'`), garantindo instância única.

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService { }
```

### 2. **Observer Pattern**
Uso extensivo de Observables para comunicação reativa.

```typescript
public tasks$ = this.tasksSubject.asObservable();
```

### 3. **Interceptor Pattern**
HTTP interceptors para funcionalidades cross-cutting.

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Adiciona token a todas as requisições
};
```

### 4. **Guard Pattern**
Guards para proteção de rotas.

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Verifica autenticação
};
```

### 5. **Repository Pattern**
Serviços abstraem a fonte de dados (API, localStorage, etc.).

## Segurança

### Autenticação JWT
- Tokens armazenados no localStorage
- Refresh token para renovação automática
- Interceptor adiciona token automaticamente
- Logout limpa todo estado

### Proteção de Rotas
- Guards impedem acesso não autorizado
- Redirect automático para login
- Preserve return URL para navegação pós-login

### Validação de Formulários
- Validadores built-in do Angular
- Validadores customizados (password strength, match)
- Feedback visual de erros

## Performance

### Lazy Loading
Todas as páginas são carregadas sob demanda:

```typescript
loadComponent: () => import('./pages/tasks/tasks.page')
  .then(m => m.TasksPage)
```

### Preloading Strategy
PreloadAllModules para melhor experiência:

```typescript
provideRouter(routes, withPreloading(PreloadAllModules))
```

### Change Detection
Componentes standalone com OnPush strategy quando possível.

## PWA Features

### Service Worker
- Cache de assets estáticos
- Offline functionality
- Background sync

### Manifest
- Ícones para diferentes plataformas
- Tema e cores
- Instalação no dispositivo

## Responsividade

### Mobile First
- Design otimizado para mobile
- Componentes Ionic nativos
- Gestures e interações touch

### Adaptação Desktop
- Layouts responsivos com CSS Grid/Flexbox
- Breakpoints para diferentes tamanhos
- Componentes adaptativos (tabs vs sidebar)

## Testabilidade

### Unit Tests
- Services testados com HttpClientTestingModule
- Mocks para dependências
- Jasmine/Karma

### Estrutura de Testes
```typescript
describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
  });

  it('should login successfully', async () => {
    // Test implementation
  });
});
```

## Internacionalização (Futuro)

### Estrutura Sugerida
```
src/
  assets/
    i18n/
      pt-BR.json
      en-US.json
      es-ES.json
```

### Biblioteca
- **ngx-translate** para i18n
- Detectar idioma do sistema
- Preferência do usuário

## Extensibilidade

### Adicionar Nova Feature

1. **Criar modelo** em `models/`
2. **Criar serviço** em `services/`
3. **Criar página** em `pages/`
4. **Adicionar rota** em rotas
5. **Adicionar testes**

### Exemplo: Adicionar Notificações

```typescript
// 1. Model
export interface INotification {
  id: string;
  message: string;
  read: boolean;
}

// 2. Service
@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Implementation
}

// 3. Page
@Component({
  selector: 'app-notifications',
  standalone: true
})
export class NotificationsPage { }

// 4. Route
{
  path: 'notifications',
  loadComponent: () => import('./pages/notifications/notifications.page')
}
```

## Boas Práticas Implementadas

✅ **TypeScript Strict Mode**
✅ **Componentes Standalone**
✅ **Reactive Forms**
✅ **RxJS para gerenciamento de estado**
✅ **HTTP Interceptors**
✅ **Route Guards**
✅ **Environment Variables**
✅ **SCSS com variáveis CSS**
✅ **Lazy Loading**
✅ **Error Handling**
✅ **Type Safety**
✅ **Clean Code**

## Melhorias Futuras

- [ ] Implementar NgRx para state management
- [ ] Adicionar testes E2E com Cypress
- [ ] Implementar cache strategies
- [ ] Adicionar logs estruturados
- [ ] Implementar analytics
- [ ] Adicionar feature flags
- [ ] Implementar error boundary
- [ ] Adicionar performance monitoring

## Conclusão

Esta arquitetura foi projetada para ser:
- **Escalável**: Fácil adicionar novas features
- **Manutenível**: Código organizado e limpo
- **Testável**: Separação clara de responsabilidades
- **Performática**: Lazy loading e otimizações
- **Segura**: Autenticação e proteção de rotas

Para dúvidas sobre a arquitetura, consulte a documentação do Angular e Ionic ou abra uma issue no repositório.
