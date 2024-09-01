= SPEC-001: Backend para Gestión de Finanzas Personales con Bot de Telegram
:sectnums:
:toc:


== Background

El objetivo de este proyecto es desarrollar un backend utilizando Node.js, Express y MongoDB que permita gestionar finanzas personales de una manera sencilla e intuitiva. La interacción con el sistema se realizará a través de un bot de Telegram, que servirá como interfaz principal para el usuario. Este sistema debe permitir el control de gastos generales, suscripciones, metas de ahorro, análisis de gastos y generación de gráficos basados en períodos de tiempo específicos.

== Requirements

*Must Have:*
- Registrar y gestionar gastos generales.
- Registrar y gestionar suscripciones recurrentes.
- Registrar y gestionar metas de ahorro.
- Análisis de gastos y ahorro basado en un periodo de días definido por el usuario.
- Clasificación de gastos en categorías.
- Análisis de gastos basado en categorías y ajuste de metas de ahorro.
- Identificación de gastos recurrentes con posibilidad de marcar frecuencia (mensual, diario, personalizado).
- Historial de transacciones detallado para revisiones y auditorías personales.
- Integración con un bot de Telegram que permita:
  - Acceso seguro mediante usuario y contraseña.
  - Interacción a través de botones y flujos guiados (ej. tipo de gasto, monto, fecha).
  - Listado de comandos para acceso a diferentes secciones (gastos, suscripciones, metas).
- Soporte multimoneda para la conversión y análisis de gastos en una moneda base.
- Presupuestos por categoría, con alertas cuando los límites están cerca.
- Capacidad de exportar datos en formatos CSV o Excel.

*Should Have:*
- Generación de gráficos de análisis de gastos y ahorro.
- Informes automáticos periódicos enviados a través del bot con resúmenes de gastos, metas y suscripciones.
- Alertas o notificaciones a través del bot para recordatorios de suscripciones o metas de ahorro.

*Could Have:*
- Funcionalidades adicionales de reporte y exportación de datos.
- Soporte para múltiples usuarios (con diferentes credenciales).
- Integración con APIs de finanzas de terceros.

== Method

=== Etapa 1: Configuración del Entorno y Estructura del Proyecto

1. **Configuración del entorno de desarrollo**:
   - Instalar Node.js y configurar el proyecto inicial utilizando `npm init`.
   - Instalar las dependencias básicas: `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `cors`, `body-parser`, `node-telegram-bot-api`, `moment`, `lodash`.
   - Configurar un archivo `.env` para manejar las variables de entorno (puerto, credenciales de MongoDB, claves JWT, etc.).
   - Configurar la estructura básica del proyecto: `src`, `controllers`, `models`, `routes`, `config`, `utils`.

2. **Configuración de Express**:
   - Crear un servidor básico con Express que sirva como punto de partida.
   - Configurar el middleware necesario: `cors`, `body-parser`, `morgan` (opcional para logging), y `express.json()`.
   - Configurar las rutas base (`/api/gastos`, `/api/suscripciones`, `/api/metas`, `/api/auth`).

3. **Configuración de MongoDB**:
   - Conectar a una base de datos MongoDB utilizando Mongoose.
   - Crear los modelos iniciales para `User`, `Gasto`, `Suscripcion`, `Meta`, y `Categoria`.

=== Etapa 2: Implementación de la Autenticación y Gestión de Usuarios

1. **Autenticación con JWT**:
   - Implementar el registro de usuarios con `bcryptjs` para el hashing de contraseñas.
   - Implementar el login de usuarios generando tokens JWT para la autenticación.
   - Proteger las rutas sensibles utilizando middleware que verifique el JWT.

2. **Gestión de Usuarios**:
   - Crear endpoints para obtener y actualizar los datos del perfil del usuario.
   - Implementar roles y permisos básicos si se considera necesario (por ejemplo, un rol "admin" para funcionalidades avanzadas).

=== Etapa 3: Implementación de las Funcionalidades de Finanzas

1. **Gestión de Gastos**:
   - Implementar CRUD para los gastos.
   - Añadir la funcionalidad para marcar un gasto como recurrente y su frecuencia.
   - Añadir la funcionalidad de asignar un gasto a una categoría.

2. **Gestión de Suscripciones**:
   - Implementar CRUD para las suscripciones.
   - Añadir funcionalidad para programar notificaciones de suscripciones cercanas a través del bot de Telegram.

3. **Gestión de Metas de Ahorro**:
   - Implementar CRUD para las metas de ahorro.
   - Añadir la funcionalidad de ajustar metas basado en el análisis de categorías.

4. **Análisis y Reportes**:
   - Implementar endpoints para generar análisis basado en días y categorías.
   - Implementar la generación de gráficos y resúmenes que se puedan enviar por el bot de Telegram.
   - Crear una funcionalidad para exportar los datos en CSV o Excel.

=== Etapa 4: Integración con Telegram

1. **Configuración del Bot de Telegram**:
   - Configurar un bot básico usando `node-telegram-bot-api` o `Telegraf.js`.
   - Implementar autenticación básica con usuario y contraseña para el acceso al bot.
   - Configurar comandos y botones que guíen al usuario a través del flujo de gestión de gastos, suscripciones y metas.

2. **Flujos de Interacción**:
   - Crear flujos de interacción para el registro de gastos (selección de categoría, ingreso de monto, fecha, etc.).
   - Implementar flujos para revisar metas de ahorro y suscripciones.
   - Configurar la recepción de notificaciones automáticas y su interacción a través del bot.

=== Etapa 5: Pruebas, Despliegue y Mantenimiento

1. **Pruebas Unitarias y de Integración**:
   - Implementar pruebas unitarias para las funciones críticas del backend.
   - Realizar pruebas de integración para verificar la correcta interacción entre los componentes del sistema.

2. **Despliegue**:
   - Contenerizar la aplicación usando Docker (opcional).
   - Configurar un entorno de producción, idealmente utilizando un gestor de procesos como PM2.
   - Desplegar la aplicación en un servidor o plataforma en la nube (Heroku, AWS, etc.).

3. **Mantenimiento**:
   - Implementar un sistema de logging con `Winston` para monitoreo en producción.
   - Configurar backups automáticos de la base de datos.
   - Monitorear el rendimiento y optimizar consultas en MongoDB según sea necesario.

== Milestones

1. **Milestone 1**: Configuración inicial del proyecto, estructura y autenticación básica.
2. **Milestone 2**: Implementación de la funcionalidad completa de gestión de finanzas (gastos, suscripciones, metas).
3. **Milestone 3**: Integración del bot de Telegram y pruebas de flujo de usuario.
4. **Milestone 4**: Pruebas completas y despliegue a producción.
5. **Milestone 5**: Evaluación post-producción, monitoreo y mantenimiento continuo.

== Gathering Results

1. **Evaluación de Requisitos**: Verificar que todas las funcionalidades solicitadas estén implementadas y funcionen como se esperaba.
2. **Rendimiento**: Medir el rendimiento de la aplicación en producción y ajustar según sea necesario.
3. **Feedback de Usuario**: Recopilar feedback de los usuarios a través del bot de Telegram y ajustar el sistema según necesidades emergentes.
4. **Mantenimiento y Soporte**: Planificar mejoras futuras y mantener un ciclo de actualizaciones regulares basado en el feedback y en los nuevos requerimientos.

