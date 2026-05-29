// Enums
export type UserRole = 'ADMIN' | 'STUDENT';
export type ReportStatus = 'PENDING' | 'APPROVED_FULL' | 'APPROVED_PARTIAL' | 'REJECTED';

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// User / Profile
export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  second_lastname: string | null;
  full_name: string;
  document_number: string;
  phone_number: string | null;
  birthdate: string | null;
  country_id: number | null;
  role: UserRole;
  course_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface UserUpdate {
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  second_lastname?: string | null;
  email?: string | null;
  phone_number?: string | null;
  birthdate?: string | null;
  country_id?: number | null;
}
export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}
export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  document_number: string;
  role: UserRole;
  middle_name?: string | null;
  second_lastname?: string | null;
  phone_number?: string | null;
  birthdate?: string | null;
  country_id?: number | null;
  course_id?: number | null;
}
export interface UserListResponse {
  items: UserResponse[];
  total: number;
  page: number;
  page_size: number;
}
export interface BulkUploadResult {
  created: number;
  skipped: number;
  errors: string[];
}
export interface StudentDebtInfo {
  id: number;
  email: string;
  full_name: string;
  document_number: string;
  course_id: number | null;
  required_hours: number;
  approved_hours: number;
  missing_hours: number;
}
export interface StudentDebtListResponse {
  items: StudentDebtInfo[];
  total: number;
  page: number;
  page_size: number;
}

// Reports
export interface ReportStudentInfo {
  id: number;
  full_name: string;
  email: string;
  document_number: string;
}
export interface ReportCategoryInfo {
  id: number;
  name: string;
}
export interface ReportResponse {
  id: number;
  student_id: number;
  category_id: number;
  hours_spent: number;
  description: string;
  status: ReportStatus;
  approved_hours: number | null;
  reviewer_notes: string | null;
  web_view_link: string | null;
  reviewer_id: number | null;
  created_at: string;
  updated_at: string;
  student?: ReportStudentInfo | null;
  category?: ReportCategoryInfo | null;
}
export interface ReportListResponse {
  items: ReportResponse[];
  total: number;
  page: number;
  page_size: number;
}
export interface EvidenceResponse {
  web_view_link: string;
  file_id: string;
}
export interface ReviewPayload {
  approved_hours: number;
  reviewer_notes?: string | null;
}

// Categories (service hours categories)
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}
export interface CategoryCreate {
  name: string;
  description?: string;
}
export interface CategoryUpdate {
  name?: string | null;
  description?: string | null;
}

// Countries
export interface CountryResponse {
  id: number;
  name: string;
  code: string;
  created_at: string;
}
export interface CountryCreate {
  name: string;
  code: string;
}
export interface CountryUpdate {
  name?: string | null;
  code?: string | null;
}

// Courses
export interface CourseResponse {
  id: number;
  name: string;
  duration: number;
  required_service_hours: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface CourseCreate {
  name: string;
  duration: number;
  price: number;
  required_service_hours?: number;
}
export interface CourseUpdate {
  name?: string | null;
  duration?: number | null;
  price?: number | null;
  required_service_hours?: number | null;
}

// Compass
export interface GoalSubcategoryResponse {
  id: number;
  name: string;
}
export interface GoalCategoryResponse {
  id: number;
  name: string;
  subcategories: GoalSubcategoryResponse[];
}
export interface GoalInTree {
  id: number;
  year: number;
  goal: string;
}
export interface SubcategoryWithGoals {
  id: number;
  name: string;
  goals: GoalInTree[];
}
export interface CategoryWithGoals {
  id: number;
  name: string;
  subcategories: SubcategoryWithGoals[];
}
export interface GoalsTreeResponse {
  start_year: number;
  years: number[];
  categories: CategoryWithGoals[];
}
export interface GoalResponse {
  id: number;
  subcategory_id: number;
  year: number;
  goal: string;
  created_at: string;
  updated_at: string;
}
export interface GoalCreate {
  subcategory_id: number;
  year: number;
  goal: string;
}
export interface GoalUpdate {
  goal: string;
}
export interface ProgressStats {
  total_possible_slots: number;
  filled_slots: number;
  completion_rate: number;
  years_with_goals: number[];
}
export interface CompassProfileWithProgressResponse {
  id: number;
  student_name: string;
  start_year: number;
  vision: string | null;
  created_at: string;
  updated_at: string;
  progress: ProgressStats;
}
export interface CompassProfileCreate {
  start_year: number;
  vision?: string | null;
}
export interface CompassProfileUpdate {
  start_year?: number | null;
  vision?: string | null;
}

// Dashboard
export interface CourseProgress {
  course_id: number;
  course_name: string;
  required_service_hours: number;
  hours_approved: number;
  hours_remaining: number;
  progress_percentage: number;
}
export interface CategoryStat {
  id: number;
  name: string;
  total_reports: number;
  total_hours_approved: number;
}
export interface CourseStat {
  id: number;
  name: string;
  total_students: number;
}
export interface StudentReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_hours_submitted: number;
  total_hours_approved: number;
  approval_rate: number;
}
export interface StudentDashboardStats {
  reports: StudentReportStats;
  course_progress: CourseProgress | null;
  top_categories: CategoryStat[];
}
export interface UserStats {
  total_students: number;
  total_admins: number;
}
export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_hours_submitted: number;
  total_hours_approved: number;
}
export interface AdminDashboardStats {
  users: UserStats;
  reports: ReportStats;
  top_categories: CategoryStat[];
  top_courses: CourseStat[];
}
