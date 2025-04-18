import { Injectable } from '@angular/core';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor(private tokenStorageService: TokenStorageService) { }

  // Lưu token vào localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Xóa token khỏi localStorage
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Lưu thông tin user vào localStorage
  saveUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Lấy thông tin user từ localStorage
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Xóa thông tin user khỏi localStorage
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Kiểm tra token có hợp lệ không
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  // Giải mã token
  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  // Lấy role từ token
  getUserRole(): string | null {
    const user = this.tokenStorageService.getUser();
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
    return user.roles[0];
  }

  // Kiểm tra user có quyền truy cập không
  hasRole(role: string): boolean {
    const user = this.tokenStorageService.getUser();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  // Đăng xuất
  logout(): void {
    this.removeToken();
    this.removeUser();
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorageService.getToken();
  }
} 