import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NhanvienService } from './nhanvien.service'; // Import service

@Component({
  selector: 'app-nhanvien',
  standalone: true, // Standalone component
  imports: [CommonModule], // Import CommonModule để hỗ trợ *ngFor, *ngIf
  templateUrl: './nhanvien.component.html',
  styleUrls: ['./nhanvien.component.css'],
})
export class NhanvienComponent implements OnInit {
  nhanviens: any[] = []; // Danh sách nhân viên
  error: string | null = null; // Lỗi nếu có

  constructor(private nhanvienService: NhanvienService) {}

  ngOnInit(): void {
    this.loadNhanViens();
  }

  /**
   * Hàm tải danh sách nhân viên từ backend
   */
  loadNhanViens(): void {
    this.nhanvienService.getAllNhanVien().subscribe({
      next: (data) => {
        this.nhanviens = data;
        console.log('Danh sách nhân viên:', this.nhanviens);
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách nhân viên.';
        console.error('Lỗi khi tải nhân viên:', err);
      },
    });
  }
}
