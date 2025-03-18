import { Component, OnInit, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SanphamDetailService } from './sanpham-detail.service';
import { HeaderComponent } from '../header/header.component';
import { HeaderService } from '../header/header.service'
import { Router } from '@angular/router'; 
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
    idKhachHang: number = 2; // Giả sử ID khách hàng = 1
    showModalThanhToan: boolean = false; // mở modal thanh toán
    khachHang: any = {
      tenKhachHang: '',
      soDienThoai: '',
      thon: '',
      tinhThanhPho: null,
      quanHuyen: null,
      phuongXa: null
    };
   
    payMent: any[] = []

  private route = inject(ActivatedRoute);
  private sanphamService = inject(SanphamDetailService);
  // thao tác 2 component
  constructor(private headerService: HeaderService,private router: Router, private sanPhamDetailService: SanphamDetailService) {}

  ngOnInit(): void {
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
    this.filteredDanhSachSize = this.sanPhamList
      .filter(sp => sp.tenMauSac === this.selectedMauSac)
      .map(sp => sp.tenSize)
      .filter((value, index, self) => self.indexOf(value) === index);
  
    // Nếu danh sách size có giá trị, chọn giá trị đầu tiên làm mặc định
    if (this.filteredDanhSachSize.length > 0) {
      this.selectedSize = this.filteredDanhSachSize[0];
    } else {
      this.selectedSize = ""; // Không có size phù hợp
    }
  
    // Tìm sản phẩm theo màu và size đã chọn
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
    this.filteredDanhSachMauSac = this.sanPhamList
      .filter(sp => sp.tenSize === this.selectedSize)
      .map(sp => sp.tenMauSac)
      .filter((value, index, self) => self.indexOf(value) === index);
    // Nếu danh sách màu có giá trị, chọn giá trị đầu tiên làm mặc định
    if (this.filteredDanhSachMauSac.length > 0) {
      this.selectedMauSac = this.filteredDanhSachMauSac[0];
    } else {
      this.selectedMauSac = ""; // Không có màu phù hợp
    }
  
    // Tìm sản phẩm theo màu và size đã chọn
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
    if (this.soLuongMua < 1 || isNaN(this.soLuongMua)) {
      this.soLuongMua = 1;
    } else if (this.soLuongMua > this.selectedSanPham.soLuongSanPham) {
      alert(`Số lượng mua vượt quá số lượng tồn kho`);
      this.soLuongMua = this.selectedSanPham.soLuongSanPham;
    }
  }

  themVaoGio() {
    const sanPhamGioHang = {
        idKhachHang: this.idKhachHang,
        idSanPhamChiTiet: this.selectedSanPham.idSanPhamChiTiet, // Đúng field
        mauSac: this.selectedMauSac,
        size: this.selectedSize,
        soLuong: this.soLuongMua
    };
    console.log("Dữ liệu gửi lên API:", sanPhamGioHang);
    this.headerService.addToCart(sanPhamGioHang).subscribe(response => {
        console.log("Thêm vào giỏ hàng thành công:", response);
        this.headerService.notifyGioHangUpdated();
        this.soLuongMua = 1;
        this.hienToast();
    }, error => {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
    });
  }

  muaNgay() {
    const sanPhamGioHang = {
        idKhachHang: this.idKhachHang,
        idSanPhamChiTiet: this.selectedSanPham.idSanPhamChiTiet, // Đúng field
        mauSac: this.selectedMauSac,
        size: this.selectedSize,
        soLuong: this.soLuongMua
    };
    console.log("Dữ liệu gửi lên API:", sanPhamGioHang);
    this.headerService.muaNgay(sanPhamGioHang).subscribe(response => {
        console.log("Thêm vào giỏ hàng thành công:", response);
        this.headerService.notifyGioHangUpdated();
        this.soLuongMua = 1;
        this.router.navigate(['/hoadon']);
    }, error => {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
    });
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
    this.headerService.getPayMent(this.idKhachHang).subscribe((data) => {
      this.payMent = data;
    });
  }

  addSanPhamPayMent(){
    const sanPhamPayment = {
      idKhachHang: this.idKhachHang,
      idSanPhamChiTiet: this.selectedSanPham.idSanPhamChiTiet, // Đúng field
      mauSac: this.selectedMauSac,
      size: this.selectedSize,
      soLuong: this.soLuongMua
  };
  console.log("Dữ liệu gửi lên API:", sanPhamPayment);
  this.headerService.addToPayment(sanPhamPayment).subscribe(response => {
      // console.log("Thêm vào giỏ hàng thành công:", response);
      this.headerService.notifyGioHangUpdated();
      this.soLuongMua = 1;
  }, error => {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
  });
  }
  
  closeModalThanhToan(){
    this.showModalThanhToan = false;
  }

  // hiện modal thanh toán bên header
  closeModalThanhToanHeader(){
    this.headerService.closeModalThanhToan();
  }
  // mở modal giỏ hàng
  // openModalGioHang(event: Event): void {
  //   this.sanPhamDetailService.toggleModal(); 
  // }

}