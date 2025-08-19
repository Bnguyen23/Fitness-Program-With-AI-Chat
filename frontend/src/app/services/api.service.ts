import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // Auth endpoints
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  // Workout endpoints
  getWorkouts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/workouts`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  createWorkout(workout: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/workouts`, workout, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateWorkout(id: number, workout: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/workouts/${id}`, workout, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteWorkout(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/workouts/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Cardio endpoints
  getCardioSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cardio`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  createCardioSession(session: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cardio`, session, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  updateCardioSession(id: number, session: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cardio/${id}`, session, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  deleteCardioSession(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cardio/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // AI Chat endpoints
  sendChatMessage(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, { message }, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}