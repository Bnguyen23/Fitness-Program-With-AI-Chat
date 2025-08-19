import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface CardioSession {
  id?: number;
  type: string;
  duration: number;
  distance?: number;
  calories?: number;
  notes?: string;
  date: string;
}

@Component({
  selector: 'app-cardio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cardio.component.html',
  styleUrls: ['./cardio.component.scss']
})
export class CardioComponent implements OnInit {
  cardioForm: FormGroup;
  cardioSessions: CardioSession[] = [];
  isLoading = false;
  selectedWeek: string = '';
  cardioTypes = ['Running', 'Cycling', 'Swimming', 'Walking', 'Elliptical', 'Rowing', 'HIIT', 'Other'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.cardioForm = this.fb.group({
      type: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      distance: [''],
      calories: [''],
      notes: [''],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setCurrentWeek();
    this.loadCardioSessions();
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    this.cardioForm.patchValue({ date: today });
  }

  setCurrentWeek(): void {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    this.selectedWeek = startOfWeek.toISOString().split('T')[0];
  }

  loadCardioSessions(): void {
    this.isLoading = true;
    
    // Using mock data for now
    setTimeout(() => {
      this.cardioSessions = [
        {
          id: 1,
          type: 'Running',
          duration: 30,
          distance: 5,
          calories: 300,
          notes: 'Morning run',
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: 2,
          type: 'Cycling',
          duration: 45,
          distance: 15,
          calories: 400,
          notes: 'Evening ride',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  onSubmit(): void {
    if (this.cardioForm.valid) {
      this.isLoading = true;
      const cardioData = this.cardioForm.value;
      
      // Add to local array for now
      const newSession: CardioSession = {
        id: Date.now(),
        ...cardioData
      };
      
      this.cardioSessions.unshift(newSession);
      this.cardioForm.reset();
      const today = new Date().toISOString().split('T')[0];
      this.cardioForm.patchValue({ date: today });
      this.isLoading = false;

      // When backend is ready, uncomment:
      /*
      this.apiService.createCardioSession(cardioData).subscribe({
        next: (response: any) => {
          this.cardioSessions.unshift(response);
          this.cardioForm.reset();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error adding session:', error);
          this.isLoading = false;
        }
      });
      */
    }
  }

  deleteCardioSession(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Delete this session?')) {
      this.cardioSessions = this.cardioSessions.filter(s => s.id !== id);
    }
  }

  getTotalDuration(): number {
    return this.cardioSessions.reduce((total, session) => total + session.duration, 0);
  }

  getTotalCalories(): number {
    return this.cardioSessions.reduce((total, session) => total + (session.calories || 0), 0);
  }

  getWeeklyGoalProgress(): number {
    const weeklyGoal = 150;
    const totalDuration = this.getTotalDuration();
    return Math.min((totalDuration / weeklyGoal) * 100, 100);
  }
}