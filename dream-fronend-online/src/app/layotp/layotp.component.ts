import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayOtpService } from './layotp.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-layotp',
  imports: [CommonModule, FormsModule],
  templateUrl: './layotp.component.html',
  styleUrl: './layotp.component.css',
})
export class LayotpComponent implements OnInit {
constructor(private layOtpService: LayOtpService) { }
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
                  alert('Xác thực otp thành công!');
                  this.otpVerified=true;
                  this.layOtpService.deleteOtp(this.email);
                }else{
                  alert('Mã otp không chính xác');
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
                window.location.href = '/dangnhap';
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
    
    if (this.newPassword.length < 6 || this.newPassword.length > 30) {
      this.errorPass.pass ='Mật khẩu phải có độ dài từ 6 đến 30 ký tự!';
    }
    if (this.confirmPassword!==this.newPassword) {
      this.errorPass.pass = 'Mật khẩu mới và mật khẩu xác nhận không giống nhau!';
    }
    
    return Object.keys(this.errorPass).length === 0;
  }
}