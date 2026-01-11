# INSTRUÇÕES DE DESENVOLVIMENTO - CURSOR AI

Este documento contém instruções e princípios que devem ser seguidos durante o desenvolvimento do projeto Insta Post. Baseado em Clean Code, princípios de Martin Fowler e melhores práticas de desenvolvimento de software.

---

## 🎯 OBJETIVO

Garantir que todo código produzido seja:
- **Limpo e legível**
- **Manutenível e escalável**
- **Bem estruturado**
- **Testável**
- **Seguindo padrões estabelecidos**

---

## 📚 PRINCÍPIOS FUNDAMENTAIS

### SOLID

1. **S - Single Responsibility Principle (SRP)**
   - Cada classe/função deve ter uma única razão para mudar
   - Uma classe deve fazer apenas uma coisa e fazer bem
   - Se uma função faz mais de uma coisa, quebrar em funções menores

2. **O - Open/Closed Principle (OCP)**
   - Classes devem estar abertas para extensão, fechadas para modificação
   - Use interfaces e abstrações para permitir extensão sem modificar código existente

3. **L - Liskov Substitution Principle (LSP)**
   - Objetos de uma superclasse devem ser substituíveis por objetos de suas subclasses
   - Mantenha contratos consistentes

4. **I - Interface Segregation Principle (ISP)**
   - Muitas interfaces específicas são melhores que uma interface geral
   - Clientes não devem depender de métodos que não usam

5. **D - Dependency Inversion Principle (DIP)**
   - Dependa de abstrações, não de concretizações
   - Módulos de alto nível não devem depender de módulos de baixo nível

### Outros Princípios Essenciais

- **D.R.Y. (Don't Repeat Yourself)**: Elimine duplicação de código
- **K.I.S.S. (Keep It Simple, Stupid)**: A solução mais simples é geralmente a melhor
- **Y.A.G.N.I. (You Aren't Gonna Need It)**: Não implemente funcionalidades que não são necessárias agora
- **Separation of Concerns**: Separe responsabilidades claramente

---

## 🏗️ ARQUITETURA E ORGANIZAÇÃO

### Estrutura de Pastas (Feature-Based)

```
src/
├── features/
│   ├── auth/
│   │   ├── domain/          # Entidades, tipos, regras de negócio
│   │   ├── application/     # Casos de uso, serviços
│   │   ├── infrastructure/  # Implementações (repositórios, APIs externas)
│   │   └── presentation/    # Controllers, DTOs, validações
│   ├── posts/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── subscriptions/
│       └── ...
├── shared/
│   ├── types/               # Tipos compartilhados
│   ├── utils/               # Utilitários genéricos
│   ├── errors/              # Erros customizados
│   └── constants/           # Constantes
└── lib/                     # Bibliotecas/configurações externas
```

### Camadas (Clean Architecture)

1. **Domain Layer (Núcleo)**
   - Entidades de negócio
   - Regras de negócio puras
   - Interfaces de repositórios
   - **NÃO depende de nada externo**

2. **Application Layer (Casos de Uso)**
   - Orquestra a lógica de negócio
   - Define interfaces de serviços
   - Depende apenas do Domain

3. **Infrastructure Layer (Implementações)**
   - Implementações de repositórios
   - Integrações com APIs externas
   - Acesso a banco de dados
   - Depende de Application e Domain

4. **Presentation Layer (Interface)**
   - Controllers/Endpoints
   - DTOs
   - Validações de entrada
   - Depende de Application

---

## 📝 CONVENÇÕES DE CÓDIGO

### Nomenclatura

- **Classes**: PascalCase (`UserService`, `PostRepository`)
- **Funções/Métodos**: camelCase (`createPost`, `calculateCredits`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`)
- **Interfaces/Types**: PascalCase com prefixo `I` opcional (`IUserRepository`, `PostDTO`)
- **Arquivos**: kebab-case (`user-service.ts`, `post-repository.ts`)
- **Variáveis privadas**: camelCase com `_` prefix (`_privateMethod`, `_internalState`) - **evitar**, preferir TypeScript `private`

### Funções e Métodos

```typescript
// ✅ BOM: Função pequena, com nome descritivo, uma responsabilidade
async function calculatePostCredits(
  textModel: string,
  imageModel: string
): Promise<number> {
  const textCost = getTextModelCost(textModel);
  const imageCost = getImageModelCost(imageModel);
  return textCost + imageCost;
}

// ❌ RUIM: Função muito grande, faz múltiplas coisas
async function processPost(data: any) {
  // 100 linhas de código fazendo múltiplas coisas
}
```

**Regras:**
- Funções devem ser pequenas (idealmente < 20 linhas)
- Um nível de abstração por função
- Nomes descritivos que revelam intenção
- No máximo 3-4 parâmetros (preferir objetos para mais parâmetros)
- Sem efeitos colaterais inesperados
- Retornar valores específicos, não `any`

### Classes

```typescript
// ✅ BOM: Classe focada, responsabilidade única
class CreditService {
  constructor(
    private creditRepository: ICreditRepository,
    private planService: IPlanService
  ) {}

  async consumeCredits(userId: string, amount: number): Promise<void> {
    const user = await this.creditRepository.findByUserId(userId);
    if (!user || user.availableCredits < amount) {
      throw new InsufficientCreditsError();
    }
    await this.creditRepository.decrement(userId, amount);
  }
}

// ❌ RUIM: Classe fazendo muitas coisas
class UserService {
  // Gerencia usuários, créditos, posts, assinaturas...
}
```

**Regras:**
- Uma responsabilidade por classe
- Pequenas (quanto menor, melhor)
- Coesão alta (métodos relacionados)
- Acoplamento baixo (poucas dependências)
- Use injeção de dependência

### Tipos e Interfaces

```typescript
// ✅ BOM: Tipos específicos e explícitos
interface CreatePostRequest {
  idea: string;
  userId: string;
  accountId?: string;
}

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

type PostStatus = 'draft' | 'scheduled' | 'published';

// ❌ RUIM: Uso excessivo de any, tipos genéricos demais
function createPost(data: any): any {
  // ...
}
```

**Regras:**
- Evite `any` - use tipos específicos ou `unknown`
- Prefira interfaces para objetos
- Use types para unions, intersections, primitives
- Nominal types quando necessário
- Validação de tipos em runtime com Zod (na camada de apresentação)

---

## 🔄 REFACTORING (Martin Fowler)

### Code Smells Comuns - Identificar e Corrigir

1. **Long Method**
   - Quebrar em métodos menores
   - Extrair métodos com nomes descritivos

2. **Large Class**
   - Dividir responsabilidades
   - Extrair classes relacionadas

3. **Duplicated Code**
   - Extrair para função/comum
   - Criar utilitários compartilhados

4. **Long Parameter List**
   - Usar objetos de parâmetros
   - Criar Value Objects/DTOs

5. **Feature Envy**
   - Mover método para classe apropriada
   - Evitar acessar dados de outra classe excessivamente

6. **Data Clumps**
   - Agrupar dados relacionados em objetos
   - Criar Value Objects

7. **Primitive Obsession**
   - Substituir primitivos por Value Objects quando fizer sentido
   - Ex: `Email` type, `UserId` type

### Refactorings Frequentes

- **Extract Method**: Quebrar função grande
- **Extract Class**: Separar responsabilidades
- **Extract Variable**: Tornar expressões claras
- **Rename**: Melhorar nomes
- **Move Method/Field**: Reorganizar código
- **Replace Magic Number/String**: Usar constantes nomeadas
- **Introduce Parameter Object**: Agrupar parâmetros
- **Replace Conditional with Polymorphism**: Quando apropriado

---

## 🧪 TESTES

### Estratégia de Testes

1. **Unit Tests**
   - Testar funções/métodos isoladamente
   - Mocks para dependências
   - Foco em lógica de negócio

2. **Integration Tests**
   - Testar integrações entre camadas
   - Testar repositórios com banco de dados (test DB)
   - Testar APIs externas (mocks ou test doubles)

3. **E2E Tests** (quando necessário)
   - Fluxos críticos end-to-end
   - Testes de API completos

### Boas Práticas de Testes

```typescript
// ✅ BOM: Teste claro, descritivo, focado
describe('CreditService', () => {
  describe('consumeCredits', () => {
    it('should throw error when user has insufficient credits', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = 100;
      const mockRepository = createMockRepository({ availableCredits: 50 });
      const service = new CreditService(mockRepository, mockPlanService);

      // Act & Assert
      await expect(service.consumeCredits(userId, amount))
        .rejects
        .toThrow(InsufficientCreditsError);
    });
  });
});

// ❌ RUIM: Teste vago, múltiplas responsabilidades
it('test credits', async () => {
  // Testa várias coisas ao mesmo tempo
});
```

**Regras:**
- Nomes descritivos: `should [ação] when [condição]`
- Arrange-Act-Assert pattern
- Um conceito por teste
- Testes rápidos e independentes
- Testar comportamento, não implementação

---

## 🛡️ TRATAMENTO DE ERROS

### Estratégia

```typescript
// ✅ BOM: Erros customizados, específicos
class InsufficientCreditsError extends Error {
  constructor(available: number, requested: number) {
    super(`Insufficient credits: ${available} available, ${requested} requested`);
    this.name = 'InsufficientCreditsError';
  }
}

class PostNotFoundError extends Error {
  constructor(postId: string) {
    super(`Post not found: ${postId}`);
    this.name = 'PostNotFoundError';
  }
}

// Uso
async function getPost(id: string): Promise<Post> {
  const post = await repository.findById(id);
  if (!post) {
    throw new PostNotFoundError(id);
  }
  return post;
}

// ❌ RUIM: Erros genéricos, qualquer coisa
throw new Error('Error');
throw new Error('Something went wrong');
```

**Regras:**
- Erros específicos e nomeados
- Mensagens claras e informativas
- Hierarquia de erros quando necessário
- Não engolir erros silenciosamente
- Tratar erros no nível apropriado
- Logar erros apropriadamente

---

## 🔌 INJEÇÃO DE DEPENDÊNCIAS

```typescript
// ✅ BOM: Dependências injetadas, interfaces explícitas
interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  save(post: Post): Promise<Post>;
}

class PostService {
  constructor(
    private postRepository: IPostRepository,
    private creditService: ICreditService,
    private imageGenerator: IImageGenerator
  ) {}

  async createPost(request: CreatePostRequest): Promise<Post> {
    // ...
  }
}

// ❌ RUIM: Dependências hardcoded, difícil de testar
class PostService {
  async createPost(request: CreatePostRequest): Promise<Post> {
    const repository = new PostRepository(); // ❌
    const creditService = new CreditService(); // ❌
    // ...
  }
}
```

**Regras:**
- Sempre injetar dependências via constructor
- Depender de interfaces, não implementações
- Facilita testes (mocks/stubs)
- Facilita mudanças futuras

---

## 📦 VALIDAÇÃO E DTOs

```typescript
// ✅ BOM: Validação com Zod, tipos derivados
import { z } from 'zod';

const CreatePostSchema = z.object({
  idea: z.string().min(10).max(500),
  userId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
});

type CreatePostRequest = z.infer<typeof CreatePostSchema>;

// Validação na camada de apresentação
async function createPostController(req: Request, res: Response) {
  const validatedData = CreatePostSchema.parse(req.body);
  const post = await postService.createPost(validatedData);
  return res.json(post);
}

// ❌ RUIM: Validação manual, tipos any
function createPost(data: any) {
  if (!data.idea || data.idea.length < 10) {
    throw new Error('Invalid');
  }
  // ...
}
```

**Regras:**
- Validar na entrada (camada de apresentação)
- Usar Zod para validação e inferência de tipos
- DTOs explícitos para entrada/saída
- Não confiar em dados externos

---

## 🔄 ASSINCRONICIDADE

```typescript
// ✅ BOM: Async/await, tratamento de erros adequado
async function generatePostContent(idea: string): Promise<PostContent> {
  try {
    const [caption, imageUrl] = await Promise.all([
      generateCaption(idea),
      generateImage(idea),
    ]);
    
    return { caption, imageUrl };
  } catch (error) {
    logger.error('Failed to generate post content', { idea, error });
    throw new PostGenerationError('Failed to generate content', error);
  }
}

// ❌ RUIM: Promises encadeadas, erros não tratados
function generatePostContent(idea: string) {
  return generateCaption(idea)
    .then(caption => generateImage(idea).then(imageUrl => ({ caption, imageUrl })))
    .catch(error => {
      // Erro genérico
    });
}
```

**Regras:**
- Prefira async/await sobre Promises encadeadas
- Use Promise.all para operações paralelas
- Sempre trate erros
- Seja explícito com tipos de retorno

---

## 📊 LOGGING

```typescript
// ✅ BOM: Logging estruturado, níveis apropriados
import logger from '@/lib/logger';

logger.info('Post created', { 
  postId: post.id, 
  userId: post.userId,
  creditsUsed: creditsUsed 
});

logger.error('Failed to generate image', { 
  idea, 
  error: error.message,
  stack: error.stack 
});

// ❌ RUIM: console.log, informações insuficientes
console.log('Post created');
console.error(error);
```

**Regras:**
- Usar logger estruturado (Winston, Pino)
- Níveis apropriados (debug, info, warn, error)
- Contexto útil (IDs, parâmetros relevantes)
- Não logar informações sensíveis
- Logs em produção devem ser úteis para debugging

---

## 🎨 COMENTÁRIOS E DOCUMENTAÇÃO

```typescript
// ✅ BOM: Código autoexplicativo, comentários quando necessário
/**
 * Calcula o custo total em créditos para criar um post.
 * 
 * @param textModel - Modelo de IA usado para gerar o texto
 * @param imageModel - Modelo de IA usado para gerar a imagem
 * @returns Custo total em créditos
 */
function calculatePostCredits(textModel: string, imageModel: string): number {
  const textCost = getTextModelCost(textModel);
  const imageCost = getImageModelCost(imageModel);
  return textCost + imageCost;
}

// Comentário explicando "por quê" quando necessário
// Usamos cache de 5 minutos para balancear performance e frescor dos dados
const CACHE_TTL = 5 * 60 * 1000;

// ❌ RUIM: Comentários explicando "o quê" (código deve ser claro)
// Calcula o custo do post
function calculateCost(...) { }
```

**Regras:**
- Código deve ser autoexplicativo
- Comentários devem explicar "por quê", não "o quê"
- Use JSDoc para funções públicas/complexas
- Remova código comentado
- Documente decisões arquiteturais importantes

---

## ⚡ PERFORMANCE

### Princípios

1. **Premature Optimization é ruim**
   - Otimize apenas quando necessário
   - Meça primeiro, otimize depois

2. **Otimizações Comuns**
   - Queries eficientes (índices, select específicos)
   - Paginação para listas grandes
   - Cache quando apropriado
   - Operações assíncronas paralelas (Promise.all)
   - Lazy loading quando necessário

3. **Evitar**
   - N+1 queries
   - Carregar dados desnecessários
   - Loops aninhados desnecessários
   - Operações síncronas bloqueantes

---

## 🔒 SEGURANÇA

### Princípios

1. **Validação de Input**
   - Sempre validar dados de entrada
   - Sanitizar inputs
   - Usar Zod para validação

2. **Autenticação e Autorização**
   - Verificar autenticação em todas as rotas protegidas
   - Verificar permissões específicas
   - Row Level Security no banco

3. **Dados Sensíveis**
   - Nunca logar senhas, tokens
   - Usar variáveis de ambiente
   - Não commitar credenciais

4. **SQL Injection**
   - Usar Prisma (prevenção automática)
   - Nunca concatenar queries SQL

---

## 📐 PADRÕES DE PROJETO (Quando Apropriado)

### Repository Pattern
```typescript
interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findByUserId(userId: string): Promise<Post[]>;
  save(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
```

### Service Layer Pattern
```typescript
class PostService {
  constructor(
    private repository: IPostRepository,
    private creditService: ICreditService
  ) {}

  async createPost(request: CreatePostRequest): Promise<Post> {
    // Orquestra lógica de negócio
  }
}
```

### Factory Pattern (quando necessário)
```typescript
class ImageGeneratorFactory {
  static create(provider: 'fal-ai' | 'other'): IImageGenerator {
    switch (provider) {
      case 'fal-ai':
        return new FalAiImageGenerator();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

---

## ✅ CHECKLIST DE REVISÃO

Antes de considerar código completo, verificar:

- [ ] Código segue princípios SOLID?
- [ ] Funções são pequenas e focadas?
- [ ] Nomes são descritivos e revelam intenção?
- [ ] Não há duplicação de código?
- [ ] Dependências são injetadas?
- [ ] Tipos são explícitos (sem `any` desnecessário)?
- [ ] Erros são tratados adequadamente?
- [ ] Validações estão na camada apropriada?
- [ ] Logging está adequado?
- [ ] Código está testado (quando aplicável)?
- [ ] Comentários explicam "por quê" quando necessário?
- [ ] Código segue estrutura de pastas estabelecida?

---

## 🎯 RESUMO EXECUTIVO

**Sempre:**
- Escreva código como se a pessoa que vai mantê-lo fosse um psicopata que sabe onde você mora
- Prefira código claro e explícito sobre código "esperto"
- Pequeno é melhor que grande
- Simples é melhor que complexo
- Leitura é mais importante que escrita

**Nunca:**
- Otimize prematuramente
- Implemente funcionalidades que não são necessárias
- Comprometa legibilidade por performance (a menos que realmente necessário)
- Ignore erros silenciosamente
- Use `any` sem necessidade real

---

**Referências:**
- Clean Code (Robert C. Martin)
- Refactoring (Martin Fowler)
- Patterns of Enterprise Application Architecture (Martin Fowler)
- Domain-Driven Design (Eric Evans)
- TypeScript Handbook
- SOLID Principles
