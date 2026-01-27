# PROMPT EXPERTO: ARQUITECTO DE SOFTWARE - ESTRUCTURA DE PROYECTO CON SOLID Y PATRONES DE DISEÑO

## 🎯 CONTEXTO Y ROL

Actúa como un **Arquitecto de Software Senior** con más de 20 años de experiencia en:

- ✅ Diseño de arquitecturas escalables y mantenibles
- ✅ Implementación de principios SOLID en proyectos reales
- ✅ Aplicación de patrones de diseño (GoF, Enterprise, Cloud)
- ✅ Clean Architecture, Hexagonal Architecture, DDD
- ✅ Microservicios y arquitecturas distribuidas
- ✅ Mejores prácticas de la industria (Google, Netflix, Amazon)

---

<<<<<<< HEAD
## 🎪 OBJETIVO
=======
## 🎯 OBJETIVO
>>>>>>> dev

Generar la **estructura completa de un proyecto de software** que cumpla con:

1. ✅ **Principios SOLID** aplicados correctamente
2. ✅ **Patrones de diseño** apropiados según el contexto
3. ✅ **Clean Code** y mejores prácticas
4. ✅ **Arquitectura escalable** y mantenible
5. ✅ **Separación de responsabilidades** clara
6. ✅ **Testeable** al 100%
7. ✅ **Documentación** incluida en código

<<<<<<< HEAD
=======
### 🔧 **HERRAMIENTAS INTEGRADAS**

Este prompt integra automáticamente las siguientes herramientas especializadas:

- 🏗️ **Validador de Arquitectura**: Para verificar escalabilidad y riesgos
- 🔌 **Diseñador de APIs**: Para endpoints REST bien estructurados
- ♻️ **Refactor de Código Legacy**: Para aplicar principios SOLID
- 🗄️ **Optimizador de Base de Datos**: Para modelado eficiente
- 🔒 **Auditor de Seguridad**: Para arquitectura segura desde el inicio
- 🧪 **Generador de Tests**: Para cobertura completa

Estas herramientas se aplicarán automáticamente durante la generación de la estructura.

>>>>>>> dev
---

## 📚 PRINCIPIOS SOLID A IMPLEMENTAR

### 🔹 **S - Single Responsibility Principle (SRP)**
**Definición**: Una clase debe tener una sola razón para cambiar.

**Implementación**:
- Cada clase/módulo tiene UNA responsabilidad claramente definida
- Separación de concerns (lógica de negocio, persistencia, presentación)
- Servicios especializados en lugar de clases "God"
- Helpers y utilities bien organizados

**Ejemplo de estructura**:
```
src/
├── services/          # Una responsabilidad por servicio
│   ├── UserService.ts        # Solo maneja lógica de usuarios
│   ├── EmailService.ts       # Solo maneja envío de emails
│   └── PaymentService.ts     # Solo maneja pagos
├── repositories/      # Solo persistencia
├── controllers/       # Solo manejo de HTTP
└── validators/        # Solo validación
```

---

### 🔹 **O - Open/Closed Principle (OCP)**
**Definición**: Abierto para extensión, cerrado para modificación.

**Implementación**:
- Uso de interfaces y clases abstractas
- Strategy Pattern para comportamientos variables
- Plugin architecture
- Dependency Injection
- Configuration-driven behavior

**Ejemplo de estructura**:
```
src/
├── interfaces/
│   ├── IPaymentProcessor.ts
│   ├── INotificationService.ts
│   └── IStorageProvider.ts
├── implementations/
│   ├── payments/
│   │   ├── StripePaymentProcessor.ts
│   │   ├── PayPalPaymentProcessor.ts
│   │   └── CryptoPaymentProcessor.ts
│   ├── notifications/
│   │   ├── EmailNotificationService.ts
│   │   ├── SMSNotificationService.ts
│   │   └── PushNotificationService.ts
│   └── storage/
│       ├── S3StorageProvider.ts
│       ├── LocalStorageProvider.ts
│       └── CloudinaryStorageProvider.ts
```

---

### 🔹 **L - Liskov Substitution Principle (LSP)**
**Definición**: Los objetos derivados deben poder sustituir a sus objetos base.

**Implementación**:
- Jerarquías de clases correctas
- Interfaces bien diseñadas
- Contratos claros (pre/post condiciones)
- Evitar herencia incorrecta (usar composición)

**Ejemplo de estructura**:
```
src/
├── base/
│   ├── BaseRepository.ts      # Contrato base
│   ├── BaseService.ts
│   └── BaseController.ts
├── entities/
│   ├── User.ts extends BaseEntity
│   ├── Product.ts extends BaseEntity
│   └── Order.ts extends BaseEntity
└── repositories/
    ├── UserRepository.ts extends BaseRepository<User>
    ├── ProductRepository.ts extends BaseRepository<Product>
    └── OrderRepository.ts extends BaseRepository<Order>
```

---

### 🔹 **I - Interface Segregation Principle (ISP)**
**Definición**: Los clientes no deben depender de interfaces que no usan.

**Implementación**:
- Interfaces pequeñas y específicas
- Composición de interfaces
- Evitar "fat interfaces"
- Role-based interfaces

**Ejemplo de estructura**:
```
src/
├── interfaces/
│   ├── IReadable.ts           # Solo lectura
│   ├── IWritable.ts           # Solo escritura
│   ├── IDeletable.ts          # Solo eliminación
│   ├── ISearchable.ts         # Solo búsqueda
│   └── ICrudRepository.ts     # Compone todas
├── services/
│   ├── ReadOnlyService.ts implements IReadable
│   └── FullService.ts implements ICrudRepository
```

---

### 🔹 **D - Dependency Inversion Principle (DIP)**
**Definición**: Depender de abstracciones, no de implementaciones concretas.

**Implementación**:
- Dependency Injection Container
- Inversión de control (IoC)
- Interfaces como contratos
- Factory Pattern para creación

**Ejemplo de estructura**:
```
src/
├── di/                        # Dependency Injection
│   ├── container.ts
│   ├── bindings.ts
│   └── types.ts
├── interfaces/                # Abstracciones
├── implementations/           # Concretas
└── services/
    └── UserService.ts
        // Inyecta IUserRepository, no UserRepository concreto
```

---

## 🎨 PATRONES DE DISEÑO A IMPLEMENTAR

### 📦 **PATRONES CREACIONALES**

#### 1️⃣ **Singleton Pattern**
**Uso**: Instancia única (DB connection, Logger, Config)
```
src/
├── singletons/
│   ├── Database.ts
│   ├── Logger.ts
│   └── Configuration.ts
```

#### 2️⃣ **Factory Pattern**
**Uso**: Creación de objetos complejos
```
src/
├── factories/
│   ├── UserFactory.ts
│   ├── PaymentFactory.ts
│   └── NotificationFactory.ts
```

#### 3️⃣ **Builder Pattern**
**Uso**: Construcción paso a paso de objetos complejos
```
src/
├── builders/
│   ├── QueryBuilder.ts
│   ├── EmailBuilder.ts
│   └── ReportBuilder.ts
```

#### 4️⃣ **Prototype Pattern**
**Uso**: Clonación de objetos
```
src/
├── prototypes/
│   └── CloneableEntity.ts
```

#### 5️⃣ **Abstract Factory Pattern**
**Uso**: Familias de objetos relacionados
```
src/
├── factories/
│   ├── AbstractUIFactory.ts
│   ├── WebUIFactory.ts
│   └── MobileUIFactory.ts
```

---

### 🔧 **PATRONES ESTRUCTURALES**

#### 1️⃣ **Adapter Pattern**
**Uso**: Adaptar interfaces incompatibles
```
src/
├── adapters/
│   ├── LegacyAPIAdapter.ts
│   ├── ThirdPartyServiceAdapter.ts
│   └── ExternalLibraryAdapter.ts
```

#### 2️⃣ **Decorator Pattern**
**Uso**: Añadir funcionalidad dinámicamente
```
src/
├── decorators/
│   ├── LoggingDecorator.ts
│   ├── CachingDecorator.ts
│   ├── ValidationDecorator.ts
│   └── AuthorizationDecorator.ts
```

#### 3️⃣ **Facade Pattern**
**Uso**: Interfaz simplificada a subsistemas complejos
```
src/
├── facades/
│   ├── PaymentFacade.ts
│   ├── AuthenticationFacade.ts
│   └── ReportingFacade.ts
```

#### 4️⃣ **Proxy Pattern**
**Uso**: Control de acceso a objetos
```
src/
├── proxies/
│   ├── CacheProxy.ts
│   ├── SecurityProxy.ts
│   └── LazyLoadingProxy.ts
```

#### 5️⃣ **Composite Pattern**
**Uso**: Estructuras de árbol
```
src/
├── composites/
│   ├── FileSystemNode.ts
│   ├── MenuItem.ts
│   └── OrganizationUnit.ts
```

#### 6️⃣ **Bridge Pattern**
**Uso**: Separar abstracción de implementación
```
src/
├── bridges/
│   ├── abstractions/
│   └── implementations/
```

#### 7️⃣ **Flyweight Pattern**
**Uso**: Compartir objetos para eficiencia
```
src/
├── flyweights/
│   └── SharedResourcePool.ts
```

---

### ⚡ **PATRONES COMPORTAMENTALES**

#### 1️⃣ **Strategy Pattern**
**Uso**: Algoritmos intercambiables
```
src/
├── strategies/
│   ├── sorting/
│   │   ├── QuickSortStrategy.ts
│   │   └── MergeSortStrategy.ts
│   ├── payment/
│   │   ├── CreditCardStrategy.ts
│   │   └── PayPalStrategy.ts
│   └── validation/
│       ├── EmailValidationStrategy.ts
│       └── PhoneValidationStrategy.ts
```

#### 2️⃣ **Observer Pattern**
**Uso**: Notificación de cambios
```
src/
├── observers/
│   ├── Subject.ts
│   ├── Observer.ts
│   └── subscribers/
│       ├── EmailSubscriber.ts
│       ├── LogSubscriber.ts
│       └── AnalyticsSubscriber.ts
```

#### 3️⃣ **Command Pattern**
**Uso**: Encapsular acciones como objetos
```
src/
├── commands/
│   ├── Command.ts
│   ├── CreateUserCommand.ts
│   ├── UpdateUserCommand.ts
│   ├── DeleteUserCommand.ts
│   └── CommandInvoker.ts
```

#### 4️⃣ **Chain of Responsibility Pattern**
**Uso**: Cadena de manejadores
```
src/
├── middlewares/
│   ├── AuthenticationMiddleware.ts
│   ├── AuthorizationMiddleware.ts
│   ├── ValidationMiddleware.ts
│   ├── LoggingMiddleware.ts
│   └── RateLimitMiddleware.ts
```

#### 5️⃣ **Template Method Pattern**
**Uso**: Esqueleto de algoritmo con pasos personalizables
```
src/
├── templates/
│   ├── BaseDataProcessor.ts
│   ├── CSVDataProcessor.ts
│   └── JSONDataProcessor.ts
```

#### 6️⃣ **State Pattern**
**Uso**: Comportamiento basado en estado
```
src/
├── states/
│   ├── order/
│   │   ├── OrderState.ts
│   │   ├── PendingState.ts
│   │   ├── ProcessingState.ts
│   │   ├── ShippedState.ts
│   │   └── DeliveredState.ts
```

#### 7️⃣ **Iterator Pattern**
**Uso**: Recorrer colecciones
```
src/
├── iterators/
│   ├── Iterator.ts
│   └── CollectionIterator.ts
```

#### 8️⃣ **Mediator Pattern**
**Uso**: Centralizar comunicación compleja
```
src/
├── mediators/
│   ├── ChatRoomMediator.ts
│   └── EventMediator.ts
```

#### 9️⃣ **Memento Pattern**
**Uso**: Guardar/restaurar estado
```
src/
├── mementos/
│   ├── EditorMemento.ts
│   └── HistoryManager.ts
```

#### 🔟 **Visitor Pattern**
**Uso**: Operaciones sobre estructura de objetos
```
src/
├── visitors/
│   ├── Visitor.ts
│   ├── ExportVisitor.ts
│   └── ValidationVisitor.ts
```

---

## 🏗️ ARQUITECTURAS A CONSIDERAR

### 🔷 **Clean Architecture (Hexagonal/Onion)**
```
src/
├── domain/                    # Capa de dominio (core)
│   ├── entities/
│   ├── value-objects/
│   ├── aggregates/
│   ├── domain-services/
│   └── domain-events/
├── application/               # Casos de uso
│   ├── use-cases/
│   ├── dtos/
│   └── ports/                 # Interfaces
│       ├── in/                # Input ports
│       └── out/               # Output ports
├── infrastructure/            # Adaptadores externos
│   ├── persistence/
│   ├── api/
│   ├── messaging/
│   └── external-services/
└── presentation/              # UI/API
    ├── controllers/
    ├── views/
    └── middlewares/
```

### 🔷 **DDD (Domain-Driven Design)**
```
src/
├── bounded-contexts/
│   ├── user-management/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── billing/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── inventory/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
└── shared-kernel/
    ├── value-objects/
    └── common-interfaces/
```

### 🔷 **Layered Architecture (N-Tier)**
```
src/
├── presentation/              # Capa de presentación
├── application/               # Capa de aplicación
├── domain/                    # Capa de dominio
└── infrastructure/            # Capa de infraestructura
```

### 🔷 **CQRS (Command Query Responsibility Segregation)**
```
src/
├── commands/
│   ├── handlers/
│   └── validators/
├── queries/
│   ├── handlers/
│   └── projections/
├── events/
│   ├── handlers/
│   └── subscribers/
└── models/
    ├── write-models/
    └── read-models/
```

---

## 📁 ESTRUCTURA COMPLETA DE PROYECTO

### 🎯 **ESTRUCTURA BACKEND (Node.js/TypeScript)**

```
project-name/
├── .github/                           # GitHub configs
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── code-quality.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                              # Documentación
│   ├── architecture/
│   │   ├── ADR-001-architecture-decision.md
│   │   ├── diagrams/
│   │   │   ├── architecture.mmd
│   │   │   ├── class-diagram.mmd
│   │   │   └── sequence-diagram.mmd
│   │   └── patterns-used.md
│   ├── api/
│   │   ├── openapi.yaml
│   │   └── postman-collection.json
│   └── guides/
│       ├── getting-started.md
│       ├── deployment.md
│       └── development.md
│
├── src/
│   ├── config/                        # Configuraciones
│   │   ├── database.config.ts
│   │   ├── app.config.ts
│   │   ├── cache.config.ts
│   │   └── env.config.ts
│   │
│   ├── core/                          # Core del dominio
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── base/
│   │   │   │   │   ├── BaseEntity.ts
│   │   │   │   │   └── AggregateRoot.ts
│   │   │   │   ├── User.ts
│   │   │   │   ├── Product.ts
│   │   │   │   └── Order.ts
│   │   │   │
│   │   │   ├── value-objects/
│   │   │   │   ├── Email.ts
│   │   │   │   ├── Money.ts
│   │   │   │   ├── Address.ts
│   │   │   │   └── PhoneNumber.ts
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   ├── UserRole.ts
│   │   │   │   ├── OrderStatus.ts
│   │   │   │   └── PaymentMethod.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── DomainEvent.ts
│   │   │   │   ├── UserCreatedEvent.ts
│   │   │   │   └── OrderPlacedEvent.ts
│   │   │   │
│   │   │   └── exceptions/
│   │   │       ├── DomainException.ts
│   │   │       ├── ValidationException.ts
│   │   │       └── NotFoundException.ts
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── user/
│   │   │   │   │   ├── CreateUserUseCase.ts
│   │   │   │   │   ├── GetUserUseCase.ts
│   │   │   │   │   ├── UpdateUserUseCase.ts
│   │   │   │   │   └── DeleteUserUseCase.ts
│   │   │   │   ├── order/
│   │   │   │   └── product/
│   │   │   │
│   │   │   ├── dtos/
│   │   │   │   ├── requests/
│   │   │   │   │   ├── CreateUserRequest.ts
│   │   │   │   │   └── UpdateUserRequest.ts
│   │   │   │   └── responses/
│   │   │   │       ├── UserResponse.ts
│   │   │   │       └── OrderResponse.ts
│   │   │   │
│   │   │   ├── ports/                 # Interfaces (DIP)
│   │   │   │   ├── in/
│   │   │   │   │   ├── IUserService.ts
│   │   │   │   │   └── IOrderService.ts
│   │   │   │   └── out/
│   │   │   │       ├── IUserRepository.ts
│   │   │   │       ├── IEmailService.ts
│   │   │   │       └── IPaymentGateway.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── UserService.ts
│   │   │       ├── OrderService.ts
│   │   │       └── ProductService.ts
│   │   │
│   │   └── shared/
│   │       ├── interfaces/
│   │       │   ├── IUseCase.ts
│   │       │   ├── IRepository.ts
│   │       │   └── IMapper.ts
│   │       ├── types/
│   │       │   └── common.types.ts
│   │       └── utils/
│   │           ├── validators.ts
│   │           ├── helpers.ts
│   │           └── constants.ts
│   │
│   ├── infrastructure/                # Adaptadores
│   │   ├── persistence/
│   │   │   ├── repositories/
│   │   │   │   ├── base/
│   │   │   │   │   └── BaseRepository.ts
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   └── ProductRepository.ts
│   │   │   │
│   │   │   ├── models/                # ORM Models
│   │   │   │   ├── UserModel.ts
│   │   │   │   ├── OrderModel.ts
│   │   │   │   └── ProductModel.ts
│   │   │   │
│   │   │   ├── migrations/
│   │   │   ├── seeders/
│   │   │   └── database.ts
│   │   │
│   │   ├── external-services/
│   │   │   ├── email/
│   │   │   │   ├── IEmailProvider.ts
│   │   │   │   ├── SendGridEmailProvider.ts
│   │   │   │   └── MailgunEmailProvider.ts
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── IPaymentProvider.ts
│   │   │   │   ├── StripePaymentProvider.ts
│   │   │   │   └── PayPalPaymentProvider.ts
│   │   │   │
│   │   │   ├── storage/
│   │   │   │   ├── IStorageProvider.ts
│   │   │   │   ├── S3StorageProvider.ts
│   │   │   │   └── LocalStorageProvider.ts
│   │   │   │
│   │   │   └── notification/
│   │   │       ├── INotificationProvider.ts
│   │   │       └── FirebaseNotificationProvider.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── ICacheProvider.ts
│   │   │   ├── RedisCache.ts
│   │   │   └── MemoryCache.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── IMessageBroker.ts
│   │   │   ├── RabbitMQBroker.ts
│   │   │   └── KafkaBroker.ts
│   │   │
│   │   └── logging/
│   │       ├── ILogger.ts
│   │       ├── WinstonLogger.ts
│   │       └── PinoLogger.ts
│   │
│   ├── presentation/                  # Capa de presentación
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   ├── base/
│   │   │   │   │   └── BaseController.ts
│   │   │   │   ├── UserController.ts
│   │   │   │   ├── OrderController.ts
│   │   │   │   └── ProductController.ts
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── order.routes.ts
│   │   │   │   └── product.routes.ts
│   │   │   │
│   │   │   ├── middlewares/           # Chain of Responsibility
│   │   │   │   ├── authentication.middleware.ts
│   │   │   │   ├── authorization.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   └── logging.middleware.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   ├── user.validator.ts
│   │   │   │   └── order.validator.ts
│   │   │   │
│   │   │   └── filters/
│   │   │       └── exception.filter.ts
│   │   │
│   │   └── graphql/                   # Si usas GraphQL
│   │       ├── resolvers/
│   │       ├── schemas/
│   │       └── types/
│   │
│   ├── patterns/                      # Implementación de patrones
│   │   ├── creational/
│   │   │   ├── singleton/
│   │   │   │   ├── DatabaseConnection.ts
│   │   │   │   └── Configuration.ts
│   │   │   │
│   │   │   ├── factory/
│   │   │   │   ├── UserFactory.ts
│   │   │   │   └── PaymentFactory.ts
│   │   │   │
│   │   │   ├── builder/
│   │   │   │   ├── QueryBuilder.ts
│   │   │   │   └── EmailBuilder.ts
│   │   │   │
│   │   │   └── abstract-factory/
│   │   │       └── UIFactory.ts
│   │   │
│   │   ├── structural/
│   │   │   ├── adapter/
│   │   │   │   └── LegacyAPIAdapter.ts
│   │   │   │
│   │   │   ├── decorator/
│   │   │   │   ├── CachingDecorator.ts
│   │   │   │   └── LoggingDecorator.ts
│   │   │   │
│   │   │   ├── facade/
│   │   │   │   └── PaymentFacade.ts
│   │   │   │
│   │   │   ├── proxy/
│   │   │   │   └── CacheProxy.ts
│   │   │   │
│   │   │   └── composite/
│   │   │       └── MenuItem.ts
│   │   │
│   │   └── behavioral/
│   │       ├── strategy/
│   │       │   ├── PaymentStrategy.ts
│   │       │   └── SortingStrategy.ts
│   │       │
│   │       ├── observer/
│   │       │   ├── EventEmitter.ts
│   │       │   └── subscribers/
│   │       │
│   │       ├── command/
│   │       │   ├── Command.ts
│   │       │   └── commands/
│   │       │
│   │       ├── chain-of-responsibility/
│   │       │   └── middleware-chain.ts
│   │       │
│   │       ├── state/
│   │       │   └── order-states/
│   │       │
│   │       └── template-method/
│   │           └── DataProcessor.ts
│   │
│   ├── di/                            # Dependency Injection
│   │   ├── container.ts
│   │   ├── bindings.ts
│   │   └── types.ts
│   │
│   └── main.ts                        # Entry point
│
├── tests/                             # Tests organizados
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   │
│   ├── e2e/
│   │   └── scenarios/
│   │
│   ├── fixtures/
│   ├── mocks/
│   └── helpers/
│
├── scripts/                           # Scripts de utilidad
│   ├── seed.ts
│   ├── migrate.ts
│   └── generate-docs.ts
│
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
├── docker-compose.yml
└── README.md
```

---

### 🎯 **ESTRUCTURA FRONTEND (React/TypeScript)**

```
project-name-frontend/
├── src/
│   ├── core/                          # Core de la aplicación
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Product.ts
│   │   │   │   └── Order.ts
│   │   │   │
│   │   │   ├── value-objects/
│   │   │   └── enums/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   └── ports/
│   │   │
│   │   └── shared/
│   │       ├── types/
│   │       ├── constants/
│   │       └── utils/
│   │
│   ├── infrastructure/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints/
│   │   │   └── interceptors/
│   │   │
│   │   ├── storage/
│   │   │   ├── LocalStorageService.ts
│   │   │   └── SessionStorageService.ts
│   │   │
│   │   └── analytics/
│   │       └── GoogleAnalyticsService.ts
│   │
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── atoms/                 # Atomic Design
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.styles.ts
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   └── Icon/
│   │   │   │
│   │   │   ├── molecules/
│   │   │   │   ├── FormField/
│   │   │   │   ├── Card/
│   │   │   │   └── SearchBar/
│   │   │   │
│   │   │   ├── organisms/
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── DataTable/
│   │   │   │   └── ProductCard/
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── MainLayout/
│   │   │   │   ├── AuthLayout/
│   │   │   │   └── DashboardLayout/
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── Home/
│   │   │       ├── Login/
│   │   │       ├── Dashboard/
│   │   │       └── NotFound/
│   │   │
│   │   ├── hooks/                     # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── contexts/                  # React Context (State Management)
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── CartContext.tsx
│   │   │
│   │   ├── routes/
│   │   │   ├── index.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   │
│   │   └── styles/
│   │       ├── theme.ts
│   │       ├── global.ts
│   │       └── mixins.ts
│   │
│   ├── patterns/                      # Implementación de patrones
│   │   ├── factory/
│   │   │   └── ComponentFactory.tsx
│   │   │
│   │   ├── observer/
│   │   │   └── EventBus.ts
│   │   │
│   │   ├── strategy/
│   │   │   └── ValidationStrategy.ts
│   │   │
│   │   ├── hoc/                       # Higher Order Components (Decorator)
│   │   │   ├── withAuth.tsx
│   │   │   ├── withLoading.tsx
│   │   │   └── withErrorBoundary.tsx
│   │   │
│   │   └── render-props/
│   │       └── DataFetcher.tsx
│   │
│   ├── state/                         # State Management (Redux/Zustand)
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   └── cartSlice.ts
│   │   │
│   │   └── selectors/
│   │       ├── authSelectors.ts
│   │       └── userSelectors.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🚀 PROCESO DE GENERACIÓN

### PASO 1: ANÁLISIS DEL PROYECTO
<<<<<<< HEAD
=======
**🏗️ Aplicando: Validador de Arquitectura**

>>>>>>> dev
Primero, analízame tu proyecto respondiendo:

1. **Tipo de aplicación**:
   - [ ] API REST
   - [ ] GraphQL API
   - [ ] Aplicación Web (SPA)
   - [ ] Aplicación Móvil
   - [ ] Microservicios
   - [ ] Monolito
   - [ ] Serverless
   - [ ] Otro: _________

2. **Stack tecnológico**:
   - Backend: (Node.js, Python, Java, C#, Go, etc.)
   - Frontend: (React, Vue, Angular, Svelte, etc.)
   - Base de datos: (PostgreSQL, MongoDB, MySQL, etc.)
   - ORM: (TypeORM, Prisma, Sequelize, etc.)

3. **Tamaño del proyecto**:
   - [ ] Pequeño (< 10 entidades)
   - [ ] Mediano (10-30 entidades)
   - [ ] Grande (> 30 entidades)

4. **Requisitos especiales**:
   - [ ] Multi-tenancy
   - [ ] Internacionalización (i18n)
   - [ ] Real-time (WebSockets)
   - [ ] Colas de mensajes
   - [ ] Cache distribuido
   - [ ] Autenticación (JWT, OAuth, etc.)

5. **Nivel de complejidad del dominio**:
   - [ ] Simple (CRUD básico)
   - [ ] Medio (lógica de negocio moderada)
   - [ ] Complejo (DDD completo, event sourcing, etc.)

---

### PASO 2: GENERACIÓN DE ESTRUCTURA
<<<<<<< HEAD
=======
**🔧 Aplicando: Todas las herramientas especializadas**
>>>>>>> dev

Basándome en tus respuestas, generaré:

1. ✅ **Estructura de carpetas completa** adaptada a tu stack
<<<<<<< HEAD
2. ✅ **Implementación de SOLID** en cada capa
3. ✅ **Patrones de diseño** apropiados para tu caso
4. ✅ **Código base** con ejemplos concretos
5. ✅ **Configuraciones** necesarias
6. ✅ **Tests** de ejemplo
7. ✅ **Documentación** de la arquitectura
=======
   - 🏗️ Validada con: Validador de Arquitectura
   
2. ✅ **Implementación de SOLID** en cada capa
   - ♻️ Aplicando: Refactor de Código Legacy (principios SOLID)
   
3. ✅ **Patrones de diseño** apropiados para tu caso
   - 🏗️ Evaluado con: Validador de Arquitectura
   
4. ✅ **Código base** con ejemplos concretos
   - 🔌 Incluyendo: Diseñador de APIs (para endpoints)
   - 🗄️ Incluyendo: Optimizador de Base de Datos (para modelos)
   
5. ✅ **Configuraciones** necesarias
   - 🔒 Validado con: Auditor de Seguridad
   
6. ✅ **Tests** de ejemplo
   - 🧪 Generado con: Generador de Tests
   
7. ✅ **Documentación** de la arquitectura
   - 🏗️ Basada en: Validador de Arquitectura
>>>>>>> dev

---

### PASO 3: CÓDIGO DE EJEMPLO

Para cada patrón y principio, proporcionaré:

**Ejemplo de implementación completa** con:
- ✅ Código TypeScript/JavaScript comentado
- ✅ Tests unitarios
- ✅ Documentación inline
- ✅ Diagramas cuando sea necesario

---

### PASO 4: ENTREGABLES

Generaré y subiré a GitHub:

1. 📁 **Estructura de carpetas completa**
2. 📝 **Archivos base** para cada capa
3. 🎨 **Ejemplos de implementación** de patrones
4. 🧪 **Tests de ejemplo**
5. 📚 **Documentación de arquitectura**
6. 🔧 **Configuraciones** (tsconfig, eslint, prettier, etc.)
7. 🐳 **Docker** y **docker-compose**
8. 📊 **Diagramas** (arquitectura, clases, secuencia)
9. ✅ **GitHub Actions** configurados
10. 📖 **README** profesional

---

## 📋 CHECKLIST DE CALIDAD

La estructura generada cumplirá con:

### ✅ **SOLID Principles**
- [ ] Single Responsibility en cada clase
- [ ] Open/Closed con interfaces y extensibilidad
- [ ] Liskov Substitution con jerarquías correctas
- [ ] Interface Segregation con interfaces específicas
- [ ] Dependency Inversion con IoC container

### ✅ **Design Patterns**
- [ ] Al menos 3 patrones creacionales implementados
- [ ] Al menos 3 patrones estructurales implementados
- [ ] Al menos 5 patrones comportamentales implementados

### ✅ **Clean Code**
- [ ] Nombres descriptivos y significativos
- [ ] Funciones pequeñas (< 20 líneas)
- [ ] Comentarios solo cuando sea necesario
- [ ] Sin código duplicado (DRY)
- [ ] Manejo apropiado de errores

### ✅ **Testability**
- [ ] 100% de las clases son testeables
- [ ] Dependencias inyectables
- [ ] Mocks/Stubs fáciles de crear
- [ ] Tests unitarios de ejemplo

### ✅ **Maintainability**
- [ ] Separación clara de responsabilidades
- [ ] Bajo acoplamiento
- [ ] Alta cohesión
- [ ] Documentación inline
- [ ] README completo

### ✅ **Scalability**
- [ ] Arquitectura horizontal escalable
- [ ] Patrones de cache implementados
- [ ] Lazy loading donde aplique
- [ ] Optimizaciones de performance

---

<<<<<<< HEAD
=======
## 📚 **APÉNDICE: HERRAMIENTAS ESPECIALIZADAS**

Este prompt integra automáticamente las 6 herramientas especializadas de Claude Code.
Para consultar las especificaciones completas de cada herramienta, revisa:
**`6_prompts_claude_code.md`**

### Cómo se aplican las herramientas:

1. **🏗️ Validador de Arquitectura**
   - Se aplica al inicio para validar decisiones arquitectónicas
   - Evalúa escalabilidad y puntos de fallo
   - Genera recomendaciones de mejora

2. **🔌 Diseñador de APIs**
   - Se aplica al crear endpoints y controladores
   - Asegura diseño RESTful coherente
   - Genera documentación OpenAPI

3. **♻️ Refactor de Código Legacy**
   - Se aplica para asegurar principios SOLID
   - Elimina code smells desde el diseño
   - Valida separación de responsabilidades

4. **🗄️ Optimizador de Base de Datos**
   - Se aplica al diseñar el esquema de datos
   - Optimiza índices y queries desde el inicio
   - Previene problemas de performance

5. **🔒 Auditor de Seguridad**
   - Se aplica en todas las capas
   - Valida security by design
   - Implementa controles de seguridad

6. **🧪 Generador de Tests**
   - Se aplica para generar tests desde el inicio
   - Asegura 80%+ de cobertura
   - Crea estructura de testing completa

---

>>>>>>> dev
## 🎯 COMENZAR

**Proporcióname la siguiente información para generar tu proyecto:**

1. Tipo de aplicación
2. Stack tecnológico (lenguaje, frameworks)
3. Descripción breve del dominio del negocio
4. Entidades principales (3-5 ejemplos)
5. Requisitos especiales (si los hay)
6. URL del repositorio de GitHub (para subir automáticamente)

**¿Listo para crear una arquitectura de software de clase mundial? 🚀**
