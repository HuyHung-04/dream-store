import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DangKyService } from './dangky.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dangky',
  imports: [CommonModule, FormsModule],
  templateUrl: './dangky.component.html',
  styleUrl: './dangky.component.css',
})
export class DangkyComponent implements OnInit {
  
  
  showOtpSection: boolean = false;
  xacNhanMatKhau: string = '';
  khachhangs: any[] = [];
  showModal: boolean = false;
  showModalDetail: boolean = false;
  showModalSearch: boolean = false;
  maxVisiblePages = 3;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  showModalEdit = false;
  selectedKhachHang: any = null;
  khachHangEdit: any = {};
  searchText: string = '';
  visiblePages: number[] = [];
  filteredKhachHangs: any[] = [];
  errors: any = {};
  khachhang: any = {
    id: '',
    ma: '',
    ten: '',
    gioiTinh: true,
    email: '',
    soDienThoai: '',
    matKhau: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1,
    
  };

  constructor(private dangKyService: DangKyService, private router: Router) { }
  ngOnInit(): void {
    
  }

  resetForm() {
    this.khachhang = {
    ma: '',
    ten: '',
    gioiTinh: true,
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau:'',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1,
    };

  }
  
  addKhachHang() {
    if (!this.validateForm()) {
      return; // Dừng nếu form không hợp lệ
    }
  
    // Kiểm tra email đã tồn tại hay chưa
    this.dangKyService.getKhachHangByEmail(this.khachhang.email).subscribe(
      (existingKhachHang) => {
        if (existingKhachHang) {
          alert('Email đã tồn tại, vui lòng chọn email khác!');
          return;
        } else {
          // Nếu email chưa tồn tại, tiến hành thêm khách hàng
          this.dangKyService.addKhachHang(this.khachhang).subscribe(
            (response) => {
              alert('Đăng ký tài khoản thành công!');
              this.router.navigate(['/dangnhap']);
              this.resetForm();
            },
            (error) => {
              console.error('Error:', error);
              alert('Có lỗi xảy ra khi thêm khách hàng.');
            }
          );
        }
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi kiểm tra email.');
      }
    );
  }
  

  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  validateForm(): boolean {
    // Kiểm tra tên khách hàng
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;
    if (!this.khachhang.ten.trim()) {
      alert('Tên khách hàng không được để trống!');
      return false;
    }
    if (!nameRegex.test(this.khachhang.ten)) {
      alert('Tên khách hàng không được chứa số hoặc ký tự đặc biệt!');
      return false;
    }
    if (this.khachhang.ten.length > 30) {
      alert('Tên khách hàng phải có độ dài không quá 30 ký tự!');
      return false;
    }

  
    // Kiểm tra số điện thoại
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
    const phone = /^\d{10}$/;
    if (!this.khachhang.soDienThoai.trim()) {
      alert('Số điện thoại khách hàng không được để trống!');
      return false;
    }
    if (!phone.test(this.khachhang.soDienThoai)) {
      alert('Số điện thoại phải đúng 10 chữ số!');
      return false;
    }
    if (!phoneRegex.test(this.khachhang.soDienThoai)) {
      alert('Số điện thoại không hợp lệ!');
      return false;
    }
  
    // Kiểm tra email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!this.khachhang.email.trim()) {
      alert('Email không được để trống!');
      return false;
    }
    if (!emailRegex.test(this.khachhang.email)) {
      alert('Email phải có định dạng @gmail.com!');
      return false;
    }
    if (this.khachhang.email.length > 255) {
      alert('Email phải có độ dài từ không quá 255 ký tự!');
      return false;
    }
  
    // Kiểm tra mật khẩu
    if (!this.khachhang.matKhau.trim()) {
      alert('Mật khẩu không được để trống!');
      return false;
    }
    if (this.khachhang.matKhau.length < 6 || this.khachhang.matKhau.length > 30) {
      alert('Mật khẩu phải có độ dài từ 6 đến 30 ký tự!');
      return false;
    }
  
    // Kiểm tra xác nhận mật khẩu
    if (!this.xacNhanMatKhau.trim()) {
      alert('Xác nhận mật khẩu không được để trống!');
      return false;
    }
    if (this.xacNhanMatKhau !== this.khachhang.matKhau) {
      alert('Xác nhận mật khẩu không đúng!');
      return false;
    }
  
    return true;
  }
   
  
  
}