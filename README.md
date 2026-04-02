# 🛡️ Vigía Cauca - Sistema de Visualización Georreferenciada de Incidentes y Alertas

[![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-brightgreen)](https://github.com/StreetRogue/vigia-cauca)
[![Metodología](https://img.shields.io/badge/Metodolog%C3%ADa-AUP%20%2B%20Scrum-blue)](https://github.com/StreetRogue/vigia-cauca)
[![Universidad](https://img.shields.io/badge/Universidad-del%20Cauca-orange)](https://www.unicauca.edu.co)

> **Plataforma web para la gestión, visualización y análisis de incidentes de seguridad en el departamento del Cauca**

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Objetivos](#-objetivos)
- [Equipo de Trabajo](#-equipo-de-trabajo)
- [Tecnologías](#-tecnologías)
- [Metodología](#-metodología)
- [Cronograma](#-cronograma)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Documentación](#-documentación)

---

## 🎯 Acerca del Proyecto

**Vigía Cauca** es un sistema de información web desarrollado por **BitNova** para la **Secretaría de Gobierno del Cauca**, orientado a la captación, gestión y visualización de datos de seguridad en los municipios del departamento del Cauca.

### Características Principales:
- ✅ Registro de eventos de seguridad en tiempo real
- ✅ Dashboard interactivo con mapas de calor georreferenciados
- ✅ Sistema de roles diferenciados (Administrador, Operador, Visitante)
- ✅ Generación de reportes en PDF y Excel
- ✅ Trazabilidad completa de cambios (Auditoría)
- ✅ Visualización de estadísticas e indicadores

---

## 🎯 Objetivos

### Objetivo General
Desarrollar una aplicación web responsive que gestione los incidentes de orden público que se presentan en el Cauca para apoyar la toma de decisiones.

### Objetivos Específicos
1. Implementar autenticación y autorización basada en roles
2. Desarrollar módulo CRUD de novedades georreferenciadas
3. Implementar dashboards interactivos con gráficos y filtros dinámicos
4. Crear sistema de administración de usuarios con auditoría
5. Desarrollar módulo de generación de reportes exportables

---

## 👥 Equipo de Trabajo - BitNova

| Nombre | Rol Principal | Rol Scrum | Responsabilidades Clave |
|--------|--------------|-----------|-------------------------|
| **Ana Sofía Arango Yanza** | Líder de Proyecto | Scrum Master | Gestión del backlog, facilitación de ceremonias, comunicación con cliente |
| **Cristhian Camilo Uñas Ocaña** | Secretario | Desarrollador | Documentación, arquitectura de software, registro de acuerdos |
| **Juan Esteban Chavez Collazos** | Moderador | Desarrollador | Prototipos Figma, diseño de interfaces, facilitación de sesiones |
| **Juan Diego Pérez Martínez** | Interventor del Proyecto | Desarrollador | Validación de criterios de aceptación, plan de pruebas, control de calidad |
| **Juan Esteban Martínez Marín** | Web Master | Desarrollador | Integración técnica, revisión de pull requests, configuración de ambiente |

### Cliente / Stakeholders
| Nombre | Rol | Organización |
|--------|-----|--------------|
| **Emilse Castillo** | Clienta Intermediaria / Product Owner | Secretaría de Gobernación del Cauca |
| **Henry Laniado** | Tutor / Asesor Técnico | Universidad del Cauca |

---

## 💻 Tecnologías

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React + Vite | v18.2+ |
| **Arquitectura Frontend** | Atomic Design + Hexagonal | - |
| **Gráficos** | Recharts / ApexCharts | Latest |
| **Testing Frontend** | Vitest + Testing Library | Latest |
| **Backend** | Node.js | v20+ |
| **Base de Datos** | PostgreSQL | v15+ |
| **Control de Versiones** | Git + GitHub | - |
| **Diseño de Interfaces** | Figma | - |
| **Gestión del Proyecto** | Trello + GitHub Projects | - |
| **Documentación** | Google Workspace + Markdown | - |
| **Comunicación** | Google Meet | - |

### Herramientas de Desarrollo
- **ESLint + Prettier** - Calidad de código y formato
- **Semantic Versioning** - Control de versiones
- **Conventional Commits** - Estandarización de commits
- **Feature Branching** - Estrategia de ramas
- **GitHub Actions** - CI/CD automatizado

---

## 📊 Metodología

### Enfoque Híbrido: AUP + Scrum

**Agile Unified Process (AUP)** proporciona la estructura de alto nivel con 4 fases:
1. **Inicio** (13/02 - 12/03) - Definición del alcance
2. **Elaboración** (13/03 - 09/04) - Arquitectura y diseño
3. **Construcción** (10/04 - 21/05) - Desarrollo funcional
4. **Transición** (22/05 - 06/06) - Despliegue y cierre

**Scrum** se ejecuta dentro de cada fase con:
- Sprints de 2 semanas
- Ceremonias ágiles (Planning, Daily, Review, Retrospective)
- Entregas incrementales verificables

### Épicas del Proyecto

| HE-ID | Título | Descripción |
|-------|--------|-------------|
| **HE-01** | Gestión de Accesos y Seguridad | Autenticación, autorización y gestión de usuarios |
| **HE-02** | Registro y Consulta de Novedades | CRUD de eventos georreferenciados |
| **HE-03** | Visualización y Dashboard | Indicadores, gráficos y análisis |
| **HE-04** | Administración y Configuración | Gestión de operadores y auditoría |
| **HE-05** | Módulo de Reportes | Exportación a PDF y Excel |

---

## 📅 Cronograma

| Fase | Sprints | Fechas | Duración | Entregables Principales |
|------|---------|--------|----------|-------------------------|
| **Inicio** | 0-1 | 13/02 - 12/03 | 4 semanas | Idea aprobada, Propuesta, HU validadas |
| **Elaboración** | 2-3 | 13/03 - 09/04 | 4 semanas | C4, DER, Prototipos Figma, Plan de Pruebas |
| **Construcción** | 4-6 | 10/04 - 21/05 | 6 semanas | Módulos HE-01 a HE-05 funcionales |
| **Transición** | 7 | 22/05 - 06/06 | 2 semanas | Despliegue, manuales, presentación final |

**Fecha de Entrega Final:** 6 de junio de 2026

---

## 📁 Estructura del Proyecto

```
vigia-cauca/
│
├── frontend/                      # Aplicación React + Vite
│   ├── src/
│   │   ├── core/                  # Lógica de negocio (Hexagonal)
│   │   │   ├── domain/           # Entidades y casos de uso puros
│   │   │   └── application/      # Servicios de aplicación
│   │   ├── presentation/         # Componentes UI (Atomic Design)
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   ├── templates/
│   │   │   └── pages/
│   │   ├── infrastructure/       # Adaptadores (HTTP, Storage)
│   │   ├── shared/               # Código compartido
│   │   └── App.jsx
│   ├── .github/
│   │   ├── workflows/
│   │   │   ├── ci.yml
│   │   │   ├── codeql.yml
│   │   │   └── dependabot.yml
│   │   ├── ISSUE_TEMPLATE/
│   │   └── pull_request_template.md
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── README.md
│
├── backend/                       # API REST Node.js (Próximamente)
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── documentacion/                 # Documentación del proyecto
│   ├── metodologia/
│   ├── requisitos/
│   ├── diseno/
│   ├── pruebas/
│   └── manuales/
│
├── database/                      # Scripts de BD
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── README.md                      # Este archivo
├── CONTRIBUTING.md               # Guía de contribución
├── CODE_OF_CONDUCT.md           # Código de conducta
├── SECURITY.md                   # Política de seguridad
└── .gitignore

```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v20.x o superior
- npm v10.x o superior
- Git v2.39+
- Editor de código (VSCode recomendado)

### Pasos de Instalación

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/bitnova-unicauca/vigia-cauca.git
cd vigia-cauca
```

#### 2. Instalar Dependencias (Frontend)
```bash
cd frontend
npm install
```

#### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar variables según tu ambiente
nano .env.local
```

**Variables necesarias:**
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Vigía Cauca
VITE_APP_VERSION=1.0.0
```

#### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

#### 5. Ejecutar Tests
```bash
npm test                  # Ejecutar tests una vez
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Ver cobertura
```

#### 6. Validar Código
```bash
npm run lint             # Validar con ESLint
npm run format           # Formatear con Prettier
npm run format:check     # Verificar formato sin cambiar
```

#### 7. Build para Producción
```bash
npm run build            # Crear bundle optimizado
npm run preview          # Previsualizar build
```

---

## 📚 Documentación

### Directorios Clave

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guía completa para contribuidores
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Estándares de conducta
- **[SECURITY.md](./SECURITY.md)** - Política de seguridad e informar vulnerabilidades
- **[documentacion/](./documentacion/)** - Documentación técnica del proyecto

### Documentación por Fase

#### Fase de Inicio ✅
- Idea de Proyecto aprobada
- Propuesta de Desarrollo v1.0
- Historias de Usuario validadas con cliente
- Backlog preliminar en Trello

#### Fase de Elaboración 🔄
- Arquitectura C4 (Contexto, Contenedores, Componentes)
- Prototipos de interfaces en Figma
- Modelo de datos (DER)
- Plan de pruebas

#### Fase de Construcción ⏳
- Módulos funcionales HE-01 a HE-05
- Código versionado con calidad garantizada
- Pruebas de integración

#### Fase de Transición ⏳
- Manual de instalación
- Guías de usuario
- Presentación final

---

## 🔗 Enlaces de Interés

- 🎯 [Tablero Trello](https://trello.com/invite/698ba5f736c0643029534884)
- 📊 [GitHub Projects](#)
- 🎨 [Prototipos Figma](#)
- 📁 [Documentación en Google Drive](#)
- 📈 [Diagrama de Gantt](#)

---

## 💬 Preguntas Frecuentes

### ¿Cómo reporto un bug?
Ve a [Issues](https://github.com/bitnova-unicauca/vigia-cauca/issues) y crea uno nuevo con la etiqueta `bug`. Usa el template de bug report.

### ¿Cómo propongo una feature?
Crea un issue con la etiqueta `enhancement` y usa el template de feature request.

### ¿Cuál es el estándar de commits?
Usamos [Conventional Commits](https://www.conventionalcommits.org/es/). Ejemplo:
```
feat: agregar dashboard de indicadores
fix: corregir validación en formulario
docs: actualizar README
```

### ¿Cómo hago un Pull Request?
Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para la guía completa.

---

## 📊 Estadísticas del Proyecto

- **Lenguajes:** JavaScript (React), SQL
- **Arquitectura:** Hexagonal + Atomic Design
- **Cobertura de Tests:** Objetivo 80%+
- **Último Release:** v0.1.0 (En Desarrollo)

---

## 📞 Contacto

**Equipo BitNova** - Universidad del Cauca  
**Cliente:** Secretaría de Gobierno del Cauca  
**Año:** 2026

### Miembros del Equipo
- Ana Sofía Arango Yanza (Scrum Master)
- Cristhian Camilo Uñas Ocaña (Desarrollador)
- Juan Esteban Chavez Collazos (Desarrollador)
- Juan Diego Pérez Martínez (Desarrollador)
- Juan Esteban Martínez Marín (Desarrollador)

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT**. Ver archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ por BitNova para la Gobernación del Cauca**

[![Universidad del Cauca](https://img.shields.io/badge/Universidad-del%20Cauca-orange?style=for-the-badge&logo=university)](https://www.unicauca.edu.co)
[![BitNova](https://img.shields.io/badge/Equipo-BitNova-blue?style=for-the-badge)](#)

[⬆ Volver al inicio](#-vigía-cauca---sistema-de-visualización-georreferenciada-de-incidentes-y-alertas)

</div>