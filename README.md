# IasSprintBoard - Reto técnico angular 20

Este proyecto es una aplicación moderna desarrollada en Angular 20 orientada a la gestión simple de tareas de un equipo de desarrollo para un sprint

## Instalacion y ejecución

Requisitos previos:
  Node,js - versión 18.x
  Angular CLI - versión 20.x

Instalar dependencias
```bash
npm install
```

Servidor de desarrollo
  Para iniciar el servidor de desarrollo local, ejecuta:
```bash
npm start
```
  O bien
```bash
ng serve
```
Una vez iniciado, abre tu navegador en la ruta `htto://localhost:4200/`. La aplicación se recargará automáticamente al detectar cambios en el código

Construccion
Para compilar y optimizar la aplicación para producción
```bash
npm run build
```
Los archivos compilados se duardarán en el directorio `dist/` 

Pruebas Unitarias e Integración 
  El proyecto incluyee pruebas automatizadas para validar el comportamiento del store, servicios HTTP, formularios y componentes principales.

  Para ejecutar la suite de pruebas unitarias
```bash
npm test
```
O bien
```bash
npm test --watch=false
```

Decisiones Técnicas
1. Angular 20 Standalone
2. Arquitectura por capas estructurada
  - Domain
  - Data
  - State
  - Features
3. Manejo de estado reactivo con signals
4. Control flow moderno de angular
5. Formularios reactivos tipados y validación personalizada
6. Simulación de api con interceptor funcional
7. Estilos de calidad y animaciones
8. Accesibilidad
9. Carga perezona (lazy loading)
10. TypeScript estictor

Qué mejoraria con más tiempo
1. Drag and drop para Estados
2. Mayor cobertura de pruebas de integracion E2E
3. Optimizacion con SSR o Prerendering
4. Gestión de estadi más avanzado con NgRx Signals
