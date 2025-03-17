import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayOtpService } from './layotp.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layotp',
  imports: [CommonModule, FormsModule],
  templateUrl: './layotp.component.html',
  styleUrl: './layotp.component.css',
})
export class LayotpComponent implements OnInit {
constructor(private layOtpService: LayOtpService,private router: Router) { }
newPassword: string = '';
confirmPassword: string = '';
email: string = '';
otp: string = '';
compareO: any={email:'',otp:''};
khachhangeidt:any={};
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
  trangThai: null,
  otpHash: '',
  trangThaiOtp:null
};
errors: any = {};
errorPass: any = {};
passwordError:any = {};
showOtpSection: boolean = false;
otpVerified: boolean = false;
  ngOnInit(): void {
  }
  verifyOtp(){
    

    this.layOtpService.compareOtp(this.email,this.otp).subscribe(
      (response) => {
        this.layOtpService.getKhachHangByEmail(this.email).subscribe(
          (data) => {
                this.khachhang=data;
                if(this.khachhang.trangThaiOtp===1){
                  alert('So sanh thành công!');
                  this.otpVerified=true;
                  this.layOtpService.deleteOtp(this.email);
                }else{
                  alert('Mã Otp không chính xác');
                }
          },
          (error) => {
            // Xử lý lỗi khi gọi API
            console.error('Đã xảy ra lỗi khi lấy thông tin khách hàng: ', error);
          });
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi so sanh.');
      }
    );
  }

  changePassword(){
    
    this.layOtpService.getKhachHangByEmail(this.email).subscribe(
      (data) => {
            this.khachhang=data;
            if (this.validatePass()) {
              this.khachhang.matKhau=this.newPassword;
            this.layOtpService.updateKhachHang(this.khachhang).subscribe(
              (response) => {
                alert('Cập nhật mật khẩu thành công!');
                this.router.navigate(['']);
              },
              (error) => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi thay đổi mật khẩu khách hàng.');
              }
            );
            }
              
            
            

      },
      (error) => {
        // Xử lý lỗi khi gọi API
        console.error('Đã xảy ra lỗi khi lấy thông tin khách hàng: ', error);
      });
      
  }
 
  sendOtp(){
    if (this.validateForm()) {
      this.layOtpService.sendEmail(this.email).subscribe(
        (response) => {
          console.log('re:',response);
          alert('Gửi otp thành công!');
          this.showOtpSection=true;
          
        }
      );
    }else{
      return;
    }

    
    
  }
  validateForm(): boolean {
    
    this.errors = {};
    if (!this.email.trim()) {
      this.errors.email = 'Email không được để trống!';
    }else{
      this.layOtpService.getKhachHangByEmail(this.email).subscribe(
        (data) => {
          // Kiểm tra dữ liệu trả về
          if (data===null) {
            this.errors.email = 'Email không tồn tại!';
          } 
        });
    }
      
    
    return Object.keys(this.errors).length === 0;
  }
  validatePass(): boolean {
    
    this.errorPass = {};
    
      if (!this.newPassword.trim()) {
        this.errorPass.pass = 'Mật khẩu mới không được để trống!';
      }
      if (!this.confirmPassword.trim()) {
        this.errorPass.pass = 'Xác nhận mật khẩu không được để trống!';
      }
      if (this.confirmPassword!==this.newPassword) {
        this.errorPass.pass = 'Mật khẩu mới và mật khẩu xác nhận không giống nhau!';
      }
    
    return Object.keys(this.errorPass).length === 0;
  }
}