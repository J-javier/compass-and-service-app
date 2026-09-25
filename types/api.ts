// Auth (SIGEF OIDC)
export interface SigefTokens {
  accessToken: string;
  refreshToken: string | null;
  idToken?: string;
  expiresIn?: number;
}
export interface SigefStudentProfile {
  sub: string;
  name: string;
  email: string;
  photo_url: string | null;
  enrollment: {
    status: { id: number; name: string };
    term: string;
    course: { id: number; name: string };
  } | null;
}
export interface AuthUser {
  sub: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  photo_url: string | null;
}

// Horas de Servicio
export type ServiceReportStatusId = 1 | 2 | 3 | 4; // Pendiente / Aprobado completo / Aprobado parcial / Rechazado
export interface ServiceReportStatus {
  id: ServiceReportStatusId;
  name: string;
}
export interface ServiceReportResponse {
  id: number;
  category_id: number;
  hours_spent: number;
  description: string;
  status: ServiceReportStatus;
  approved_hours: number | null;
  review_notes: string | null;
  reviewed_at: string | null;
  // Not in the documented sample response — optional so the editability
  // rule still works if the backend omits it.
  reviewer_id?: number | null;
  has_evidence?: boolean;
  created_at: string;
}
export interface ServiceReportsProgress {
  required_hours: number | null;
  approved_hours: number | null;
  remaining_hours: number | null;
  course_name: string | null;
}
export interface ServiceReportListResponse {
  data: ServiceReportResponse[];
  progress: ServiceReportsProgress;
}
export interface ServiceCategoryResponse {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Brújula de Vida
export type CompassPlanStatusId = 1 | 2 | 3; // Pendiente / Aprobado / Rechazado
export interface CompassPlanStatus {
  id: CompassPlanStatusId;
  name: string;
}
export interface CompassPlanResponse {
  id: number;
  start_year: number;
  vision: string | null;
  status: CompassPlanStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}
export interface CompassPlanProgress {
  total_possible_slots: number;
  filled_slots: number;
  completion_rate: number;
  years_with_goals: number[];
}
export interface CompassPlanWithProgressResponse {
  plan?: CompassPlanResponse | null;
  progress: CompassPlanProgress;
}
export interface CompassPlanPayload {
  start_year?: number;
  vision?: string | null;
}
export interface CompassSubcategoryResponse {
  id: number;
  name: string;
  code: string;
}
export interface CompassCategoryResponse {
  id: number;
  name: string;
  subcategories: CompassSubcategoryResponse[];
}
export interface CompassGoalResponse {
  id: number;
  subcategory_id: number;
  year: number;
  goal: string;
  created_at: string;
}
export interface CompassGoalCreate {
  subcategory_id: number;
  year: number;
  goal: string;
}
