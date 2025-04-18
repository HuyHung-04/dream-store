import { Routes } from '@angular/router';
import { BanhangComponent } from './banhang/banhang.component';
import { HoaDonComponent } from './hoadon/hoadon.component';
import { SanphamComponent } from './sanpham/sanpham.component';
import { LayoutComponent } from './layout/layout.component';
import { KhachhangComponent } from './khachhang/khachhang.component';
import { KhuyenmaiComponent } from './khuyenmai/khuyenmai.component';
import { NhanvienComponent } from './nhanvien/nhanvien.component';
import { ThongkeComponent } from './thongke/thongke.component';
import { VoucherComponent } from './voucher/voucher.component';
import { DangnhapComponent } from './dangnhap/dangnhap.component';
import { DonhangComponent } from './donhang/donhang.component';
import { AuthGuard } from './guards/auth.guard';
import { QuanLyGuard, NhanVienGuard, KhachHangGuard } from './guards/role.guard';

// Các routes được cấu hình cho ứng dụng
export const routes: Routes = [
  { path: '', redirectTo: 'dangnhap', pathMatch: 'full' },
  { path: 'dangnhap', component: DangnhapComponent },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'banhang', pathMatch: 'full' },
      { 
        path: 'banhang', 
        component: BanhangComponent,
        canActivate: [NhanVienGuard]
      },
      { 
        path: 'hoadon', 
        component: HoaDonComponent,
        canActivate: [NhanVienGuard]
      },
      { 
        path: 'sanpham', 
        component: SanphamComponent,
        canActivate: [NhanVienGuard]
      },
      { 
        path: 'voucher', 
        component: VoucherComponent,
        canActivate: [QuanLyGuard]
      },
      { 
        path: 'khuyenmai', 
        component: KhuyenmaiComponent,
        canActivate: [QuanLyGuard]
      },
      { 
        path: 'khachhang', 
        component: KhachhangComponent,
        canActivate: [KhachHangGuard]
      },
      { 
        path: 'nhanvien', 
        component: NhanvienComponent,
        canActivate: [QuanLyGuard]
      },
      { 
        path: 'thongke', 
        component: ThongkeComponent,
        canActivate: [QuanLyGuard]
      },
      { 
        path: 'donhang', 
        component: DonhangComponent,
        canActivate: [NhanVienGuard]
      },
    ],
  },
  { path: '**', redirectTo: 'dangnhap' },
];
