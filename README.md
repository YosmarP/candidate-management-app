# Candidate Management

**Full‑stack** (Frontend Angular 16+ con Angular Material / Backend NestJS)

Repositorio: estructura monorepo con `frontend/` y `backend/`.

---
## Formato esperado del archivo Excel

El archivo Excel debe contener una hoja con las siguientes columnas:

| Seniority | Years of experience | Availability |
|-----------|---------------------|--------------|
| junior    | 5                   | false        |

- **Seniority**: valores permitidos → `junior`, `senior`.
- **Years of experience**: número entero.
- **Availability**: booleano (`true` o `false`)

En este repositorio encontrarás un archivo de ejemplo llamado **`candidates.xlsx`**
---
## Resumen del proyecto
Aplicación para subir candidatos desde un formulario en el frontend (Angular) enviando un Excel de una línea por candidato; el backend (NestJS) procesa el Excel, devuelve el JSON combinado y el frontend lo persiste incrementalmente. La app incluye validadores, directivas y una batería de tests (unitarios + e2e).

---

## Estructura del repositorio

```
candidate-management/
├── README.md
├── frontend/    # Angular 16+ con Material
└── backend/     # NestJS
```

Dentro de `frontend/` y `backend/` encontrarás la estructura típica de cada framework.

---

## Cómo ejecutar el proyecto (local)

### Requisitos
- Node.js >= 18
- npm

### Frontend
```bash
cd front
npm install
npm start       # ng serve
```
Accede en `http://localhost:4200`.

### Backend
```bash
cd back
npm install
npm run start:dev   # arranca Nest en modo desarrollo
```
API por defecto en `http://localhost:3000`.

---

## Endpoints principales

- `GET /candidates` — Obtener todos los candidatos.
- `POST /candidates` — Crear candidato (multipart/form-data): campos `name`, `surname` y `excelFile` (.xlsx).
- `GET /candidates/:id` — Obtener candidato por id.
- `DELETE /candidates/:id` — Eliminar candidato.

---

## Tests

### Estado actual (última ejecución)

```
Test Suites: 6 passed, 6 total ✅
Tests: 37 passed, 37 total ✅
Cobertura General: 78.03% sentencias, 84.61% funciones
```

### Reporte de cobertura (resumen)

| Módulo | Sentencias | Ramas | Funciones | Líneas |
|---|---:|---:|---:|---:|
| General | 78.03% | 62.22% | 84.61% | 79.33% |
| CandidateService | 100% | 100% | 100% | 100% |
| ExcelParserService | 84% | 70.27% | 100% | 88.37% |
| CandidateController | 100% | 100% | 100% | 100% |

### Comandos de tests

Ejecutar todos los tests (backend):
```bash
cd backend
npm test
```

Cobertura:
```bash
npm run test:cov
```

Modo watch (desarrollo):
```bash
npm run test:watch
```

Ejecutar tests específicos:
```bash
# desde backend/
npm test -- app.controller.spec.ts
npm test -- app.service.spec.ts
npm test -- candidate.service.spec.ts
npm test -- candidates.e2e-spec.ts
```

---

## Arquitectura de tests

**Unitarios (Backend)**
- `CandidateService` — CRUD, validaciones y manejo de errores (100%).
- `ExcelParserService` — parsing de Excel (tests para archivos válidos, corruptos, columnas faltantes, límites).
- `CandidateController` — endpoints y mapeo de errores.

**Integración / e2e**
- Tests e2e con `supertest` usando SQLite en memoria para aislar la base de datos.
- Casos incluidos: flujo completo POST (multipart), validaciones, errores y rutas CRUD.

---

## Validadores, Directivas, Pipes y Interceptors (Frontend)

### Validadores
**validator/excel-file.validator.ts** (ubicación: `front/src/app/validators/excel-file.validator.ts`)
- Valida tipo MIME y extensión (.xlsx / .xls)
```ts
excelFile: [null, [Validators.required, excelFileValidator]]
```

### Directivas
**auto-focus.directive.ts** (ubicación: `front/src/app/directives/auto-focus.directive.ts`)
- Enfoque automático de inputs
- Re-enfoque tras acciones (guardar/limpiar)
- Configurable con `focusTrigger` (sistema reactivo)
- Uso (ejemplo): `<input appAutoFocus [focusTrigger]="focusTrigger">`

### Pipes
- `titlecase` (Angular built-in) usado para mostrar `seniority` con capitalización.

### Interceptors 
Se implementó un **interceptor HTTP** para inyectar automáticamente el header `Authorization` en cada petición saliente. Esto facilita autenticación/propagación de tokens sin duplicar código en los servicios HTTP.

---

## Componentes principales (Frontend)

- `candidate-form` — Formulario reactivo (Name, Surname, Excel) con validaciones y subida multipart.
- `candidate-table` — Tabla con Material Table mostrando: `name`, `surname`, `seniority`, `yearsOfExperience`, `availability`.

---

## Backend (NestJS) – notas de implementación

- Endpoint REST con Swagger auto-documentado..
- `ExcelParserService` centraliza la lógica de parseo del Excel y devuelve `{seniority, yearsOfExperience, availability}`.
- `CandidateService` combina DTO + parsed Excel y persiste (por defecto en memoria para tests; preparada para TypeORM).
- Validación global con `ValidationPipe`.

---

## Commits relevantes (resumen)

```
feat(test): incrementar pruebas unitarias para aumentar la cobertura
feat(test): agregar pruebas unitarias para AppController
feat(test): agregar pruebas e2e para el módulo de candidatos
feat(directives): agregar directiva auto-focus reactiva
feat(validators): agregar validador de archivos Excel
refactor: eliminar validación duplicada en componente
f3d4f8c Implementación inicial: aplicación full-stack de gestión de candidatos
```

---

## Próximas mejoras sugeridas
- Añadir integración opcional con Kafka (módulo desacoplable) y tests mocked para demostrar pub/sub.
- Mejorar cobertura de ramas (branch coverage) en `ExcelParserService`.
- Añadir tests unitarios en frontend (si se decide Jest para Angular + configuración correcta) o tests con Karma/Jasmine.
- Paginación y filtros en la tabla de candidatos.
- Implementar middleware en el backend para recibir y normalizar la cabecera Authorization y exponerla a los controladores

---

## Nota final
Se priorizó entregar una solución estable y testeada en backend (Jest) y un frontend funcional usando Angular Material. 

---
