import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatToolbarModule, 
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  confirmLogout() {
    const confirmResult = confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (confirmResult) {
      this.router.navigate(['/layout/dangnhap']);
    }
  }
}

