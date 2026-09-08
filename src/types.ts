export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type AssignmentStatus = 'todo' | 'in_progress' | 'completed';
export type ExamStatus = 'upcoming' | 'completed';
export type ExamType = 'midsem' | 'endsem' | 'lab_viva' | 'class_test' | 'gate_mock';
export type LectureType = 'lecture' | 'lab' | 'self_study' | 'seminar' | 'tutorial' | 'office_hours';
export type RecurrenceType = 'once' | 'daily' | 'weekdays' | 'weekly' | 'custom';
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';

export interface Subject {
  id: string;
  code: string;
  name: string;
  color: string; // Tailwind color token or hex
  accentColor: string; // e.g. '#3b82f6'
  instructor: string;
  room?: string;
  credits: number;
  targetGrade?: string; // e.g. "10 (O Grade)", "9 (A+ Grade)"
}

export interface UniNote {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  unitOrModule?: string; // e.g., "Unit 3: Deadlocks & CPU Scheduling"
  dateAdded: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface QuizResult {
  id: string;
  noteTitle: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
}

export interface NotebookPoint {
  id: string;
  category: string;
  point: string;
  done?: boolean; // Ticked if student has written this point in their notebook
}

export interface ExpectedQuestion {
  id: string;
  marks: string; // e.g. "2 Marks", "5 Marks", "10 Marks", "Viva / Interview"
  question: string;
  answer: string;
  done?: boolean; // Ticked if revised / prepared
}

export interface ConciseNote {
  id: string;
  subjectId: string;
  title: string;
  originalText: string;
  conciseSummary: string;
  notebookPoints?: NotebookPoint[];
  expectedQuestions?: ExpectedQuestion[];
  howItWorks?: string[];
  keyBullets: string[];
  definitionsAndFormulas: string[];
  complexityAndRules?: string[];
  analogy?: string;
  cheatSheetHooks: string[];
  vivaQuestions: string[];
  examLevelData?: {
    mustWriteKeywords: string[];
    formulaeAndInvariants: string[];
    examTrapAlerts: string[];
    likelyExamQuestions: { marks: string; question: string; answer: string }[];
    rapid60SecRevision: string[];
  };
  inputSource?: 'topic' | 'pasted_notes' | 'file_upload';
  sourceFileName?: string;
  isExamSimplified?: boolean;
  dateCreated: string;
  tags: string[];
}

export interface NoteQuestionAnswer {
  id: string;
  question: string;
  answer: string;
  subjectId?: string;
  timestamp: string;
}

export interface UpcomingTodo {
  id: string;
  title: string;
  subjectId: string;
  dayBucket: 'today' | 'upcoming';
  completed: boolean;
  priority: Priority;
  estimatedMinutes?: number;
  notes?: string;
  createdAt: string;
}

export interface AssignmentSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string YYYY-MM-DDTHH:mm
  priority: Priority;
  status: AssignmentStatus;
  weightPercent?: number; // e.g., 20
  subtasks: AssignmentSubtask[];
  notes?: string;
}

export interface LectureSlot {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat), usually 1 (Mon) to 5 (Fri)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  building?: string;
  type: LectureType;
  notes?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  examType?: ExamType;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  room: string;
  syllabusCoveragePercent: number; // 0 - 100
  weightPercent: number; // e.g. 35
  topics: string[];
  status: ExamStatus;
  format?: string; // e.g. "Written / Closed Book"
  reminderDismissed?: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  durationMinutes: number;
  frequency: RecurrenceType;
  selectedDays?: number[]; // 1=Mon, 2=Tue, etc.
  scheduledTime: string; // HH:mm
  goals: string[];
  reminderEnabled: boolean;
  streak: number;
  lastCompletedDate?: string;
  notes?: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  durationMinutes: number;
  timestamp: string; // ISO string
  mode: TimerMode;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  university: string; // Indian engineering college / university
  major: string; // CSE / AI-DS / IT
  semester: string; // e.g. "Semester 5 (3rd Year)"
  targetCGPA: number; // 10.0 scale, e.g. 9.2
  currentCGPA: number; // 10.0 scale, e.g. 8.7
  targetGPA?: string;
  avatarSeed: string;
  onboardingCompleted: boolean;
  leetcodeStreak?: number;
  gateAspirant?: boolean;
  emailAlertsEnabled?: boolean;
  emailAlertsAddress?: string;
  dayCheckIn?: {
    date: string;
    mood: string;
    energy: string;
    note?: string;
  };
  waterBreakIntervalMinutes?: number;
  waterGlassesToday?: number;
  lastWaterBreakTime?: string;
  bunnyGameUnlockedManual?: boolean;
}

export interface StudyRecommendation {
  id: string;
  title: string;
  category: 'schedule' | 'exam_prep' | 'methodology' | 'wellness' | 'career';
  description: string;
  actionableStep: string;
  impact: 'high' | 'medium';
  targetSubject?: string;
}
