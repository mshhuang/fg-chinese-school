export interface User {
  user_id: string;
  email: string | null;
  password_hash: string | null;
  first_name: string;
  last_name: string;
  phone1: string | null;
  phone2: string | null;
  school: string | null;
  grade: string | null;
  dob: string | null;
  user_name: string | null;
  address: string | null;
  emergency_contact: string | null;
  medical_condition: string | null;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Left';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'user_id' | 'created_at'> & { user_id?: string; created_at?: string };
        Update: Partial<User>;
      },
      roles: {
        Row: { role_id: number; role_name: string };
        Insert: { role_name: string };
        Update: Partial<{ role_name: string }>;
      },
      user_roles: {
        Row: { user_id: string; role_id: number };
        Insert: { user_id: string; role_id: number };
        Update: { user_id?: string; role_id?: number };
      },
      parent_child: {
        Row: { parent_id: string; child_id: string; relationship_type: string | null };
        Insert: { parent_id: string; child_id: string; relationship_type?: string | null };
        Update: { parent_id?: string; child_id?: string; relationship_type?: string | null };
      },
      programs: {
        Row: { program_id: string; program_name: string; school_year_or_term: string | null; start_date: string | null; end_date: string | null; status: string | null };
        Insert: { program_id?: string; program_name: string; school_year_or_term?: string | null; start_date?: string | null; end_date?: string | null; status?: string | null };
        Update: Partial<{ program_id: string; program_name: string; school_year_or_term: string | null; start_date: string | null; end_date: string | null; status: string | null }>;
      },
      rooms: {
        Row: { room_id: string; room_number: string; building: string | null };
        Insert: { room_number: string; building?: string | null };
        Update: Partial<{ room_number: string; building: string | null }>;
      },
      classes: {
        Row: {
          class_id: string;
          class_name: string;
          primary_teacher_id: string | null;
          co_teacher_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'class_id'>;
        Update: Partial<Database['public']['Tables']['classes']['Row']>;
      },
      subjects: {
        Row: { subject_id: number; subject_name: string };
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'subject_id'>;
        Update: Partial<Database['public']['Tables']['subjects']['Row']>;
      },
      class_schedule: {
        Row: {
          schedule_id: string;
          class_id: string | null;
          room_id: string | null;
          subject_id: number | null;
          teacher_id: string | null;
          day_of_week: string | null;
          period: string | null;
        };
        Insert: Omit<Database['public']['Tables']['class_schedule']['Row'], 'schedule_id'>;
        Update: Partial<Database['public']['Tables']['class_schedule']['Row']>;
      },
      schedule_template: {
        Row: {
          template_id: string;
          cycle_day: string | null;
          period_id: string | null;
          class_id: string | null;
          teacher_subject_id: string | null;
          room_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['schedule_template']['Row'], 'template_id'>;
        Update: Partial<Database['public']['Tables']['schedule_template']['Row']>;
      },
      schedule_overrides: {
        Row: {
          override_id: number;
          class_id: string | null;
          room_id: string | null;
          period_id: string | null;
          teacher_subject_id: string | null;
          is_active: boolean;
          effective_date: string | null;
          reason: string | null;
        };
        Insert: Omit<Database['public']['Tables']['schedule_overrides']['Row'], 'override_id'>;
        Update: Partial<Database['public']['Tables']['schedule_overrides']['Row']>;
      },
      teacher_subject: {
        Row: {
          teacher_subject_id: string;
          teacher_id: string;
          subject_id: number;
        };
        Insert: { teacher_subject_id?: string; teacher_id: string; subject_id: number };
        Update: Partial<{ teacher_subject_id: string; teacher_id: string; subject_id: number }>;
      },
      periods: {
        Row: { period_id: string; period_name: string; time: string };
        Insert: { period_name: string; time: string };
        Update: Partial<{ period_name: string; time: string }>;
      },
      enrollments: {
        Row: { enrollment_id: string; student_id: string | null; class_id: string | null; program_id: string | null; notes: string | null; status: string | null; enrollment_date: string | null; drop_date: string | null; };
        Insert: { student_id?: string | null; class_id?: string | null; program_id?: string | null; notes?: string | null; status?: string | null; enrollment_date?: string | null; drop_date?: string | null; };
        Update: Partial<{ student_id: string | null; class_id: string | null; program_id: string | null; notes: string | null; status: string | null; enrollment_date: string | null; drop_date: string | null; }>;
      },
      attendance: {
        Row: {
          attendance_id: number;
          class_id: string | null;
          student_id: string | null;
          date: string;
          marked_by: string | null;
          is_present: boolean | null;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'attendance_id'>;
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      },
      lesson_plans: {
        Row: {
          lesson_plan_id: number;
          title: string;
          content_rich_text: string | null;
          class_id: string | null;
          teacher_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['lesson_plans']['Row'], 'lesson_plan_id'>;
        Update: Partial<Database['public']['Tables']['lesson_plans']['Row']>;
      },
      newsletters: {
        Row: {
          newsletter_id: number;
          title: string;
          content: string | null;
          class_id: string | null;
          author_id: string | null;
          created_at?: string;
          is_published?: boolean;
          status?: string;
        };
        Insert: Omit<Database['public']['Tables']['newsletters']['Row'], 'newsletter_id'>;
        Update: Partial<Database['public']['Tables']['newsletters']['Row']>;
      },
      announcements: {
        Row: {
          announcement_id: number;
          title: string;
          content: string | null;
          created_by: string | null;
          target_role_id: number | null;
          target_program_id: number | null;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'announcement_id'>;
        Update: Partial<Database['public']['Tables']['announcements']['Row']>;
      },
      assignments: {
        Row: {
          assignment_id: number;
          class_id: number | null;
          teacher_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          type: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'assignment_id'>;
        Update: Partial<Database['public']['Tables']['assignments']['Row']>;
      },
      assignment_students: {
        Row: {
          assignment_student_id: number;
          assignment_id: number | null;
          student_id: string | null;
          status: string | null;
          grade: string | null;
          feedback: string | null;
        };
        Insert: Omit<Database['public']['Tables']['assignment_students']['Row'], 'assignment_student_id'>;
        Update: Partial<Database['public']['Tables']['assignment_students']['Row']>;
      },
      internal_messages: {
        Row: {
          message_id: number;
          subject: string | null;
          body: string | null;
          sender_id: string | null;
          recipient_id: string | null;
          read_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['internal_messages']['Row'], 'message_id'>;
        Update: Partial<Database['public']['Tables']['internal_messages']['Row']>;
      }
    }
  }
}
