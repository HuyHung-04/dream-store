import { Component, OnInit } from '@angular/core';
import { HeaderService } from './header.service';
import { CommonModule } from '@angular/common';
import { BanhangService } from '../banhang/banhang.service'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { CookieService } from 'ngx-cookie-service';
import { HoadonService } from '../hoadon/hoadon.service';
import { SanphamDetailService } from '../sanpham-detail/sanpham-detail.service';

@Component({
  selector: 'app-header',
  standalone: true,
    imports: [CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  timkiem: boolean=false;
  luachon: boolean=false;
  modalCard: boolean = false;
  showResults: boolean = false;
  gioHang: any[] = []; // Danh sách sản phẩm trong giỏ hàng
  searchQuery: string = ''; // Từ khóa tìm kiếm
  isSearching: boolean = false; // Trạng thái tìm kiếm
  searchResults: any[] = []; // Kết quả tìm kiếm
  gioHangIds: number[] = [];
  sanphams: any[] = [];
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
  newOrderCount: number = 0;

  constructor(private headerService: HeaderService,private banhangService: BanhangService,
     private router: Router,private cookieService: CookieService, private hoaDonService: HoadonService, private sanPhamDetailService: SanphamDetailService) {}

  ngOnInit(): void {
    const khachhangCookie = this.cookieService.get('khachhang'); // Retrieve customer data from the cookie
    if (khachhangCookie) {
      this.khachhang = JSON.parse(khachhangCookie); // Parse and assign the data to khachhang
      this.luachon=true;
    }else{
      this.luachon=false;
    }
    this.loadGioHang();

    this.headerService.gioHangUpdated$.subscribe(() => {
      this.loadGioHang(); // Cập nhật giỏ hàng ngay lập tức
     });
     // thông báo lịch sử đơn hàng
     this.hoaDonService.newOrderCount$.subscribe((count) => {
      this.newOrderCount += count; // Cập nhật số đơn hàng mới
    });
  }

  loadGioHang(): void {
    if (!this.khachhang.id) {
      console.warn("Chưa có khách hàng đăng nhập!");
      return;
    }
  
    this.headerService.getGioHang(this.khachhang.id).subscribe(
      (data) => {
        this.gioHang = data;
        console.log("Dữ liệu giỏ hàng:", data);
      },
      (error) => {
        console.error("Lỗi khi tải giỏ hàng:", error);
      }
    );
  }
  
  

  xoaSanPham(id: number) {
    this.headerService.deleteFromCart(id).subscribe(() => {
      alert('Bạn chắc chắn muốn xoá');
      this.headerService.notifyGioHangUpdated(); // Cập nhật giỏ hàng sau khi xoá
    });
  }

  suaSoLuong(id: number, soLuongMoi: number) {
    // Tìm sản phẩm trong giỏ hàng theo ID giỏ
    const gioHangItem = this.gioHang.find(item => item.id === id);
    if (!gioHangItem) {
      alert("Không tìm thấy sản phẩm trong giỏ hàng.");
      return;
    }

    const idSanPhamChiTiet = gioHangItem.idSanPhamChiTiet;
    console.log(idSanPhamChiTiet)
    // Gọi API để lấy thông tin sản phẩm chi tiết (bao gồm tồn kho)
    this.sanPhamDetailService.getGioHangChiTietById(idSanPhamChiTiet).subscribe(
      (sanPhamChiTiet) => {
        const soLuongTonKho = sanPhamChiTiet;
        console.log(sanPhamChiTiet)
        if (soLuongMoi > soLuongTonKho) {
          alert(`Số lượng bạn nhập đang vượt quá tồn kho hiện tại.`);
          return;
        }

        // ✅ Nếu hợp lệ, gọi API để cập nhật
        this.headerService.updateSoLuong(id, soLuongMoi).subscribe((response) => {
          console.log("✅ Cập nhật số lượng thành công:", response);
          this.headerService.notifyGioHangUpdated(); // Cập nhật lại giỏ hàng
        });
      },
      (error) => {
        console.error("❌ Lỗi khi lấy thông tin sản phẩm:", error);
        alert("Không thể kiểm tra tồn kho. Vui lòng thử lại.");
      }
    );
  }

  getTongTien(): number {
    return this.gioHang.reduce((total, item) => {
      return total + item.donGia * item.soLuong;
    }, 0);
  }
  
  cardModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.modalCard = !this.modalCard;
    this.headerService.closeModalThanhToan();
    // this.sanPhamDetailService.toggleModal();
  }

  // openModalThanhToan() {
  //   console.log("Nút Thanh toán được ấn!"); // Debug
  //   this.headerService.openModalThanhToan();
  // }

  onThanhToan() {
    if (!this.khachhang.id) {
      alert("Bạn cần đăng nhập để tiếp tục");
      return;
    }
  
    this.headerService.getGioHangIdsForThanhToan(this.khachhang.id).subscribe(
      (ids) => {
        this.gioHangIds = ids;
        this.router.navigate(['/hoadon']);
      },
      (error) => {
        console.error('Lỗi khi lấy giỏ hàng:', error);
      }
    );
  }
  
  // Gọi phương thức tìm kiếm khi người dùng nhấn nút tìm kiếm hoặc Enter
  searchSanPham(page: number = 0): void {
    if (this.searchQuery.trim()) {
      this.banhangService.setIsSearching(true);
      
    }else{
      this.banhangService.setIsSearching(false);

    }
    
      this.isSearching = true;
      this.banhangService.timKiemSanPham(this.searchQuery, page, 10).subscribe(
        (data) => {
          this.banhangService.setSearchResults(data); // Lưu kết quả vào BanhangService
          this.isSearching = false;
  
          // Kiểm tra nếu không có sản phẩm nào được tìm thấy
          // if (data.content.length ===0) {
          //   alert('Không có sản phẩm nào phù hợp với từ khóa tìm kiếm.');
          // }
        },
        (error) => {
          console.error('Lỗi khi tìm kiếm sản phẩm', error);
          this.isSearching = false;
        }
      );
   
  }
  xoacookie(){
    if (window.confirm('Bạn có muốn đăng xuất không?')) {
      this.cookieService.delete('khachhang');
    }
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
    
  }

  viewInvoiceHistory(event: Event) {
    event.preventDefault();
    console.log('Xem lịch sử đơn hàng');
    this.router.navigate(['/lichsudonhang']);

    this.newOrderCount = 0; // Xóa số thông báo khi người dùng xem đơn hàng
  }

  scrollToProducts() {
    if (this.router.url.includes('/ban-hang')) {
      // Nếu đã ở trang bán hàng thì chỉ cần cuộn xuống danh sách sản phẩm
      this.router.navigate([], {
        queryParams: { scroll: new Date().getTime() }, // Luôn thay đổi query để đảm bảo trigger
        queryParamsHandling: 'merge'
      });
    } else {
      // Nếu đang ở trang khác, điều hướng đến trang bán hàng rồi mới cuộn
      this.router.navigate(['/ban-hang'], {
        queryParams: { scroll: new Date().getTime() }
      });
    }
  }
  
  
}
