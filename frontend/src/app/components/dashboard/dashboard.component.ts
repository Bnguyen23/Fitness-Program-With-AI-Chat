import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

interface Activity {
  icon: string;
  name: string;
  description: string;
  date: Date;
  type: 'workout' | 'cardio';
}

interface DashboardStats {
  totalWorkouts: number;
  totalCardioSessions: number;
  totalMinutes: number;
  weeklyWorkouts: number;
  weeklyCardio: number;
  weeklyMinutes: number;
}

interface Quote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  dashboardStats: DashboardStats | null = null;
  recentActivities: Activity[] = [];
  currentQuote: Quote = { text: '', author: '' };
  
  // Weekly goals
  weeklyWorkoutGoal = 3;
  weeklyCardioMinutesGoal = 150;
  weeklyActiveDaysGoal = 5;
  
  // Motivational quotes
  quotes: Quote[] = [
    { text: "The only bad workout is the one that didn't happen", author: "Unknown" },
    { text: "Fitness is not about being better than someone else. It's about being better than you used to be", author: "Khloe Kardashian" },
    { text: "The pain you feel today will be the strength you feel tomorrow", author: "Arnold Schwarzenegger" },
    { text: "Success isn't always about greatness. It's about consistency", author: "Dwayne Johnson" },
    { text: "Don't limit your challenges. Challenge your limits", author: "Jerry Dunn" },
    { text: "The body achieves what the mind believes", author: "Napoleon Hill" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will", author: "Mahatma Gandhi" }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setRandomQuote();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // To know the weekly exercises
    setTimeout(() => {
      this.dashboardStats = {
        totalWorkouts: 12,
        totalCardioSessions: 8,
        totalMinutes: 1240,
        weeklyWorkouts: 2,
        weeklyCardio: 3,
        weeklyMinutes: 320
      };
      
      this.recentActivities = [
        {
          icon: '💪',
          name: 'Upper Body Strength',
          description: 'Completed 5 exercises, 18 sets',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          type: 'workout'
        },
        {
          icon: '🏃',
          name: 'Morning Run',
          description: '5km in 25 minutes',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          type: 'cardio'
        },
        {
          icon: '💪',
          name: 'Leg Day',
          description: 'Completed 4 exercises, 16 sets',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          type: 'workout'
        }
      ];
      
      this.isLoading = false;
    }, 1000);
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  navigateToWorkouts(): void {
    this.router.navigate(['/workouts']);
  }

  navigateToCardio(): void {
    this.router.navigate(['/cardio']);
  }

  setRandomQuote(): void {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.currentQuote = this.quotes[randomIndex];
  }

  // Stats calculation methods
  getWorkoutTrend(): number {
    if (!this.dashboardStats) return 0;
    return Math.round((this.dashboardStats.weeklyWorkouts / this.weeklyWorkoutGoal) * 100 - 100);
  }

  getCardioTrend(): number {
    if (!this.dashboardStats) return 0;
    return Math.round((this.dashboardStats.weeklyCardio / 3) * 100 - 100);
  }

  getTotalWorkoutTime(): string {
    if (!this.dashboardStats) return '0';
    const hours = Math.floor(this.dashboardStats.totalMinutes / 60);
    const minutes = this.dashboardStats.totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getWeeklyMinutes(): string {
    if (!this.dashboardStats) return '0 min';
    return `${this.dashboardStats.weeklyMinutes} min`;
  }

  getWeeklyGoalProgress(): number {
    if (!this.dashboardStats) return 0;
    const workoutProgress = (this.dashboardStats.weeklyWorkouts / this.weeklyWorkoutGoal) * 33.33;
    const cardioProgress = (this.dashboardStats.weeklyMinutes / this.weeklyCardioMinutesGoal) * 33.33;
    const activeDaysProgress = this.getActiveDaysPercentage() * 0.3333;
    return Math.min(100, Math.round(workoutProgress + cardioProgress + activeDaysProgress));
  }

  getGoalStatus(): string {
    const progress = this.getWeeklyGoalProgress();
    if (progress >= 100) return '🎉 Goal achieved!';
    if (progress >= 75) return '🔥 Almost there!';
    if (progress >= 50) return '💪 Keep going!';
    if (progress >= 25) return '👍 Good start!';
    return '🚀 Let\'s get started!';
  }

  getWorkoutGoalPercentage(): number {
    if (!this.dashboardStats) return 0;
    return Math.min(100, (this.dashboardStats.weeklyWorkouts / this.weeklyWorkoutGoal) * 100);
  }

  getCardioGoalPercentage(): number {
    if (!this.dashboardStats) return 0;
    return Math.min(100, (this.dashboardStats.weeklyMinutes / this.weeklyCardioMinutesGoal) * 100);
  }

  getActiveDaysPercentage(): number {
    if (!this.dashboardStats) return 0;
    // Calculate based on unique days with activity
    const activeDays = Math.min(
      this.dashboardStats.weeklyWorkouts + Math.ceil(this.dashboardStats.weeklyCardio / 2),
      7
    );
    return Math.min(100, (activeDays / this.weeklyActiveDaysGoal) * 100);
  }
}