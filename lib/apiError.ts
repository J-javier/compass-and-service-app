import { isAxiosError } from 'axios';

/** SIGEF domain error codes → user-facing Spanish messages. */
const DOMAIN_MESSAGES: Record<string, string> = {
  invalid_token: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  insufficient_scope: 'No tienes permisos para realizar esta acción.',
  report_not_editable: 'Este reporte ya fue revisado y no se puede editar.',
  plan_already_exists: 'Ya tienes un plan de Brújula de Vida creado.',
  duplicate_goal: 'Ya existe una meta para esa subcategoría y año.',
  validation_failed: 'Los datos enviados no son válidos.',
  export_not_allowed: 'Solo puedes exportar tu Brújula cuando el plan esté aprobado.',
  not_found: 'No se encontró el recurso solicitado.',
};

/**
 * Normalizes both SIGEF error formats into a single readable message:
 *   { error, error_description }   — domain errors (401/403/404/409/422)
 *   { message, errors: {campo: []} } — Laravel form validation / plain 404
 */
export function getApiErrorMessage(e: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (!isAxiosError(e)) {
    return e instanceof Error && e.message ? e.message : fallback;
  }
  if (!e.response) return 'No se pudo conectar con el servidor. Revisa tu conexión.';

  const data: any = e.response.data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') {
      /* validation_failed carries the useful detail in error_description */
      if (data.error !== 'validation_failed' && DOMAIN_MESSAGES[data.error]) {
        return DOMAIN_MESSAGES[data.error];
      }
      if (typeof data.error_description === 'string' && data.error_description) {
        return data.error_description;
      }
      return DOMAIN_MESSAGES[data.error] ?? fallback;
    }
    if (data.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors as Record<string, string[]>)[0];
      if (Array.isArray(first) && first[0]) return first[0];
    }
    if (typeof data.message === 'string' && data.message) return data.message;
  }
  if (e.response.status === 429) return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
  return fallback;
}

/** Domain error code (`error` field) of a SIGEF response, if any. */
export function getApiErrorCode(e: unknown): string | null {
  if (!isAxiosError(e)) return null;
  const code = (e.response?.data as any)?.error;
  return typeof code === 'string' ? code : null;
}

/**
 * First message per field of a Laravel 422 (`{ errors: { campo: [...] } }`),
 * for showing validation errors next to each input instead of an Alert.
 */
export function getApiFieldErrors(e: unknown): Record<string, string> {
  if (!isAxiosError(e)) return {};
  const errors = (e.response?.data as any)?.errors;
  if (!errors || typeof errors !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') out[field] = messages[0];
  }
  return out;
}
