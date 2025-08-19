// User Models
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  weight?: number;
  height?: number;
  fitnessGoal?: string;
  activityLevel?: string;
  createdAt: string;
  updatedAt: string;
}

// Workout Models
export interface Workout {
  id: number;
  name: string;
  description?: string;
  exercises: Exercise[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: number;
  name: string;
  sets: Set[];
  workoutId: number;
  order: number;
  notes?: string;
}

export interface Set {
  id: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  exerciseId: number;
  setNumber: number;
  completed: boolean;
}

// Cardio Models
export interface Cardio {
  id: number;
  type: string;
  duration: number; // in minutes
  distance?: number; // in kilometers
  calories?: number;
  notes?: string;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Auth Models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

// Dashboard Models
export interface DashboardStats {
  totalWorkouts: number;
  totalCardioSessions: number;
  totalWorkoutTime: number;
  totalCardioTime: number;
  weeklyGoalProgress: number;
  recentWorkouts: Workout[];
  recentCardio: Cardio[];
}