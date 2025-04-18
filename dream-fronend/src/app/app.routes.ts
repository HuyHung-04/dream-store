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
import { QuanLyGuard, NhanVienGuard } from './guards/role.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

// Các routes được cấu hình cho ứng dụng
export const routes: Routes = [
  { path: '', redirectTo: 'dangnhap', pathMatch: 'full' },
  { path: 'dangnhap', component: DangnhapComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'banhang', pathMatch: 'full' },
      // Routes cho cả Quản lý và Nhân viên
      { 
        path: 'banhang', 
        component: BanhangComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'hoadon', 
        component: HoaDonComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'donhang', 
        component: DonhangComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'khachhang', 
        component: KhachhangComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'sanpham', 
        component: SanphamComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'khuyenmai', 
        component: KhuyenmaiComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'voucher', 
        component: VoucherComponent,
        canActivate: [AuthGuard]
      },
      // Routes chỉ cho Quản lý
      { 
        path: 'nhanvien', 
        component: NhanvienComponent,
        canActivate: [QuanLyGuard]
      },
      { 
        path: 'thongke', 
        component: ThongkeComponent,
        canActivate: [QuanLyGuard]
      }
    ],
  },
  { path: '**', redirectTo: 'dangnhap' },
];
