import { Component, OnInit } from '@angular/core';
import { HeaderService } from './header.service';
import { CommonModule } from '@angular/common';
import { BanhangService } from '../banhang/banhang.service'; 
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-header',
  standalone: true,
    imports: [CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  modalCard: boolean = false;
  gioHang: any[] = []; // Danh sách sản phẩm trong giỏ hàng
  idKhachHang: number = 2; // Giả sử ID khách hàng là 1
  searchQuery: string = ''; // Từ khóa tìm kiếm
  isSearching: boolean = false; // Trạng thái tìm kiếm
  searchResults: any[] = []; // Kết quả tìm kiếm
  
  constructor(private headerService: HeaderService,private banhangService: BanhangService) {}

  ngOnInit(): void {
    this.loadGioHang();

    this.headerService.gioHangUpdated$.subscribe(() => {
      this.loadGioHang(); // Cập nhật giỏ hàng ngay lập tức
  });
  }

  loadGioHang(): void {
    this.headerService.getGioHang(this.idKhachHang).subscribe((data) => {
      this.gioHang = data;
    });
  }
  

  xoaSanPham(id: number) {
    this.headerService.deleteFromCart(id).subscribe(() => {
      alert('Bạn chắc chán muốn xoá');
      this.headerService.notifyGioHangUpdated(); // Cập nhật giỏ hàng sau khi xoá
    });
  }

  suaSoLuong(id: number, soLuongMoi: number) {
    this.headerService.updateSoLuong(id, soLuongMoi).subscribe(() => {
      this.headerService.notifyGioHangUpdated(); // Cập nhật giỏ hàng sau khi thay đổi số lượng
    });
  }

  getTongTien(): number {
    return this.gioHang.reduce((total, item) => {
      // console.log(`Sản phẩm: ${item.tenSanPham} - Đơn giá đã nhân số lượng: ${item.donGia}`);
      return total + item.donGia; 
    }, 0);
  }
  
  cardModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.modalCard = !this.modalCard;
    this.headerService.closeModalThanhToan();
  }

  openModalThanhToan() {
    console.log("Nút Thanh toán được ấn!"); // Debug
    this.headerService.openModalThanhToan();
  }


  // Gọi phương thức tìm kiếm khi người dùng nhấn nút tìm kiếm hoặc Enter
  searchSanPham(page: number = 0): void {
    if (this.searchQuery.trim()) {
      this.isSearching = true;
      this.banhangService.timKiemSanPham(this.searchQuery, page, 10).subscribe(
        (data) => {
          this.banhangService.setSearchResults(data); // Lưu kết quả vào BanhangService
          this.isSearching = false;
  
          // Kiểm tra nếu không có sản phẩm nào được tìm thấy
          if (data.length.content ===0) {
            alert('Không có sản phẩm nào phù hợp với từ khóa tìm kiếm.');
          }
        },
        (error) => {
          console.error('Lỗi khi tìm kiếm sản phẩm', error);
          this.isSearching = false;
        }
      );
    } else {
      // Hiển thị thông báo bằng alert khi không có từ khóa tìm kiếm
      alert('Vui lòng nhập từ khóa để tìm kiếm.');
    }
  }
  
  
}
