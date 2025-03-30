import { Component, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { TaiKhoanService } from './taikhoan.service';
 import { FormsModule } from '@angular/forms';
 import { CookieService } from 'ngx-cookie-service';
 import { Router } from '@angular/router'
 @Component({
   selector: 'app-taikhoan',
   imports: [CommonModule, FormsModule],
   templateUrl: './taikhoan.component.html',
   styleUrl: './taikhoan.component.css',
 })
 export class TaikhoanComponent implements OnInit {
   hoso: boolean = true;
   doimatkhau1: boolean = false;
   doimatkhau2: boolean = false;
   themdiachi: boolean = false;
   erroredits: any = {};
   khachHangEdit: any = {};
   errors: any = {};
   error: any = {};
   matKhauHienTai: string = '';
   matKhauXacNhan:string = '';
   hienTaiMatKhau:string = '';
   isEditing: boolean = false; // Kiểm soát trạng thái chỉnh sửa
   selectedKhachHang: any = {
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
 
   constructor(private taiKhoanService: TaiKhoanService,private router: Router, private cookieService: CookieService) {}
 
   ngOnInit(): void {
     const khachhangCookie = this.cookieService.get('khachhang');
     if (khachhangCookie) {
       this.selectedKhachHang = JSON.parse(khachhangCookie);
       this.khachHangEdit = { ...this.selectedKhachHang }; // Sao chép dữ liệu để chỉnh sửa
     }
   }
 
   clearErrorEdit(field: string): void {
     if (this.erroredits[field]) {
       delete this.erroredits[field];
     }
   }
 
   toggleEdit() {
     this.isEditing = !this.isEditing;
     if (!this.isEditing) {
       this.updateProfile();
     }
   }
   
   updateProfile() {
    if (!this.validateEditForm()) {
      return;
    }
     this.taiKhoanService.updateKhachHang(this.khachHangEdit).subscribe(
       (response) => {
         alert('Cập nhật thành công!');
         this.selectedKhachHang = { ...this.khachHangEdit }; // Cập nhật dữ liệu hiển thị
         this.cookieService.set('khachhang', JSON.stringify(this.selectedKhachHang));
       },
       (error) => {
         alert('Cập nhật thất bại!');
       }
     );
   }
 
 
   validateEditForm(): boolean {
 
     this.errors = {};
 
     
     if (!this.khachHangEdit.ten.trim()) {
       this.errors.ten = 'Tên khách hàng không được để trống!';
     }
       // Validate số điện thoại
   const phoneRegex = /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
   if (!this.khachHangEdit.soDienThoai.trim()) {
     this.errors.soDienThoai = 'Số điện thoại khách hàng không được để trống!';
   } else if (!phoneRegex.test(this.khachHangEdit.soDienThoai)) {
     this.errors.soDienThoai = 'Số điện thoại không hợp lệ!';
   }
 
   const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
   if (!this.khachHangEdit.email.trim()) {
     this.errors.email = 'Email không được để trống!';
   } else if (!emailRegex.test(this.khachHangEdit.email)) {
     this.errors.email = 'Email phải có định dạng @gmail.com!';
   }
     return Object.keys(this.errors).length === 0;
   }
   validateEditFormMK(){
    this.error = {};
    if (!this.matKhauHienTai.trim()) {
      this.error.matKhauHienTai = 'Mật khẩu không được để trống!';
    }
    if (!this.matKhauXacNhan.trim()) {
      this.error.matKhauXacNhan = 'Xác nhận mật khẩu không được để trống!';
    }
    if (this.matKhauXacNhan==this.matKhauXacNhan) {
      this.error.matKhauXacNhan = 'Xác nhận mật khẩu phải giống mật khẩu!';
    }
    return Object.keys(this.error).length === 0;
   }
   updateKhachHang() {
     if (!this.validateEditFormMK()) {
       return;
     }
     if (this.khachHangEdit!=null) {
       
       console.log(this.khachHangEdit);
       this.khachHangEdit.matKhau=this.matKhauHienTai;
       this.taiKhoanService.updateKhachHang(this.khachHangEdit).subscribe(
         (response) => {
 
 
           alert('Cập nhật mật khẩu thành công!');
           this.selectedKhachHang = { ...this.khachHangEdit };
           this.cookieService.set('khachhang', JSON.stringify(this.selectedKhachHang));
           
 
         },
         (error) => {
           console.error('Error:', error);
           alert('Có lỗi xảy ra khi cập nhật khách hàng.');
         }
       );
     } 
   }
 
   xacNhanMatKhau(){
    console.log(this.selectedKhachHang.matKhau);
     if(this.selectedKhachHang.matKhau===this.hienTaiMatKhau){
         this.doimatkhau2=true;
     }else{
      alert('Mật khẩu không chính xác!');
       this.doimatkhau2=false;
     }
   }
   xoacookie(){
    if (window.confirm('Bạn có muốn đăng xuất không?')) {
      this.cookieService.delete('khachhang');
    }
  }
  goHome(): void {
    this.router.navigate(['']);
  }
   openhoso(){
     this.hoso=true;
     this.doimatkhau1=false;
     this.doimatkhau2=false;
   }
   opendoimatkhau(){
     this.hoso=false;
     this.doimatkhau1=true;
   }
 }