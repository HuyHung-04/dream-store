import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.jwtService.isTokenValid()) {
      return true;
    }

    // Nếu không có token hoặc token hết hạn, chuyển hướng về trang đăng nhập
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
} 