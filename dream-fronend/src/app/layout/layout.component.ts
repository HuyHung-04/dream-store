import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { JwtService } from '../services/jwt.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isLoggedIn = false;
  username?: string;
  isMenuCollapsed = true;
  isQuanLy = false;
  isLoading = false;
  showUnauthorized = false;

  constructor(
    private tokenStorageService: TokenStorageService,
    private jwtService: JwtService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.showUnauthorized = false;
      } else if (event instanceof NavigationEnd) {
        this.isLoading = false;
      } else if (event instanceof NavigationError) {
        this.isLoading = false;
        if (event.error.status === 403) {
          this.showUnauthorized = true;
        }
      }
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.username;
      this.isQuanLy = this.jwtService.hasRole('Quản lý');
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.isLoggedIn = false;
    this.router.navigate(['/dangnhap']);
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  goToHome(): void {
    this.router.navigate(['/layout/banhang']);
  }
}

