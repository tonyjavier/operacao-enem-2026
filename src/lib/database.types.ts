export type PlanVersion = { id: string; version: string; starts_on: string; ends_on: string; source: string; published_at: string; is_active: boolean };
export type Resource = { id: string; plan_version_id: string; slug: string; name: string; url: string | null; purpose: string; resource_type: string; verification_status: 'confirmed' | 'estimated' | 'pending'; source: string; sort_order: number; created_at: string };
export type Lesson = { id: string; plan_version_id: string; lesson_number: number; title: string; subject: string; priority: 'A' | 'B' | 'C' | null; duration_seconds: number | null; duration_label: string | null; scheduled_date: string | null; video_url: string | null; playlist_url: string | null; playlist_index: number | null; availability: 'available' | 'private' | 'unavailable' | 'pending'; is_extra: boolean; verification_status: 'confirmed' | 'estimated' | 'pending'; source: string };
export type EssayVideo = { id: string; plan_version_id: string; video_number: number; title: string; duration_minutes: number | null; scheduled_date: string; practice_task: string; video_url: string; playlist_index: number; verification_status: 'confirmed' | 'estimated' | 'pending'; source: string };
export type ScheduleDay = { id: string; plan_version_id: string; study_date: string; weekday: string; phase: 'main_plan' | 'final_review' | 'between_exams' | 'exam'; day_type: string; focus_subject: string; objective: string; new_question_goal: number | null; question_range: string | null; source_payload: Record<string, unknown>; source: string };
export type DayTask = { id: string; schedule_day_id: string; position: number; kind: string; title: string; description: string; resource_id: string | null; lesson_id: string | null; essay_video_id: string | null; target_min: number | null; target_max: number | null; verification_status: 'confirmed' | 'estimated' | 'pending' };
export type UserTaskProgress = { user_id: string; day_task_id: string; is_completed: boolean; completed_at: string | null; updated_at: string };
export type UserLessonProgress = { user_id: string; lesson_id: string; status: 'not_started' | 'in_progress' | 'completed'; watched_seconds: number; resume_position_seconds: number | null; notes: string | null; started_at: string | null; completed_at: string | null; updated_at: string };
export type UserEssayVideoProgress = { user_id: string; essay_video_id: string; status: 'not_started' | 'in_progress' | 'completed'; completed_at: string | null; updated_at: string };
export type UserQuestionSession = { id: string; user_id: string; schedule_day_id: string; day_task_id: string | null; operation_id: string; new_count: number; redo_count: number; correction_done: boolean; created_at: string };
export type UserErrorNote = { id: string; user_id: string; schedule_day_id: string | null; lesson_id: string | null; subject: string; topic: string; prompt: string | null; error_type: string; correction_note: string; review_due_on: string | null; reviewed_at: string | null; photo_path: string | null; created_at: string; updated_at: string };
export type UserEssayEntry = { id: string; user_id: string; schedule_day_id: string | null; completed_on: string; theme: string | null; is_timed: boolean; duration_minutes: number | null; thesis: string | null; difficulties: string | null; argumentation: string | null; cohesion: string | null; language: string | null; intervention: string | null; rewrite_notes: string | null; competency_scores: Record<string, number>; is_complete: boolean; created_at: string; updated_at: string };

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };
export type Database = {
  public: {
    Tables: {
      plan_versions: Table<PlanVersion>;
      resources: Table<Resource>;
      lessons: Table<Lesson>;
      essay_videos: Table<EssayVideo>;
      schedule_days: Table<ScheduleDay>;
      day_tasks: Table<DayTask>;
      profiles: Table<{ user_id: string; display_name: string | null; created_at: string; updated_at: string }>;
      user_lesson_progress: Table<UserLessonProgress>;
      user_essay_video_progress: Table<UserEssayVideoProgress>;
      user_task_progress: Table<UserTaskProgress>;
      user_question_sessions: Table<UserQuestionSession>;
      user_error_notes: Table<UserErrorNote>;
      user_essay_entries: Table<UserEssayEntry>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
