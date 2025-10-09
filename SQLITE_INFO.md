# SQLite no Projeto MeuApp

## 📦 Plugin Instalado
- **@capacitor-community/sqlite** v7.0.1
- **jeep-sqlite** - Suporte web (IndexedDB)

## 📂 Estrutura de Arquivos

### Serviços SQLite
```
src/app/services/
├── database.service.ts          # Gerenciador principal do banco
├── sqlite-auth.service.ts       # Autenticação com SQLite
└── sqlite-task.service.ts       # CRUD de tarefas
```

### Serviços Integrados
```
src/app/services/
├── auth.service.ts              # Usa SQLiteAuthService
└── task.service.ts              # Usa SQLiteTaskService
```

## 💾 Localização do Banco de Dados

### Desenvolvimento (Web/Browser)
- **Tipo:** IndexedDB (via jeep-sqlite)
- **Localização:** Browser DevTools → Application → IndexedDB → `jeepSqliteStore`
- **Nome do DB:** `meuapp_db`

### Android
- **Localização:** `/data/data/io.ionic.starter/databases/meuapp_db`
- **Tipo:** SQLite nativo

### iOS
- **Localização:** `Library/LocalDatabase/meuapp_db`
- **Tipo:** SQLite nativo

### Electron (Desktop)
- **Localização:** `userData/databases/meuapp_db`

## 🗄️ Tabelas Criadas

1. **users** - Dados dos usuários
2. **user_preferences** - Configurações do usuário
3. **categories** - Categorias de tarefas
4. **projects** - Projetos
5. **project_members** - Membros de cada projeto
6. **tasks** - Tarefas
7. **auth_tokens** - Tokens de autenticação

## 🔐 Segurança

- Senhas hashadas com **bcrypt** (salt rounds: 10)
- Tokens de autenticação armazenados no banco
- Sem encryption no banco (pode ser ativado se necessário)

## 🚀 Como Usar

### Visualizar no Navegador
1. Abra o projeto: `ionic serve`
2. Abra DevTools (F12)
3. Vá em **Application → IndexedDB → jeepSqliteStore**
4. Veja as tabelas e dados

### Testar no Android
```bash
ionic cap build android
ionic cap run android
```

### Inspecionar banco no Android
```bash
# Conectar via adb
adb shell
cd /data/data/io.ionic.starter/databases/
sqlite3 meuapp_db

# Comandos úteis
.tables              # Listar tabelas
.schema users        # Ver estrutura da tabela
SELECT * FROM users; # Ver dados
```

### Inspecionar banco no iOS
Use o **DB Browser for SQLite** ou acesse via Xcode

## 📊 Como Verificar se Está Funcionando

No console do navegador você verá:
```
Database initialized successfully on web
SQLite database initialized
```

## 🔧 Troubleshooting

Se o SQLite não funcionar no navegador:
1. Verifique se `jeep-sqlite` está instalado
2. Verifique o console por erros
3. Limpe o cache do navegador
4. Use fallback para localStorage (já configurado)

## 🔄 Migração de Dados

Para migrar dados do localStorage antigo para SQLite:
- Os dados antigos do mock backend ficam em `localStorage`
- Novos registros vão para SQLite
- Não há migração automática (pode ser implementada)
