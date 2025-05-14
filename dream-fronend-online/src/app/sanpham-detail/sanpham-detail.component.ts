import { Component, OnInit, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SanphamDetailService } from './sanpham-detail.service';
import { HeaderComponent } from '../header/header.component';
import { HeaderService } from '../header/header.service'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-sanpham-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './sanpham-detail.component.html',
  styleUrl: './sanpham-detail.component.css'
})
export class SanphamDetailComponent implements OnInit {
  sanPhamList: any[] = [];
  danhSachMauSac: any[] = [];
  danhSachSize: any[] = [];
  danhSachAnh: string[] = [];
  selectedSanPham: any = null;
  hinhThucGiam: any = null;
  giaTriGiam: any = null;
  selectedSize: string = '';
  selectedMauSac: string = '';
  soLuongMua: number = 1;
  filteredDanhSachMauSac: any[] = [];
  filteredDanhSachSize: any[] = [];
  showModalThanhToan: boolean = false; // mở modal thanh toán
  khachHang: any = {
    tenKhachHang: '',
    soDienThoai: '',
    thon: '',
    tinhThanhPho: null,
    quanHuyen: null,
    phuongXa: null
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
    trangThai: null,
    otpHash: '',
    trangThaiOtp: null
  };

  payMent: any[] = []

  private route = inject(ActivatedRoute);
  private sanphamService = inject(SanphamDetailService);
  // thao tác 2 component
  constructor(private headerService: HeaderService, private router: Router, private sanPhamDetailService: SanphamDetailService, private cookieService: CookieService) { }

  ngOnInit(): void {
    const khachhangCookie = this.cookieService.get('khachhang');
    if (khachhangCookie) {
      this.khachhang = JSON.parse(khachhangCookie);
    }

    console.log("Khách hàng hiện tại:", this.khachhang);
    this.loadSanPhamChiTiet();

    this.filteredDanhSachSize = this.danhSachSize;
    this.filteredDanhSachMauSac = this.danhSachMauSac;
    this.updateFilteredLists();
    if (this.selectedMauSac) {
      this.onSelectionChange();
    }

    // hiện modal thanh toán header
    this.headerService.modalThanhToan$.subscribe(status => {
      console.log("Trạng thái modal từ HeaderService:", status); // Debug
      this.showModalThanhToan = status;
    });

    this.headerService.loadSanPham$.subscribe(() => {
      this.loadSanPhamChiTiet();  
    });
  }

  loadSanPhamChiTiet(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sanphamService.getSanPhamById(id).subscribe({
        next: (data) => {
          // console.log("Dữ liệu sản phẩm từ API:", data);
          if (Array.isArray(data) && data.length > 0) {
            this.sanPhamList = data;
            this.selectedSanPham = data[0]; // Chọn sản phẩm đầu tiên làm mặc định
            this.danhSachAnh = [...new Set(data.map(sp => sp.anhUrl))];
            this.giaTriGiam = data[0].giaTriGiam ?? 0, // Nếu undefined, gán về 0
              this.hinhThucGiam = data[0].hinhThucGiam ?? false, // Nếu undefined, gán false

              // Lấy danh sách màu sắc và size từ danh sách sản phẩm
              this.updateFilteredLists();

            // Chọn màu sắc và size đầu tiên từ danh sách lọc được
            if (this.filteredDanhSachMauSac.length > 0) {
              this.selectedMauSac = this.filteredDanhSachMauSac[0];
            }
            if (this.filteredDanhSachSize.length > 0) {
              this.selectedSize = this.filteredDanhSachSize[0];
            }

            // Cập nhật sản phẩm được chọn
            this.updateSelectedSanPham();
          }
        },
        error: (err) => console.error('Lỗi khi lấy dữ liệu sản phẩm:', err)
      });
    }
  }

  loadMauSac(): void {
    this.sanphamService.getMauSac().subscribe({
      next: (data) => {
        // console.log("Dữ liệu màu sắc:", data); // Kiểm tra dữ liệu nhận được
        this.danhSachMauSac = data;
        if (data.length > 0) {
          this.selectedMauSac = data[0].tenMauSac;
        }
      },
      error: (err) => console.error("Lỗi khi lấy danh sách màu sắc:", err)
    });
  }

  loadSize(): void {
    this.sanphamService.getSizes().subscribe({
      next: (data) => {
        // console.log("Dữ liệu kích thước:", data); // Kiểm tra dữ liệu nhận được
        this.danhSachSize = data;
        if (data.length > 0) {
          this.selectedSize = data[0].tenSize;
        }
      },
      error: (err) => console.error("Lỗi khi lấy danh sách size:", err)
    });
  }

  onSelectionChange() {
    if (!this.selectedMauSac) return;

    // Lọc danh sách size tương ứng với màu sắc đã chọn
    const availableSizes = this.sanPhamList
      .filter(sp => sp.tenMauSac === this.selectedMauSac)
      .map(sp => sp.tenSize)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Chỉ cập nhật filteredDanhSachSize, không reset selectedSize nếu nó vẫn hợp lệ
    this.filteredDanhSachSize = availableSizes;

    // Nếu size hiện tại không có trong danh sách size mới, thì mới chọn size đầu tiên
    if (!this.selectedSize || !availableSizes.includes(this.selectedSize)) {
      this.selectedSize = availableSizes.length > 0 ? availableSizes[0] : "";
    }

    this.updateSelectedSanPham();
  }

  updateSelectedSanPham() {
    if (!this.selectedMauSac || !this.selectedSize) return;

    const found = this.sanPhamList.find(sp =>
      sp.tenMauSac === this.selectedMauSac && sp.tenSize === this.selectedSize
    );

    if (found) {
      this.selectedSanPham = found;
      console.log("Sản phẩm đã chọn:", this.selectedSanPham);
    }
  }


  onSizeChange() {
    if (!this.selectedSize) return;

    // Lọc danh sách màu tương ứng với size đã chọn
    const availableColors = this.sanPhamList
      .filter(sp => sp.tenSize === this.selectedSize)
      .map(sp => sp.tenMauSac)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Chỉ cập nhật filteredDanhSachMauSac, không reset selectedMauSac nếu nó vẫn hợp lệ
    this.filteredDanhSachMauSac = availableColors;

    // Nếu màu hiện tại không có trong danh sách màu mới, thì mới chọn màu đầu tiên
    if (!this.selectedMauSac || !availableColors.includes(this.selectedMauSac)) {
      this.selectedMauSac = availableColors.length > 0 ? availableColors[0] : "";
    }

    this.updateSelectedSanPham();
  }

  updateFilteredLists() {
    this.filteredDanhSachMauSac = this.sanPhamList
      .map(sp => sp.tenMauSac)
      .filter((value, index, self) => self.indexOf(value) === index);

    this.filteredDanhSachSize = this.sanPhamList
      .map(sp => sp.tenSize)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  tinhGiaSauGiam(): number {
    if (!this.selectedSanPham || this.selectedSanPham.giaGoc == null) {
      return this.selectedSanPham?.giaGoc || 0;
    }

    const giaGoc = this.selectedSanPham.giaGoc;
    const giaTriGiam = this.selectedSanPham.giaTriGiam ?? 0; // Đảm bảo giá trị giảm không bị undefined
    const hinhThucGiam = this.selectedSanPham.hinhThucGiam; // true: theo tiền, false: theo %

    return hinhThucGiam
      ? Math.max(0, giaGoc - giaTriGiam)  // Giảm theo số tiền
      : Math.max(0, giaGoc - (giaGoc * giaTriGiam / 100)); // Giảm theo %
  }

  giamSoLuong() {
    if (this.soLuongMua > 1) {
      this.soLuongMua--;
    }
  }

  tangSoLuong() {
    if (this.soLuongMua < this.selectedSanPham.soLuongSanPham) {
      this.soLuongMua++;
    } else {
      alert(`Số lượng mua vượt quá số lượng tồn kho`);
    }
  }


  kiemTraSoLuong() {
    // Chuyển đổi sang number (phòng trường hợp nhập text)
    this.soLuongMua = Number(this.soLuongMua);

    // Kiểm tra hợp lệ
    if (isNaN(this.soLuongMua)) {
      this.soLuongMua = 1;
      return;
    }

    // Làm tròn nếu nhập số thập phân
    this.soLuongMua = Math.floor(this.soLuongMua);

    // Validate số lượng
    if (this.soLuongMua < 1) {
      this.soLuongMua = 1;
    } else if (this.selectedSanPham && this.soLuongMua > this.selectedSanPham.soLuongSanPham) {
      alert(`Số lượng mua vượt quá số lượng tồn kho`);
      this.soLuongMua = this.selectedSanPham.soLuongSanPham;
    }
  }

  themVaoGio() {
    if (!this.khachhang.id) {
      alert("Bạn cần đăng nhập mới có thể thêm sản phẩm vào giỏ hàng.");
      return;
    }

    const idKhachHang = this.khachhang.id;
    const idSanPhamChiTiet = this.selectedSanPham.idSanPhamChiTiet;
    const soLuongTonKho = this.selectedSanPham.soLuongSanPham;

    // Gọi API lấy giỏ hàng của khách hàng
    this.headerService.getGioHang(idKhachHang).subscribe((gioHangList) => {
      const gioItem = gioHangList.find(item => item.idSanPhamChiTiet === idSanPhamChiTiet);
      const soLuongTrongGio = gioItem?.soLuong || 0;
      const tong = soLuongTrongGio + this.soLuongMua;

      if (tong > soLuongTonKho) {
        alert(`Số lượng sản phẩm thêm đang vượt quá số lượng tồn kho. Vui lòng thử lại`);
        return;
      }

      // Nếu hợp lệ thì thêm
      const sanPhamGioHang = {
        idKhachHang: idKhachHang,
        idSanPhamChiTiet: idSanPhamChiTiet,
        mauSac: this.selectedMauSac,
        size: this.selectedSize,
        soLuong: this.soLuongMua
      };

      this.headerService.addToCart(sanPhamGioHang).subscribe({
        next: (res) => {
          this.headerService.notifyGioHangUpdated();
          this.soLuongMua = 1;
          this.hienToast();
        },
        error: (err) => {
          const errorMessage = err?.error?.error || "Đã xảy ra lỗi khi thêm vào giỏ hàng.";
          alert(errorMessage);
          this.loadSanPhamChiTiet()
        }
      });
    });
  }


  muaNgay() {
    if (!this.khachhang.id) {
      alert("Bạn cần đăng nhập mới có thể mua sản phẩm");
      return;
    }

    const sanPhamGioHang = {
      idKhachHang: this.khachhang.id, // Lấy ID khách hàng từ đối tượng `khachhang`
      idSanPhamChiTiet: this.selectedSanPham.idSanPhamChiTiet,
      mauSac: this.selectedMauSac,
      size: this.selectedSize,
      soLuong: this.soLuongMua
    };

    console.log("Dữ liệu gửi lên API:", sanPhamGioHang);

    this.headerService.muaNgay(sanPhamGioHang).subscribe(
      (response) => {
        console.log("Thêm vào giỏ hàng thành công:", response);
        this.headerService.notifyGioHangUpdated();
        this.soLuongMua = 1;
        this.router.navigate(['/hoadon']);
      },
      (error) => {
        const message = error?.error?.error || "Đã xảy ra lỗi khi mua sản phẩm.";
        alert(message);
        this.loadSanPhamChiTiet()
      }
    );
  }


  // // code modalThanhToan khi ấn mua ngay/////////////////////////////////

  // Hàm hiển thị Toast
  hienToast() {
    var toastElement = document.getElementById('toastGioHang');
    if (toastElement) {
      (toastElement as any).classList.add('show'); // Hiển thị Toast
      setTimeout(() => {
        (toastElement as any).classList.remove('show'); // Ẩn Toast sau 3 giây
      }, 3000);
    }
  }


  loadKhachHang(idKhachHang: number) {
    this.sanphamService.getThongTinKhachHang(idKhachHang).subscribe(
      (data) => {
        console.log("Dữ liệu khách hàng nhận được:", data);

        // Kiểm tra nếu data là một mảng và có ít nhất một phần tử
        if (Array.isArray(data) && data.length > 0) {
          this.khachHang = data[0]; // Lấy phần tử đầu tiên
        } else {
          console.warn("Không có dữ liệu khách hàng!");
          this.khachHang = null; // Để tránh lỗi binding trên giao diện
        }

        this.showModalThanhToan = true;
      },
      (error) => {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
      }
    );
  }

  loadPayMent(): void {
    if (!this.khachhang.id) {
      console.warn("Chưa có khách hàng đăng nhập, không thể tải phương thức thanh toán!");
      return;
    }

    this.headerService.getPayMent(this.khachhang.id).subscribe(
      (data) => {
        this.payMent = data;
      },
      (error) => {
        console.error("Lỗi khi tải phương thức thanh toán:", error);
      }
    );
  }

  addSanPhamPayMent() {
    if (!this.khachhang.id) {
      console.warn("Chưa có khách hàng đăng nhập, không thể thêm sản phẩm vào thanh toán!");
      return;
    }

    const sanPhamPayment = {
      idKhachHang: this.khachhang.id, // Lấy ID khách hàng từ đối tượng `khachhang`
      idSanPhamChiTiet: this.selectedSanPham.idSanPhamChiTiet,
      mauSac: this.selectedMauSac,
      size: this.selectedSize,
      soLuong: this.soLuongMua
    };

    console.log("Dữ liệu gửi lên API:", sanPhamPayment);

    this.headerService.addToPayment(sanPhamPayment).subscribe(
      (response) => {
        this.headerService.notifyGioHangUpdated();
        this.soLuongMua = 1;
      },
      (error) => {
        console.error("Lỗi khi thêm vào thanh toán:", error);
      }
    );
  }

  closeModalThanhToan() {
    this.showModalThanhToan = false;
  }

  // hiện modal thanh toán bên header
  closeModalThanhToanHeader() {
    this.headerService.closeModalThanhToan();
  }
  // mở modal giỏ hàng
  // openModalGioHang(event: Event): void {
  //   this.sanPhamDetailService.toggleModal(); 
  // }

}

