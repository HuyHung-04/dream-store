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
          this.errors.email ='Email đã tồn tại, vui lòng chọn email khác!';
          return;
        } else {
          // Nếu email chưa tồn tại, tiến hành thêm khách hàng
          this.dangKyService.addKhachHang(this.khachhang).subscribe(
            (response) => {
              alert('Thêm khách hàng thành công!');
              this.router.navigate(['']);
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
    this.errors = {};
  
    if (!this.khachhang.ten.trim()) {
      this.errors.ten = 'Tên khách hàng không được để trống!';
    }
  
    // Validate số điện thoại
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
    if (!this.khachhang.soDienThoai.trim()) {
      this.errors.soDienThoai = 'Số điện thoại khách hàng không được để trống!';
    } else if (!phoneRegex.test(this.khachhang.soDienThoai)) {
      this.errors.soDienThoai = 'Số điện thoại không hợp lệ!';
    }
  
    // Kiểm tra email không trống và đúng định dạng @gmail.com
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!this.khachhang.email.trim()) {
    this.errors.email = 'Email không được để trống!';
  } else if (!emailRegex.test(this.khachhang.email)) {
    this.errors.email = 'Email phải có định dạng @gmail.com!';
  }
  
    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (!this.khachhang.matKhau.trim()) {
      this.errors.matKhau = 'Mật khẩu không được để trống!';
    }
    if (!this.xacNhanMatKhau.trim()) {
      this.errors.xacNhanMatKhau = 'Xác nhận mật khẩu không được để trống!';
    }
    if (this.xacNhanMatKhau !== this.khachhang.matKhau) {
      this.errors.xacNhanMatKhau = 'Xác nhận mật khẩu không đúng!';
    }
  

  console.log(this.errors)
    return Object.keys(this.errors).length === 0;
  }
   
  
  
}