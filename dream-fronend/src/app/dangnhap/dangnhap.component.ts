import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DangnhapService } from './dangnhap.service';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
  storedUserData: any = {};

  constructor(
    private dangnhapService: DangnhapService,
    private router: Router
  ) { }

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
        alert('Đăng nhập thành công!');
        console.log("id",response.user.id)
        console.log(response)
        localStorage.setItem('idNhanVien', response.user.id);
        localStorage.setItem('access_token', response.token);
        const role = response.user.role;
        localStorage.setItem('role', role);
        if (role === 'ROLE_Quản lý') {
          this.router.navigate(['/layout/thongke']);
        } else if (role === 'ROLE_Nhân viên') {
          this.router.navigate(['/layout/banhang']);
        } else {
          alert('Vai trò không xác định. Vui lòng liên hệ quản trị viên.');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        if (error.status === 400 && error.error && typeof error.error.message === 'string') {
          const message = error.error.message;

          if (message.includes('Tài khoản không đúng')) {
            this.errors.taiKhoan = 'Tài khoản không chính xác';
          } else if (message.includes('Mật khẩu không đúng')) {
            this.errors.matKhau = 'Mật khẩu không chính xác';
          }
          else if (message.includes('Error: Nhân viên không hoạt động')) {
            alert("Tài khoản nhân viên không hoạt động")
          }
          else {
            this.errors.taiKhoan = 'Lỗi hệ thống. Vui lòng thử lại!';
          }

        } else {
          this.errors.taiKhoan = 'Đã xảy ra lỗi. Vui lòng thử lại!';
        }
      }
    });
  }

}
