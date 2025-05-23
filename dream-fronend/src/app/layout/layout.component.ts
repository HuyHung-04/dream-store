import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LayoutService } from './layout.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  nhanViens: any[] = [];
  hoaDons: any[] = [];
  selectedNhanVienId: string | null = null;
  showModal: boolean = false;
  confirmLogoutDialog: boolean = false;
  soHoaDonChuaThanhToan: number = 0;

  constructor(private dialog: MatDialog, private router: Router, private layoutService: LayoutService) { }

  ngOnInit(): void {
    this.loadNhanViens(); // Tải danh sách nhân viên khi component khởi tạo
  }

  confirmLogout() {
  const idNhanVien = localStorage.getItem('idNhanVien');

  if (!idNhanVien) {
    alert('Không tìm thấy nhân viên đăng nhập.');
    return;
  }

  this.layoutService.getHoaDonByNhanVienId(Number(idNhanVien)).subscribe({
    next: (hoaDons) => {
      const soHoaDonChuaThanhToan = hoaDons.length;

      if (soHoaDonChuaThanhToan > 0) {
        // ✅ Thay vì dùng confirm, mở modal tùy chỉnh
        this.soHoaDonChuaThanhToan = soHoaDonChuaThanhToan;
        this.confirmLogoutDialog = true;
      } else {
        const confirmOut = confirm("Bạn có chắc chắn muốn đăng xuất không?");
        if (confirmOut) {
          this.thucHienDangXuat();
        }
      }
    },
    error: (err) => {
      console.error('Lỗi khi kiểm tra hóa đơn:', err);
    }
  });
}


  thucHienDangXuat(): void {
    this.showModal = false;
    localStorage.removeItem('access_token');
    localStorage.removeItem('idNhanVien');
    this.router.navigate(['/layout/dangnhap']);
  }

  accessNhanVien() {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_Quản lý') {
      this.router.navigate(['/layout/nhanvien']);
    } else {
      alert('Bạn không có quyền truy cập chức năng quản lý Nhân viên.');
    }
  }

  accessThongKe() {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_Quản lý') {
      this.router.navigate(['/layout/thongke']);
    } else {
      alert('Bạn không có quyền truy cập chức năng thống kê.');
    }
  }

  loadNhanViens(): void {
    const idNhanVien = localStorage.getItem('idNhanVien');
    this.layoutService.getAllNhanVienExcept(Number(idNhanVien)).subscribe(
      (data) => {
        this.nhanViens = data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
      }
    );
  }

  loadHoaDons(): void {
    const idNhanVien = localStorage.getItem('idNhanVien');
    if (idNhanVien) {
      this.layoutService.getHoaDonByNhanVienId(Number(idNhanVien)).subscribe({
        next: (data) => {
          this.hoaDons = data;
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách hóa đơn:', err);
        }
      });
    } else {
      console.warn('Không tìm thấy idNhanVien trong localStorage.');
    }
  }

  onSelectNhanVien(id: string): void {
    this.selectedNhanVienId = id;
    console.log("id", this.selectedNhanVienId)
  }


  closeModal(): void {
    this.showModal = false;
  }

  xacNhanBanGiaoVaDangXuat(): void {
    const idNhanVienCu = localStorage.getItem('idNhanVien');
    const idNhanVienMoi = this.selectedNhanVienId;

    if (!idNhanVienCu || !idNhanVienMoi) {
      alert('Vui lòng chọn nhân viên để bàn giao hóa đơn.');
      return;
    }

    const confirmed = window.confirm('Bạn có chắc chắn muốn bàn giao hóa đơn cho nhân viên này và đăng xuất không ?');
    if (!confirmed) {
      return;
    }

    this.layoutService.banGiaoHoaDonChoNhanVienMoi(+idNhanVienCu, +idNhanVienMoi).subscribe({
      next: () => {
        alert('Bàn giao hóa đơn thành công.');
        this.thucHienDangXuat();
      },
      error: (err) => {
        alert(err.error.error);
      }
    });
  }

  onBanGiao() {
  this.confirmLogoutDialog = false;
  this.showModal = true; 
}

onHuyHoaDon() {
  const idNhanVien = localStorage.getItem('idNhanVien');
  if (idNhanVien) {
    this.layoutService.deleteHoaDonChuaThanhToan(Number(idNhanVien)).subscribe({
      next: () => {
        this.thucHienDangXuat();
      },
      error: (err) => {
        alert('Đăng xuất thành công');
        this.thucHienDangXuat();
      }
    });
  }
  this.confirmLogoutDialog = false;
}

onCloseConfirmLogout() {
  this.confirmLogoutDialog = false;
}

}

