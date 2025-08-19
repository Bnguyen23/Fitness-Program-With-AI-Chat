import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

// Existing interfaces
interface TempExercise {
  name: string;
  sets: TempSet[];
  tempReps?: number;
  tempWeight?: number;
  notes?: string;
}

interface TempSet {
  reps: number;
  weight?: number;
  setNumber: number;
}

interface Workout {
  id: number;
  name: string;
  description?: string;
  exercises?: Exercise[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Exercise {
  id: number;
  name: string;
  sets?: Set[];
  workoutId: number;
  order: number;
  notes?: string;
}

interface Set {
  id: number;
  reps: number;
  weight?: number;
  exerciseId: number;
  setNumber: number;
  completed: boolean;
}

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],  // CommonModule includes DatePipe
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss']
})
export class WorkoutsComponent implements OnInit {
  workoutForm: FormGroup;
  workouts: Workout[] = [];
  currentExercises: TempExercise[] = [];
  newExerciseName = '';
  
  isLoading = false;
  isCreatingWorkout = false;
  editingWorkout: Workout | null = null;
  successMessage = '';
  errorMessage = '';

  exerciseSuggestions = [
    'Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Push-ups',
    'Overhead Press', 'Barbell Rows', 'Lunges', 'Dips', 'Bicep Curls',
    'Tricep Extensions', 'Lat Pulldowns', 'Leg Press', 'Calf Raises',
    'Planks', 'Russian Twists', 'Burpees', 'Mountain Climbers'
  ];

  filteredSuggestions: string[] = [];
  showSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.workoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.isLoading = true;
    this.apiService.getWorkouts().subscribe({
      next: (workouts: Workout[]) => {
        this.workouts = workouts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading workouts:', error);
        this.errorMessage = 'Failed to load workouts';
        this.isLoading = false;
        this.loadMockWorkouts();
      }
    });
  }

  private loadMockWorkouts(): void {
    this.workouts = [
      {
        id: 1,
        name: "Upper Body Strength",
        description: "Focus on chest, shoulders, and arms",
        exercises: [
          {
            id: 1,
            name: "Bench Press",
            sets: [
              { id: 1, reps: 10, weight: 80, exerciseId: 1, setNumber: 1, completed: true },
              { id: 2, reps: 8, weight: 85, exerciseId: 1, setNumber: 2, completed: true },
              { id: 3, reps: 6, weight: 90, exerciseId: 1, setNumber: 3, completed: true }
            ],
            workoutId: 1,
            order: 1
          },
          {
            id: 2,
            name: "Overhead Press",
            sets: [
              { id: 4, reps: 12, weight: 50, exerciseId: 2, setNumber: 1, completed: true },
              { id: 5, reps: 10, weight: 55, exerciseId: 2, setNumber: 2, completed: true }
            ],
            workoutId: 1,
            order: 2
          }
        ],
        userId: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: "Leg Day",
        description: "Lower body focus",
        exercises: [
          {
            id: 3,
            name: "Squats",
            sets: [
              { id: 6, reps: 15, weight: 100, exerciseId: 3, setNumber: 1, completed: true },
              { id: 7, reps: 12, weight: 110, exerciseId: 3, setNumber: 2, completed: true }
            ],
            workoutId: 2,
            order: 1
          }
        ],
        userId: 1,
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-14T10:00:00Z'
      }
    ];
  }

  toggleWorkoutForm(): void {
    this.isCreatingWorkout = !this.isCreatingWorkout;
    if (!this.isCreatingWorkout) {
      this.cancelWorkoutForm();
    }
  }

  cancelWorkoutForm(): void {
    this.isCreatingWorkout = false;
    this.editingWorkout = null;
    this.workoutForm.reset();
    this.currentExercises = [];
    this.newExerciseName = '';
    this.clearMessages();
  }

  onExerciseNameInput(): void {
    const value = this.newExerciseName.toLowerCase();
    if (value.length > 0) {
      this.filteredSuggestions = this.exerciseSuggestions
        .filter(exercise => exercise.toLowerCase().includes(value))
        .slice(0, 5);
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.newExerciseName = suggestion;
    this.showSuggestions = false;
    this.addExercise();
  }

  addExercise(): void {
    if (this.newExerciseName.trim()) {
      const exerciseExists = this.currentExercises.some(
        ex => ex.name.toLowerCase() === this.newExerciseName.trim().toLowerCase()
      );

      if (exerciseExists) {
        this.errorMessage = 'Exercise already added to this workout';
        this.clearMessagesAfterDelay();
        return;
      }

      const newExercise: TempExercise = {
        name: this.newExerciseName.trim(),
        sets: [],
        tempReps: undefined,
        tempWeight: undefined
      };
      
      this.currentExercises.push(newExercise);
      this.newExerciseName = '';
      this.showSuggestions = false;
    }
  }

  removeExercise(index: number): void {
    if (confirm('Are you sure you want to remove this exercise?')) {
      this.currentExercises.splice(index, 1);
    }
  }

  addSetToExercise(exerciseIndex: number): void {
    const exercise = this.currentExercises[exerciseIndex];
    if (exercise.tempReps && exercise.tempReps > 0) {
      const newSet: TempSet = {
        reps: exercise.tempReps,
        weight: exercise.tempWeight || 0,
        setNumber: exercise.sets.length + 1
      };
      
      exercise.sets.push(newSet);
      exercise.tempReps = undefined;
      exercise.tempWeight = undefined;
    }
  }

  removeSetFromExercise(exerciseIndex: number, setIndex: number): void {
    const exercise = this.currentExercises[exerciseIndex];
    exercise.sets.splice(setIndex, 1);
    
    exercise.sets.forEach((set, index) => {
      set.setNumber = index + 1;
    });
  }

  onSubmit(): void {
    if (this.workoutForm.valid && this.currentExercises.length > 0) {
      this.isLoading = true;
      this.clearMessages();

      const workoutData = {
        name: this.workoutForm.get('name')?.value,
        description: this.workoutForm.get('description')?.value || '',
        exercises: this.currentExercises.map((exercise, index) => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            setNumber: set.setNumber,
            completed: false
          })),
          order: index + 1,
          notes: exercise.notes
        }))
      };

      if (this.editingWorkout) {
        this.apiService.updateWorkout(this.editingWorkout.id, workoutData).subscribe({
          next: (updatedWorkout: Workout) => {
            const index = this.workouts.findIndex(w => w.id === updatedWorkout.id);
            if (index !== -1) {
              this.workouts[index] = updatedWorkout;
            }
            this.successMessage = 'Workout updated successfully!';
            this.cancelWorkoutForm();
            this.isLoading = false;
            this.clearMessagesAfterDelay();
          },
          error: (error: any) => {
            console.error('Error updating workout:', error);
            this.errorMessage = error.error?.message || 'Failed to update workout';
            this.isLoading = false;
          }
        });
      } else {
        this.apiService.createWorkout(workoutData).subscribe({
          next: (newWorkout: Workout) => {
            this.workouts.unshift(newWorkout);
            this.successMessage = 'Workout created successfully!';
            this.cancelWorkoutForm();
            this.isLoading = false;
            this.clearMessagesAfterDelay();
          },
          error: (error: any) => {
            console.error('Error creating workout:', error);
            this.errorMessage = error.error?.message || 'Failed to create workout';
            this.isLoading = false;
            this.createMockWorkout(workoutData);
          }
        });
      }
    } else if (this.currentExercises.length === 0) {
      this.errorMessage = 'Please add at least one exercise to your workout';
      this.clearMessagesAfterDelay();
    }
  }

  private createMockWorkout(workoutData: any): void {
    const newWorkout: Workout = {
      id: Date.now(),
      ...workoutData,
      exercises: workoutData.exercises.map((ex: any, exIndex: number) => ({
        id: Date.now() + exIndex,
        ...ex,
        workoutId: Date.now(),
        sets: ex.sets.map((set: any, setIndex: number) => ({
          id: Date.now() + exIndex * 100 + setIndex,
          ...set,
          exerciseId: Date.now() + exIndex
        }))
      })),
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workouts.unshift(newWorkout);
    this.successMessage = 'Workout created successfully! (Mock data)';
    this.cancelWorkoutForm();
    this.isLoading = false;
    this.clearMessagesAfterDelay();
  }

  editWorkout(workout: Workout): void {
    this.editingWorkout = workout;
    this.isCreatingWorkout = true;
    
    this.workoutForm.patchValue({
      name: workout.name,
      description: workout.description || ''
    });
    
    this.currentExercises = workout.exercises?.map(exercise => ({
      name: exercise.name,
      sets: exercise.sets?.map(set => ({
        reps: set.reps,
        weight: set.weight,
        setNumber: set.setNumber
      })) || [],
      notes: exercise.notes
    })) || [];
  }

  deleteWorkout(workoutId: number): void {
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      this.isLoading = true;
      this.apiService.deleteWorkout(workoutId).subscribe({
        next: () => {
          this.workouts = this.workouts.filter(w => w.id !== workoutId);
          this.successMessage = 'Workout deleted successfully!';
          this.isLoading = false;
          this.clearMessagesAfterDelay();
        },
        error: (error: any) => {
          console.error('Error deleting workout:', error);
          this.errorMessage = error.error?.message || 'Failed to delete workout';
          this.isLoading = false;
          
          this.workouts = this.workouts.filter(w => w.id !== workoutId);
          this.successMessage = 'Workout deleted successfully! (Mock deletion)';
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  // Helper methods
  getTotalReps(exercise: Exercise): number {
    return exercise.sets?.reduce((total, set) => total + set.reps, 0) || 0;
  }

  getMaxWeight(exercise: Exercise): number {
    if (!exercise.sets || exercise.sets.length === 0) return 0;
    return Math.max(...exercise.sets.map(set => set.weight || 0));
  }

  getTotalSets(workout: Workout): number {
    return workout.exercises?.reduce((total, exercise) => total + (exercise.sets?.length || 0), 0) || 0;
  }

  getEstimatedDuration(workout: Workout): number {
    const totalSets = this.getTotalSets(workout);
    const baseTime = totalSets * 2.5;
    const setupTime = (workout.exercises?.length || 0) * 2;
    return Math.round(baseTime + setupTime);
  }

  getTotalVolume(workout: Workout): number {
    return workout.exercises?.reduce((total, exercise) => {
      return total + (exercise.sets?.reduce((setTotal, set) => {
        return setTotal + (set.reps * (set.weight || 0));
      }, 0) || 0);
    }, 0) || 0;
  }

  hasAnySets(): boolean {
    return this.currentExercises.some(ex => ex.sets && ex.sets.length > 0);
  }

  getTotalSetsCount(): number {
    return this.currentExercises.reduce((total, ex) => total + (ex.sets ? ex.sets.length : 0), 0);
  }

  getExerciseSetCount(exercise: TempExercise): number {
    return exercise.sets ? exercise.sets.length : 0;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }
}