import { Routes } from '@angular/router';
import { BanhangComponent } from './banhang/banhang.component';
import { SanphamDetailComponent } from './sanpham-detail/sanpham-detail.component';
import { DangkyComponent } from './dangky/dangky.component';
import { DangnhapComponent } from './dangnhap/dangnhap.component';
import { LayotpComponent } from './layotp/layotp.component';
import { HoadonComponent } from './hoadon/hoadon.component';
import { DonhangComponent } from './donhang/donhang.component';
// Các routes được cấu hình cho ứng dụng
export const routes: Routes = [
  { path: '', component: BanhangComponent }, // Trang chính là danh sách sản phẩm
  { path: 'sanpham/:id', component: SanphamDetailComponent }, // Chi tiết sản phẩm
  { path: 'dangnhap', component: DangnhapComponent }, // Đăng nhập
  { path: 'dangky', component: DangkyComponent }, // Đăng ký
  { path: 'layotp', component: LayotpComponent },
  { path: 'hoadon', component: HoadonComponent },
  { path: 'donhang', component: DonhangComponent },
  { path: '**', redirectTo: '' } // Nếu không tìm thấy trang thì về trang chính
];
