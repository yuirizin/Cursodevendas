export type UserRole = 'aluno' | 'admin';
export type UserStatus = 'ativo' | 'inativo';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface SiteSettings {
  id: string;
  platformName: string;
  mainTitle: string;
  subtitle: string;
  welcomeText: string;
  zeusImage: string;
  conclusionTitle: string;
  conclusionText: string;
  supportEmail: string;
  primaryColor: string;
  accentColor: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  badge?: string;
  fullContent: string;
  practicalTask: string;
  expectedResult: string;
  tableData?: Array<{ niche: string; highlights: string }>;
  packages?: Array<{
    name: string;
    description: string;
    features: string[];
  }>;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: string;
}

export interface PromptCard {
  id: string;
  segmentName: string;
  description: string;
  promptContent: string;
  iconName?: string;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  description: string;
  filePath: string | null;
  fileType: string;
  duration?: string;
  uploadedAt: string;
  isPublished: boolean;
}

export interface DatabaseSchema {
  users: UserRecord[];
  siteSettings: SiteSettings;
  modules: CourseModule[];
  prompts: PromptCard[];
  video: VideoLesson;
}

export interface AuthResponse {
  user: User;
  token: string;
}
