import sigefApi from '@/services/sigefApi';
import { ChangePasswordPayload } from '@/types/api';

/**
 * PUT /api/students/me/password → 204. SIGEF revokes the student's other
 * tokens but keeps the current one alive, so the app session continues.
 * 422 carries per-field messages in `errors` (current_password, password).
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await sigefApi.put('/api/students/me/password', payload);
}
