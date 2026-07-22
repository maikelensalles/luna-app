// Tipos brutos do banco (snake_case, batendo com as colunas do Supabase).

export type Practice = {
  id: string;
  title: string;
  category: 'Respiração' | 'Movimento' | 'Leitura' | 'Meditação' | 'Escrita' | 'Yoga';
  duration_minutes: number;
  description: string | null;
  audio_url: string | null;
  video_url: string | null;
  created_at: string;
};

export type Quote = {
  id: string;
  text: string;
  category: 'presença' | 'ego' | 'respiração' | 'impermanência' | 'verdade';
  source: string;
  created_at: string;
};

export type DailyCheckin = {
  id: string;
  user_id: string;
  practice_id: string | null;
  title: string;
  check_date: string;
  completed: boolean;
  created_at: string;
};

// Tipos de domínio (camelCase, consumidos pela UI — mapeados a partir dos
// tipos brutos acima na camada do hook).

export type PracticeCategory = Practice['category'];

export type PracticeItem = {
  id: string;
  title: string;
  category: PracticeCategory;
  durationMinutes: number;
  description: string | null;
  videoUrl: string | null;
};

export type JornadaCheckIn = {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  practiceId?: string;
};

export type WeekDay = {
  date: string;
  dayLabel: string;
  completed: boolean;
};

export type Profile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  updatedAt: string;
  reminderEnabled: boolean;
  reminderTime: string;
  quoteNotificationEnabled: boolean;
  quoteNotificationTime: string;
};

export type DailyPracticeItem = {
  id: string;
  userId: string;
  practiceId: string;
  checkDate: string;
  completed: boolean;
  isDefault: boolean;
};

export type ActivityEntry = {
  checkDate: string;
  practiceTitle: string;
};
