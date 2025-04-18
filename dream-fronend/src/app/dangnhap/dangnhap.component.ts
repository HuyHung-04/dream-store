import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DangnhapService } from './dangnhap.service'; 
import { FormsModule, NgForm } from '@angular/forms';
import { JwtService } from '../services/jwt.service';

@Component({
  selector: 'app-dangnhap',
  imports: [CommonModule, FormsModule],
  templateUrl: './dangnhap.component.html',
  styleUrl: './dangnhap.component.css'
})
export class DangnhapComponent {
  loginData = {
    taiKhoan: '',
    matKhau: ''
  };
  loading: boolean = false;
  submitted: boolean = false;
  errors: { taiKhoan: string; matKhau: string } = { taiKhoan: '', matKhau: '' };

  constructor(
    private dangnhapService: DangnhapService,
    private jwtService: JwtService,
    private router: Router
  ) {
    // Nếu đã đăng nhập, chuyển hướng theo role
    if (this.dangnhapService.isLoggedIn()) {
      this.navigateByRole();
    }
  }

  // Kiểm tra định dạng email
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  onInputChange(field: string) {
    if (this.submitted) {
      if (field === 'taiKhoan') {
        if (this.loginData.taiKhoan.length >= 1) {
          this.errors.taiKhoan = '';
        }
      } else if (field === 'matKhau') {
        if (this.loginData.matKhau.length >= 1) {
          this.errors.matKhau = '';
        }
      }
    }
  }
  
  onSubmit(form: NgForm) {
    this.submitted = true;
    this.errors = { taiKhoan: '', matKhau: '' };

    if (!this.loginData.taiKhoan) {
      this.errors.taiKhoan = 'Vui lòng nhập tài khoản hoặc email!';
      return;
    }

    if (!this.loginData.matKhau) {
      this.errors.matKhau = 'Vui lòng nhập mật khẩu!';
      return;
    } else if (this.loginData.matKhau.length < 5) {
      this.errors.matKhau = 'Mật khẩu phải có ít nhất 5 ký tự!';
      return;
    }

    this.loading = true;
    this.dangnhapService.login(this.loginData.taiKhoan, this.loginData.matKhau).subscribe({
      next: (response) => {
        this.loading = false;
        // Lưu token và thông tin user
        this.jwtService.saveToken(response.token);
        this.jwtService.saveUser(response.user);
        alert('Đăng nhập thành công!');
        // Chuyển hướng dựa trên role
        this.navigateByRole();
      },
      error: (err) => {
        this.loading = false;
        console.error("Lỗi hệ thống: ", err);
        if (err.status === 401) {
          this.errors.matKhau = 'Sai mật khẩu';
        } else if (err.status === 404) {
          this.errors.taiKhoan = 'Tài khoản hoặc email không tồn tại';
        } else {
          this.errors.taiKhoan = 'Lỗi hệ thống. Vui lòng thử lại!';
        }
      }
    });
  }

  private navigateByRole() {
    if (this.jwtService.hasRole('Quản lý')) {
      this.router.navigate(['/thongke']);
    } else if (this.jwtService.hasRole('Nhân viên')) {
      this.router.navigate(['/banhang']);
    } else if (this.jwtService.hasRole('Khách hàng')) {
      this.router.navigate(['/khachhang']);
    }
  }
}
