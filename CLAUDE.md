# CLAUDE.md

App móvil **Compass & HS** de Funval Internacional (Expo SDK 54 · React Native 0.81 · React 19 · Expo Router 6 · NativeWind). La usan estudiantes para dos módulos:

- **Brújula de Vida**: plan de vida a 5 años. Visión personal más metas por *categoría (5 áreas) × subcategoría (rol) × año*.
- **Horas de Servicio (HS)**: reportes de horas con evidencia PDF que revisa el staff.

Todo el backend es **SIGEF** (Laravel) en `https://sigef.funvaltech.cloud`. La app no tiene backend propio.

## Reglas

- **No leer `.env.local`**: contiene secretos OAuth. Las variables que expone son `EXPO_OAUTH_URI`, `EXPO_OAUTH_CLIENT_ID` y `EXPO_OAUTH_REDIRECT_URI`. Fluyen por `app.config.js` → `extra.oauth` → `constants/oidc.ts`.
- La UI va en español, tuteando ("tú"). Los comentarios de código van en inglés.
- `android/` e `ios/` están en `.gitignore` (salida de `expo prebuild`). La configuración nativa se cambia en `app.json` o con plugins, nunca editando esas carpetas.

## Comandos

```bash
npm run android   # expo run:android (dev build nativo; no usar Expo Go, hace falta el scheme OAuth)
npm start         # Metro
npm run lint      # eslint + prettier --check
npm run format    # eslint --fix + prettier --write
```

No hay tests. `package-lock.json` es el lockfile versionado. Puede haber un `pnpm-lock.yaml` y un `.npmrc` (`node-linker=hoisted`) locales sin versionar.

## Arquitectura

- **Rutas** (`app/`): `index.tsx` (login → `components/ScreenLogin.tsx`) y `oauth/callback.tsx` (pantalla puente del redirect). Las pestañas en `(tabs)/` son `home`, `servicio`, `brujula` y `perfil`. Las pantallas stack son `reportar-hs` (`?id=` para editar), `historial-hs`, `editar-metas` (`?categoryId=`) y `configurar-plan`.
- **Guard**: `NavigationGuard` en `app/_layout.tsx` redirige según `useAuth().user`. Las únicas pantallas públicas son `index` y `oauth`.
- **Auth** (OIDC + PKCE con `expo-auth-session`): `ScreenLogin` hace `await promptAsync()` directamente, sin el efecto `response`, porque en Android Expo Router navega a `oauth/callback` y desmonta la pantalla. Los tokens se guardan en SecureStore (`services/sigefAuth.ts`). El perfil sale de `GET /api/students/me` y `AuthContext` lo mapea a `AuthUser`.
- **HTTP**: `services/sigefApi.ts` es una instancia axios con Bearer. Ante un 401 hace un único refresh compartido (los refresh tokens son de un solo uso) y, si falla, llama al `onUnauthorized` registrado por `AuthContext`, que hace logout.
- **Hooks de datos**: `useReports`, `useCompass` y `useCategories` usan `autoload: false` y se recargan con `useFocusEffect(refetch)` en cada pantalla. `useGoalAutosave` guarda cada meta con debounce de 1,5 s (vacía → DELETE, nueva → POST, cambiada → PATCH) y encadena los guardados por campo para evitar un 409 `duplicate_goal`. Hay que llamar a `flushAll()` antes de cambiar de año o área, o al salir.
- **Utilidades** (`lib/`): `unwrapData` acepta respuestas con o sin `{data}`. `apiError` traduce los códigos de dominio de SIGEF (`report_not_editable`, `plan_already_exists`, `export_not_allowed`…) a mensajes en español. `downloadPdf` descarga los PDF autenticados a caché y los abre con un Intent VIEW en Android o con el share sheet. `clearCachedPdfs()` se ejecuta en cada arranque en frío.

## Fuente de verdad: SIGEF web

El proyecto web está en `D:\WORKSPACES\FUNVAL\sigef` (Laravel + Inertia/React). Antes de tocar reglas o textos, compara con:

- Portal del estudiante: `resources/js/pages/portal/` y `resources/js/components/{horas-servicio,brujula-vida}/`.
- Reglas de la API Bearer que consume la app: `routes/oidc.php` y `app/Http/Requests/{HorasServicio,BrujulaVida}/`.
- Referencia OIDC: `docs/sigef-oidc-api-reference.md`.

La app se alineó con la web en octubre de 2026. Las reglas de abajo reflejan ese estado; si la web cambia, revísalas.

## Reglas de dominio (no obvias)

- **Horas de servicio enteras.** `hours_spent` es `integer|min:1` en la API (commit SIGEF `0ef33ea`) y la revisión aprueba horas enteras. Las horas se muestran redondeadas.
- **La descripción del reporte es opcional** (`nullable`, máx. 2000). El campo se llama "Tipo de actividad" (categoría) y "Descripción (opcional)", como en la web.
- **La evidencia es un PDF o 3 fotos, nunca ambos.** Puede ser `evidence` (un PDF de máx. 10 MB) o `evidence_before`, `evidence_during` y `evidence_after` (JPG, PNG o WEBP de máx. 10 MB cada una; el servidor arma el PDF). Si van fotos tienen que ser las tres. Es obligatoria al crear y opcional al editar. Si una foto no se puede decodificar, el servidor responde 422 con `errors.evidence`. La app toma o elige cada foto con `expo-image-picker` y la reencoda a JPEG ≤ 1600 px con `expo-image-manipulator` (`lib/evidencePhotos.ts`), lo que también convierte HEIC. El payload es `ReportEvidence` en `hooks/useReports.ts`.
- Un **reporte HS es editable** solo si nunca fue revisado (`reviewer_id == null && reviewed_at == null`), aunque haya vuelto a "Pendiente". Estados: 1 Pendiente, 2 Aprobado, 3 Aprobado parcial, 4 Rechazado. Un aprobado parcial se muestra como **aprobadas / reportadas** ("3 / 5 h", como en la web). El comentario del revisor se oculta mientras el reporte está Pendiente (reapertura). Las reglas están en `lib/serviceReports.ts` (`formatHours`, `formatReportHours`, `visibleReviewNotes`).
- El progreso HS (`GET /api/students/service-reports` → `progress`) trae `required_hours`, `approved_hours`, `rejected_hours`, `remaining_hours` y `course_name`.
- `required_hours: null` significa que el curso no tiene meta configurada (`courses.required_service_hours` es null; se carga en SIGEF desde el requisito del curso) y no es lo mismo que `0`. A pedido del equipo, mientras se cargan las metas de los cursos, Inicio, Servicio e Historial muestran "x / 0 h" con el anillo en 0 % (y en Servicio e Historial la línea "Tu curso aún no tiene meta de horas").
- **Cambio de contraseña**: `PUT /api/students/me/password` con `current_password`, `password` y `password_confirmation`. Tiene throttle propio y revoca los demás tokens del estudiante, pero el token actual sigue vivo. En la app está en `app/cambiar-contrasena.tsx` y `services/studentAccount.ts`.
- **Plan Brújula**: estados 1 Pendiente, 2 Aprobado, 3 Rechazado (con `review_notes`). Sin visión no se pueden cargar metas. `start_year` queda bloqueado cuando existe al menos una meta (el backend responde 422). Solo se puede exportar el PDF con el plan aprobado. El progreso cuenta solo los primeros 5 años (`PLAN_WINDOW_YEARS`); `total_possible_slots` vale 55 por defecto.
- Catálogo actual: 5 áreas con 11 subroles, es decir 55 metas en 5 años. Espiritual (Proceso de Conversión, Ser un Discípulo), Familiar (Esposo / Novio, Padre, Hijo), Intelectual (Educación Formal, Autoeducación), Laboral (Empleado, Emprendimiento) y Físico (Ejercicios, Hobbies).
- El editor de metas de la web abre en `start_year` y navega con "Siguiente: {año}" y luego "Continuar con {siguiente área}". Los tooltips son popovers "?": uno por área ("Mi rol {área}", `ROLE_INTROS`) y uno por subrol (`SUBCATEGORY_GUIDES`). La guía de visión incluye la sección "Experiencia". Colores web: Espiritual violeta con icono `Church`, Familiar ámbar, Intelectual esmeralda, Laboral azul y Físico **naranja**.
- El estilo de cada área (icono y colores, `constants/areas.ts`) se asocia **por nombre normalizado**, nunca por id. Los textos de ayuda (`goalGuides.ts`, `visionGuide.ts`) están copiados del portal web de SIGEF porque la API no los sirve.

## Sistema de diseño

- **Tokens de color** en `tailwind.config.js` (`navy` #0B2545, `brand` #2A7DE1, `celeste`, `paper`, `ink`, `muted`) y en `constants/theme.ts` (`COLORS`, que además trae `silver`, `faint`, `line` y `onNavyMuted`) para props que no aceptan `className` (iconos, SVG, estilos inline). Solo hay tokens que se usan: si agregas uno, que sea porque lo necesitas. No uses hex sueltos ni los antiguos `#002d4e`/`#08203e`.
- **Escala tipográfica semántica**: usa solo estos tamaños, nunca `text-xs`…`text-5xl`.
  - `text-display` (32): números protagonistas.
  - `text-title` (24): título de pantalla.
  - `text-heading` (18): títulos de tarjeta y barras de cabecera.
  - `text-body` (15): texto, inputs y botones.
  - `text-label` (13): etiquetas de campo y líneas secundarias.
  - `text-caption` (12): metadatos, ayudas y contadores.
  - `text-overline` (11): rótulos de sección en mayúsculas y píldoras.
- Elevación única `CARD_SHADOW` y fondo de modales `OVERLAY` (marino, no negro), ambos en `constants/theme.ts`. Fondo de pantalla `bg-paper`.
- Componentes base en `components/ui/`:
  - `ScreenHeader`: barra con safe area, volver o cerrar, color de fondo opcional.
  - `ProgressRing`.
  - `StatTile`.
  - `SectionLabel`.
- Otros componentes compartidos:
  - `HoursSummaryCard`: hero marino de horas con tres mosaicos, en Servicio e Historial.
  - `LoadingScreen`.
  - `brand/Emblem`.
- Los iconos son de `lucide-react-native`. Botones primarios: `h-14 rounded-2xl`, en `bg-navy` (formularios) o `bg-brand` (acciones de Horas).
- **Marca**: el emblema 5 "Halo orbital" (paleta plata) es el isotipo de Funval (`assets/funval-iso.png`, recorte del original, **nunca se recolorea**) dentro de un halo punteado, con una estrella de la rosa de los vientos que orbita en los estados de carga. Lo implementa `components/brand/Emblem.tsx`. `icon.png`, `adaptive-icon.png` (zona segura), `adaptive-icon-mono.png`, `splash.png` y `favicon.png` se generaron con la misma geometría sobre marino `#0B2545`. Si cambian `app.json` o los assets nativos, hay que correr `expo prebuild` y recompilar.
