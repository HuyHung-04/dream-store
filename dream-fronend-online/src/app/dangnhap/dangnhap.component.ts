import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DangNhapService } from './dangnhap.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dangnhap',
  imports: [CommonModule, FormsModule],
  templateUrl: './dangnhap.component.html',
  styleUrl: './dangnhap.component.css',
})
export class DangnhapComponent implements OnInit {
  errors: any = {};
  tentaikhoan: string='';
  matkhau: string='';
  khachhang: any = null;
  nhanvien: any=null;
constructor(private dangNhapService: DangNhapService) { }
  ngOnInit(): void {
  }
  kiemTraTaiKhoan(){
    this.dangNhapService.getKhachHangByEmail(this.tentaikhoan).subscribe(
      (data) => {
        this.khachhang=data;
        if (this.validateForm(this.khachhang)) {
          alert('khach hang');
        }
        
      });
      
    
    
  }
  validateForm(khachhang: any): boolean{
    this.errors = {};
    if (!this.tentaikhoan.trim()) {
      this.errors.email = 'Email không được để trống!';
    }
    if (this.khachhang===null) {
      this.errors.email = 'Email không tồn tại!';
    } 
    if (!this.matkhau.trim()) {
      this.errors.matKhau = 'Mật khẩu khách hàng không được để trống!';
    }
    if(this.khachhang.matKhau!==this.matkhau){
      this.errors.matKhau = 'Mật khẩu khách hàng không đúng!';
    }
    
    return Object.keys(this.errors).length === 0;
  }
}