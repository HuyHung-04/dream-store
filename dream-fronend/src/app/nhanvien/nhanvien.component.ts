import { Component, OnInit } from '@angular/core';
import { NhanvienService } from './nhanvien.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-nhanvien',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule cần được thêm ở đây
  templateUrl: './nhanvien.component.html',
  styleUrls: ['./nhanvien.component.css'],
  
})
export class NhanvienComponent implements OnInit {
  nhanviens: any[] = []; // Danh sách nhân viên
  filteredNhanViens: any[] = []; // Danh sách đã lọc
  searchQuery: string = ''; // Từ khóa tìm kiếm
  statusFilter: string = ''; // Lọc trạng thái

  constructor(private nhanvienService: NhanvienService) {}

  ngOnInit(): void {
    this.loadNhanViens();
  }

  loadNhanViens(): void {
    this.nhanvienService.getAllNhanVien().subscribe({
      next: (data) => {
        this.nhanviens = data;
        this.filteredNhanViens = data;
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu:', err);
      },
    });
  }

  applyFilter(): void {
    this.filteredNhanViens = this.nhanviens.filter((nv) => {
      const matchesSearch =
        nv.ten.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        nv.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        nv.ma.includes(this.searchQuery);
      const matchesStatus =
        this.statusFilter === '' || nv.trangThai === +this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  createAccount(): void {
    console.log('Tạo tài khoản mới');
  }

  editNhanVien(id: number): void {
    console.log('Sửa nhân viên ID:', id);
  }

  deleteNhanVien(id: number): void {
    console.log('Xóa nhân viên ID:', id);
  }
}
