import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class QuanLyGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.jwtService.isLoggedIn()) {
      this.router.navigate(['/dangnhap']);
      return false;
    }

    if (this.jwtService.hasRole('Quản lý')) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NhanVienGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.jwtService.isLoggedIn()) {
      this.router.navigate(['/dangnhap']);
      return false;
    }

    const userRole = this.jwtService.getUserRole();
    if (!userRole) {
      this.router.navigate(['/dangnhap']);
      return false;
    }

    // Quản lý có tất cả quyền
    if (userRole === 'Quản lý') {
      return true;
    }

    // Nhân viên chỉ có quyền xem với một số trang
    if (userRole === 'Nhân viên') {
      const path = route.routeConfig?.path;
      const viewOnlyPaths = ['sanpham', 'khuyenmai', 'voucher'];
      const fullAccessPaths = ['banhang', 'hoadon', 'donhang', 'khachhang'];
      
      if (viewOnlyPaths.includes(path || '')) {
        // Component cần tự xử lý việc ẩn các nút thêm/sửa/xóa
        return true;
      }
      
      if (fullAccessPaths.includes(path || '')) {
        return true;
      }
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
} 