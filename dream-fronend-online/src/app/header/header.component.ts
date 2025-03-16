import { Component, OnInit } from '@angular/core';
import { HeaderService } from './header.service';
import { CommonModule } from '@angular/common';
import { BanhangService } from '../banhang/banhang.service'; 
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  timkiem: boolean=false;
  luachon: boolean=false;
  modalCard: boolean = false;
  showResults: boolean = false;
  sanphams: any[] = [];
  gioHang: any[] = []; // Danh sách sản phẩm trong giỏ hàng
  idKhachHang: number = 1; // Giả sử ID khách hàng là 1
  searchQuery: string = ''; // 🔍 Từ khóa tìm kiếm
  isSearching: boolean = false; // Trạng thái tìm kiếm
  searchResults: any[] = []; // Kết quả tìm kiếm
  test:any[]=['a','b','c'];
  tes1: string = '';
  sanpham: any = {
    idSanPhamChiTiet: '',
    tenSanPham: '',
    AnhUrl: '',
    giaGoc: '',
    tenChatLieu: '',
    tenCoAo: '',
    tenThuongHieu: '',
    tenXuatXu: '',
    tenMauSac: '',
    tenSize: '',
    soLuongSanPham:'',
    soLuongGioHang:'',
    hinhThucGiam:true,
    giaTriGiam:''
  };
  khachhang: any = {
    id: '',
    ma: '',
    ten: '',
    gioiTinh: true,
    email: '',
    soDienThoai: '',
    matKhau: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1,
  };

  constructor(private headerService: HeaderService, private banhangService: BanhangService, private router: Router,private cookieService: CookieService) {}

  ngOnInit(): void {
    const khachhangCookie = this.cookieService.get('khachhang'); // Retrieve customer data from the cookie
    if (khachhangCookie) {
      this.khachhang = JSON.parse(khachhangCookie); // Parse and assign the data to khachhang
      this.luachon=true;
    }else{
      this.luachon=false;
    }
    console.log(this.khachhang.email); // Optional: to verify the customer data

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
      return total + item.donGia;
    }, 0);
  }

  cardModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.modalCard = !this.modalCard;
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
          if (data.length == null) {
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
  xoacookie(){
    this.cookieService.delete('khachhang');
  }
  hoso(){
    this.router.navigate(['taikhoan']);
  }
  dangnhap() {
    if (this.khachhang.ten) {
      this.router.navigate(['']); // Chuyển hướng về trang chủ
    } else {
      this.router.navigate(['dangnhap']); // Nếu chưa đăng nhập thì vào trang đăng nhập
    }
  }
  
  
  // searchAndShowSearch(): void {
  //   if (this.searchQuery.trim() === '') {
  //     alert('Vui lòng nhập tên khách hàng để tìm kiếm.');
  //     return;
  //   }

    
  //   this.headerService.searchSanPhamByName(this.searchQuery).subscribe(
  //     (data) => {
  //       if (data.length > 0) {
  //         this.searchResults=data;
  //         console.log(this.searchResults);
  //       } else {
  //         alert('Không tìm thấy khách hàng phù hợp.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Lỗi khi tìm kiếm khách hàng:', error);
  //       alert('Đã xảy ra lỗi khi tìm kiếm.');
  //     }
  //   );
  // }
  
  
  // Xử lý khi chọn sản phẩm từ danh sách
  selectProduct(sanpham: any): void {
    console.log('Sản phẩm được chọn:', sanpham);
    this.router.navigate(['/sanpham', sanpham.id]); // Chuyển hướng đến trang sản phẩm
    this.searchResults = []; // Ẩn dropdown sau khi chọn
  }
  onSearchFocus(): void {
    this.showResults = true;
  }

  // Khi ô tìm kiếm mất tiêu điểm (blur), ẩn kết quả tìm kiếm
  onSearchBlur(): void {
    setTimeout(() => {
      this.showResults = false; // Ẩn kết quả khi mất tiêu điểm
    }, 200); // Thêm thời gian delay để người dùng có thể click vào kết quả
  }
  onSearchChange(): void {
    if (this.searchQuery.trim()) {
      
      this.banhangService.timKiemSanPham(this.searchQuery, 0, 10).subscribe(
        (data) => {
          this.banhangService.setSearchResults(data); // Lưu kết quả vào BanhangService
          
  
          // Kiểm tra nếu không có sản phẩm nào được tìm thấy
          // if (data.length == null) {
          //   alert('Không có sản phẩm nào phù hợp với từ khóa tìm kiếm.');
          // }
        },
        (error) => {
          console.error('Lỗi khi tìm kiếm sản phẩm', error);
          
        }
      );
    } else {
      // Hiển thị thông báo bằng alert khi không có từ khóa tìm kiếm
      alert('Vui lòng nhập từ khóa để tìm kiếm.');
    }
  }
}