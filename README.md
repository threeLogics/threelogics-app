# ThreeLogics - Sistema de Gestión de Almacenes para PYMEs

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Vercel Deployment](https://img.shields.io/badge/deploy-vercel-blue)
![Render Backend](https://img.shields.io/badge/backend-render-orange)

**ThreeLogics** es una plataforma web moderna y escalable diseñada para optimizar la gestión logística de pequeñas y medianas empresas. Su objetivo es digitalizar procesos de almacén, mejorar el control de stock, generar informes analíticos y facilitar la toma de decisiones mediante un sistema intuitivo, ágil y seguro.

![Vista del Dashboard de ThreeLogics](https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//dashboard.png)

## Tabla de Contenidos

- [Demo](#demo)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Guía de Uso](#guía-de-uso)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Estrategia de Desarrollo](#estrategia-de-desarrollo)
- [Controles de Calidad](#controles-de-calidad)
- [Documentación](#documentación)
- [Equipo de Desarrollo](#equipo-de-desarrollo)
- [Licencia](#licencia)

## Demo

[Acceder a la demo de ThreeLogics](https://threelogicsapp.vercel.app/webinars)

## Características Principales

- Gestión avanzada de productos, movimientos, pedidos y ubicaciones.
- Roles de usuario diferenciados (cliente y administrador).
- Visualización de stock en tiempo real y control de entradas/salidas.
- Dashboard con estadísticas, calendario y reportes PDF.
- Predicción de demanda basada en análisis de datos históricos.
- Seguridad reforzada (JWT, control de roles, cifrado).
- UI responsiva, accesible y desarrollada con Tailwind.

## Tecnologías Utilizadas

### Frontend

- **React + Vite**
- **Tailwind CSS**
- **Recharts, ShadCN UI, FullCalendar**

### Backend

- **Node.js + Express**
- **PDFKit, Supabase JS SDK**

### Base de Datos

- **Supabase (PostgreSQL) + Supabase Auth + Storage**

### Infraestructura

- **Frontend desplegado en Vercel**
- **Backend en Render**
- **Monitorización con Grafana y Google Analytics**
- **CI/CD con GitHub Actions**

## Arquitectura del Proyecto

Aplicación dividida en tres capas:

- **Frontend:** Interfaz gráfica para gestión de almacenes.
- **Backend:** API REST para lógica de negocio.
- **Base de Datos:** Gestión y almacenamiento de datos con Supabase.

![Arquitectura de ThreeLogics](https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/servicios//arquitectura.png)

**Extras**:

- Control de versiones con GitHub.
- Automatización con GitHub Actions.
- Prototipado en Figma.

## Instalación y Configuración

```bash
# Clona el repositorio
git clone https://github.com/threeLogics/threelogics-app.git

# Entra al frontend
cd frontend
npm install
npm run dev

# Entra al backend
cd ../backend
npm install
npm run dev
```

**Variables de entorno necesarias** (crear `.env` en cada carpeta):

- Para el **frontend**:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- Para el **backend**:

```env
PORT=3000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...
```

## Guía de Uso

El sistema permite:

- Añadir y editar productos, ubicaciones, pedidos y movimientos.
- Visualizar estadísticas globales (admin) o por usuario (cliente).
- Descargar reportes en PDF.
- Filtrar, ordenar y paginar información.
- Registrar y controlar stock según tipos de movimiento.

## Estructura del Repositorio

```
/frontend        → Aplicación React + Vite
/backend         → Servidor Node.js + Express
/documentacion   → Manuales técnicos y de usuario
/public          → Recursos estáticos
```

## Estrategia de Desarrollo

- **Metodología ágil (Scrum)** con sprints semanales.
- **Trello** y **Notion** para gestión de tareas y documentación interna.
- **Revisiones de código** por Pull Requests en GitHub.

## Controles de Calidad

- **Pruebas unitarias** con Jest.
- **Pruebas de integración** con Cypress.
- **Pruebas UX/UI** con Figma + encuestas.
- **CI/CD** con GitHub Actions.
- **Pruebas de seguridad** con OWASP ZAP.
- **Pruebas de rendimiento** con Apache JMeter.

## Documentación

- [Manual del Desarrollador](./documentacion/ManualDesarrollador-ThreeLogics.pdf)
- [Manual de Usuario](./documentacion/ManualUsuario-ThreeLogics.pdf)
- Guía de Administración y Backup
- FAQs

## Equipo de Desarrollo

- **Iker Domínguez** - Fullstack & QA
- **Adrián Vaquero** - Backend & Seguridad
- **Daniel Ramiro** - Frontend & UI/UX

## Licencia

Este proyecto está licenciado bajo la **MIT License**.
