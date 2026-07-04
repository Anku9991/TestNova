export type UserRole = "super_admin" | "admin" | "teacher" | "content_manager" | "student";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscription: Subscription | null;
  phone?: string;
  state?: string;
  targetExam?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  offerPrice?: number;
  durationInMonths?: number;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  categoryId?: string;
  instructorId?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  sequence: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  chapterId: string;
  title: string;
  estimatedTime?: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number; // e.g. 0.25
  passingMarks?: number;
  isPublished: boolean;
  isFree: boolean;
  isPremium: boolean;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  instructions: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  attemptCount: number;
}

export interface Question {
  id: string;
  examId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  type: "mcq" | "single" | "multiple" | "true_false" | "paragraph" | "comprehension";
  text: string;
  latex?: string;
  imageUrl?: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  explanationImageUrl?: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negativeMarks?: number;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect?: boolean;
}

export interface Attempt {
  id: string;
  userId: string;
  examId: string;
  responses: Record<string, string | string[]>;
  startedAt: Date;
  submittedAt?: Date;
  timeTaken?: number; // seconds
  isSubmitted: boolean;
  violations: ViolationEvent[];
}

export interface ViolationEvent {
  type: "tab_switch" | "fullscreen_exit" | "copy_attempt";
  timestamp: Date;
}

export interface Result {
  id: string;
  attemptId: string;
  userId: string;
  examId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
  totalAttempts?: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  timeTaken: number;
  topicAnalysis: TopicAnalysis[];
  createdAt: Date;
}

export interface TopicAnalysis {
  topic: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  percentage: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: Date;
  expiresAt: Date;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number; // days
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  examsIncluded: string[] | "all";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  examCount: number;
  isActive: boolean;
  order: number;
}

export interface Notification {
  id: string;
  userId: string | "all";
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "exam" | "payment" | "result";
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  author: string;
  authorPhotoUrl?: string;
  tags: string[];
  category: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachmentUrl?: string;
  createdAt: Date;
}
