import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>403 - Không có quyền truy cập</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
        <button class="btn btn-primary" (click)="goToHome()">Về trang chủ</button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f8f9fa;
    }
    
    .unauthorized-content {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      color: #dc3545;
      margin-bottom: 1rem;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: #6c757d;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/layout/banhang']);
  }
} 