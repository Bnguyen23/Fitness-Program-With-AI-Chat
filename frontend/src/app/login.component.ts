import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('Login attempt:', this.loginForm.value);
      
      // API call
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      }, 1000);
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  useDemo(): void {
    this.loginForm.patchValue({
      email: 'demo@fittracker.com',
      password: 'demo123'
    });
  }
}