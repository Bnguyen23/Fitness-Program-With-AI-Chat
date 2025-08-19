import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkoutsComponent } from './components/workouts/workouts.component';
import { CardioComponent } from './components/cardio/cardio.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'workouts', component: WorkoutsComponent },
  { path: 'cardio', component: CardioComponent },
  { path: '**', redirectTo: '/login' }
];