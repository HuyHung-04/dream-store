import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { BanhangService } from './banhang.service';

@Component({
  selector: 'app-banhang',
  templateUrl: './banhang.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    CommonModule
  ],
  styleUrls: ['./banhang.component.css']
})
export class BanhangComponent implements OnInit {
  searchText: string = '';
  selectedCategory: string = '';
  invoices: any[] = [];
  discountCode: string = '';
  discountAmount: number = 0;
  hienThiDanhSachKhachHang: boolean = false;
  danhSachKhachHang: any[] = [];
  danhSachNhanVien: any[] = [];
  selectedNhanVien: any;
  sanPhams: any[] = [];
  page: number = 0;
  size: number = 4;
  totalPages: number = 0;
  cart: any[] = [];
  categories: string[] = ['Nike Mercurial', 'Nike Phantom', 'Nike Tiempo'];
  soDienThoai: string = '';
  tenKhachHang: string = '';
  selectedInvoice: any = null;
  selectedKhachHang: any = null;
  discountCodes: any[] = [];
  selectedDiscount: any = null;
  paymentMethods: any[] = [];
  selectedPaymentMethod: string = '';


  constructor(private banhangService: BanhangService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.layDanhSachNhanVien();
    this.loadSanPhamToBanHang();
    this.getVoucher();
    this.loadPaymentMethods();
    this.loadInvoices();
    this.cart = [];

  }

  // Tạo hóa đơn mới
  createInvoice() {
    if (!this.selectedKhachHang || this.tenKhachHang === 'Không tìm thấy') {
      alert('Vui lòng nhập số điện thoại khách hàng hợp lệ trước khi tạo hóa đơn.');
      return;
    }
    const request = {
      idKhachHang: this.selectedKhachHang.id,
      idNhanVien: this.selectedNhanVien,
      idVoucher: this.selectedDiscount ? this.selectedDiscount.id : 1,
      idPhuongThucThanhToan: 1,
      tenNguoiNhan: this.tenKhachHang,
      sdtNguoiNhan: this.soDienThoai,
      diaChiNhanHang: '',
      hinhThucThanhToan: '',
      phiVanChuyen: 0,
      tongTienTruocVoucher: 0,
      tongTienThanhToan: 0,
      ngayNhanDuKien: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      trangThai: 5,
      ghiChu: ''
    };

    this.banhangService.createHoaDon(request).subscribe(
      (response) => {
        this.invoices.push(response);
        this.invoices = [...this.invoices];
        this.selectInvoice(response);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi khi tạo hóa đơn:', error);
      }
    );
  }

  // Chọn hóa đơn và load thông tin chi tiết
  selectInvoice(response: any) {
    if (!response || !response.id) {
      console.error("Response hoặc response.id không hợp lệ", response);
      return;
    }
    this.selectedInvoice = response;
    this.cart = [];
    this.banhangService.getHoaDonById(response.id).subscribe(
      (hoaDon: any) => {
        this.selectedInvoice = hoaDon;
        // Load thông tin khách hàng
        this.banhangService.getKhachHangById(hoaDon.idKhachHang).subscribe(
          (khachHang: any) => {
            if (khachHang) {
              this.selectedKhachHang = khachHang;
              this.tenKhachHang = khachHang.ten || 'Không tìm thấy';
              this.soDienThoai = khachHang.soDienThoai || '';
            }
          },
          (error) => console.error('Lỗi khi lấy thông tin khách hàng:', error)
        );
        // Load thông tin nhân viên (nếu có)
        if (hoaDon.idNhanVien !== undefined && hoaDon.idNhanVien !== null) {
          // @ts-ignore
          this.banhangService.getNhanVienById(hoaDon.idNhanVien).subscribe(
            (nhanVien: any) => {
              if (nhanVien) {
                this.selectedNhanVien = nhanVien.id;
              }
            },
            (error) => console.error('Lỗi khi lấy thông tin nhân viên:', error)
          );
        } else {
          console.warn('idNhanVien không hợp lệ:', hoaDon.idNhanVien);
        }
        this.layChiTietHoaDon();
        this.getTotal();
      },
      (error) => console.error('Lỗi khi lấy hóa đơn:', error)
    );
  }

  // Tìm khách hàng theo số điện thoại
  timKhachHang() {
    if (this.soDienThoai.trim() === '') return;
    console.log('Đang tìm khách hàng với số điện thoại:', this.soDienThoai);
    this.banhangService.getKhachHangBySdt(this.soDienThoai).subscribe(
      (khachHang: any) => {
        console.log('Dữ liệu khách hàng từ API:', khachHang);
        if (khachHang && khachHang.id) {
          this.tenKhachHang = khachHang.ten;
          this.selectedKhachHang = khachHang;
        } else {
          console.log('Không tìm thấy khách hàng, tiến hành tạo mới...');
          this.themMoiKhachHang();
        }
      },
      (error: any) => {
        if (error.status === 404) {
          this.themMoiKhachHang();
        }
      }
    );
  }

  // Tạo khách hàng mới
  themMoiKhachHang() {
    const newKhachHang = {
      ten: this.tenKhachHang.trim() !== '' ? this.tenKhachHang : 'Khách vãng lai',
      soDienThoai: this.soDienThoai,
      email: '',
      diaChi: '',
    };
    this.banhangService.createKhachHang(newKhachHang).subscribe(
      (response: any) => {
        console.log('Tạo mới khách hàng thành công:', response);
        this.tenKhachHang = response.ten;
        this.selectedKhachHang = response;
      },
      (error: any) => {
        console.error('Lỗi khi tạo mới khách hàng:', error);
      }
    );
  }

  // Mở modal danh sách khách hàng
  moDanhSachKhachHang() {
    this.hienThiDanhSachKhachHang = true;
    this.layDanhSachKhachHang();
  }

  layDanhSachKhachHang() {
    this.banhangService.getDanhSachKhachHang(0, 100).subscribe(
      (data: any) => {
        this.danhSachKhachHang = data.content;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
      }
    );
  }

  layDanhSachNhanVien() {
    this.banhangService.getDanhSachNhanVien().subscribe(
      (data: any[]) => {
        this.danhSachNhanVien = data;
        if (data.length > 0) {
          this.selectedNhanVien = data[0].id;
        }
      },
      (error: any) => {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
      }
    );
  }

  // Chọn khách hàng từ modal
  chonKhachHang(khachHang: any) {
    this.selectedKhachHang = khachHang;
    this.tenKhachHang = khachHang.ten;
    this.soDienThoai = khachHang.soDienThoai;
    this.hienThiDanhSachKhachHang = false;
  }

  // Lấy danh sách sản phẩm để bán
  loadSanPhamToBanHang(): void {
    this.banhangService.getSanPham(this.page, this.size).subscribe(response => {
      this.sanPhams = response.content;
      this.totalPages = response.totalPages;
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadSanPhamToBanHang();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadSanPhamToBanHang();
    }
  }

  filteredSanPhams() {
    return this.sanPhams.filter(sp =>
      (this.selectedCategory === '' || sp.tenSanPham.includes(this.selectedCategory)) &&
      (this.searchText === '' || sp.tenSanPham.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  viewProductDetails(product: any) {
    alert(`Sản phẩm: ${product.tenSanPham}\nGiá: ${product.gia.toLocaleString()} VND`);
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: any) {
    const hoaDonId = this.selectedInvoice?.id;
    if (!hoaDonId) {
      alert("Vui lòng chọn hóa đơn trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }
    if (product.soLuong < 1) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    let existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.soLuong < product.soLuong) {
        existingItem.soLuong++;
      } else {
        alert('Số lượng sản phẩm không đủ!');
        return;
      }
    } else {
      this.cart.push({ ...product, soLuong: 1 });
    }

    this.cart = [...this.cart]; // Cập nhật lại danh sách giỏ hàng

    // Gọi API thêm sản phẩm vào hóa đơn
    this.banhangService.addSanPhamToHoaDon(hoaDonId, product.id, 1).subscribe(
      response => {
        console.log('Thêm sản phẩm vào hóa đơn:', response);
        product.soLuong--; // Cập nhật số lượng tồn kho
        this.updateInvoiceTotal();
        this.updateVoucher();
        this.refreshInvoice();
      },
      error => {
        console.error('Lỗi khi thêm sản phẩm vào hóa đơn:', error);
      }
    );
  }

  // Load chi tiết hóa đơn (giỏ hàng)
  layChiTietHoaDon() {
    const searchRequest = {
      idHoaDon: this.selectedInvoice?.id || null
    };
    console.log(this.selectedInvoice?.id);
    this.banhangService.searchHDCT(searchRequest).subscribe(
      (data) => {
        console.log('Danh sách hóa đơn chi tiết:', data);
        this.cart = data || [];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách hóa đơn chi tiết:', error);
      }
    );
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(item: any) {
    if(!this.selectedInvoice) {
      alert("Chưa chọn hoá đơn để xoá");
      return;
    }
    const hoaDonChiTietId = item.id;
    this.banhangService.deleteHoaDonChiTiet(hoaDonChiTietId).subscribe(
      response => {
        console.log('Xóa sản phẩm khỏi giỏ hàng:', response);
        this.cart = this.cart.filter(i => i.id !== item.id);
        // Cập nhật tổng tiền hóa đơn sau khi xóa sản phẩm
        this.updateInvoiceTotal();
        this.updateVoucher();
        this.refreshInvoice();
      },
      error => {
        console.error('Lỗi khi xóa sản phẩm:', error);
      }
    );
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  validateQuantity(item: any) {
    const product = this.sanPhams.find(p => p.id === item.id);
    if (!product) {
      alert('Sản phẩm không tồn tại!');
      return;
    }
    if (item.soLuong < 1 || isNaN(item.soLuong)) {
      item.soLuong = 1;
    } else if (item.soLuong > product.soLuong) {
      item.soLuong = product.soLuong;
      alert('Số lượng sản phẩm không đủ!');
    }
    this.banhangService.updateHoaDonChiTiet(item.id, item.soLuong).subscribe(
      response => {
        console.log('Cập nhật số lượng thành công:', response);
      },
      error => {
        console.error('Lỗi khi cập nhật số lượng:', error);
      }
    );
  }

  // Tính tổng tiền của giỏ hàng
  getTotal() {
    return this.cart.reduce((total, item) => total + (item.soLuong * item.gia), 0);
  }

  // Lấy thông tin voucher chi tiết và cập nhật giảm giá
  updateVoucher() {
    const total = this.getTotal();
    this.banhangService.getDetailVoucher(this.selectedDiscount).subscribe((voucher: any) => {
      if (!voucher) {
        alert("Không tìm thấy thông tin voucher!");
        return;
      }
      console.log("Voucher từ API:", voucher);
      if (voucher.hinhThucGiam) {
        this.discountAmount = voucher.giaTriGiam;
      } else {
        this.discountAmount = total * (voucher.giaTriGiam / 100);
      }
      this.updateInvoiceTotal();
      this.refreshInvoice();
    });
  }

  // Áp dụng mã giảm giá đã chọn
  applyDiscount() {
    if (!this.selectedDiscount) {
      alert("Vui lòng chọn mã giảm giá!");
      return;
    }
    this.updateVoucher();
  }

  checkout() {
    if (this.cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    console.log(this.selectedInvoice);
    const updatedInvoice = {
      ...this.selectedInvoice,
      trangThai: 7,
      idPhuongThucThanhToan: this.selectedDiscount
    }
    this.banhangService.updateHoaDon(updatedInvoice.id, updatedInvoice).subscribe(
      response => {
        debugger
        // Sau khi cập nhật thành công trạng thái hóa đơn, hiển thị thông báo và reset giỏ hàng, voucher, v.v.
        alert(`Thanh toán thành công bằng ${this.selectedPaymentMethod.toUpperCase()}!`);
        this.cart = [];
        this.discountCode = '';
        this.discountAmount = 0;
      },
      error => {
        console.error('Lỗi khi cập nhật trạng thái hóa đơn:', error);
        alert('Thanh toán thất bại!');
      }
    );
  }


  trackById(index: number, item: any) {
    return item.id;
  }

  // Lấy danh sách voucher (mã giảm giá) từ backend
  getVoucher() {
    this.banhangService.getVoucher().subscribe(
      (data: any[]) => {
        this.discountCodes = data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
      }
    );
  }

  // Cập nhật tổng tiền hóa đơn: tongTienTruocVoucher và tongTienThanhToan
  updateInvoiceTotal(): void {
    const preVoucher = this.getTotal();
    const totalAfterVoucher = preVoucher - this.discountAmount;
    const updatedInvoice = {
      ...this.selectedInvoice,
      tongTienTruocVoucher: preVoucher,
      tongTienThanhToan: totalAfterVoucher
    };

    if (updatedInvoice && updatedInvoice.id) {
      this.banhangService.updateHoaDon(updatedInvoice.id, updatedInvoice).subscribe(
        response => {
          // Cập nhật lại selectedInvoice nếu cần (ví dụ, response có dữ liệu mới)
          this.selectedInvoice = response;
          console.log('Cập nhật hóa đơn thành công:', response);
        },
        error => {
          console.error('Lỗi khi cập nhật hóa đơn:', error);
        }
      );
    }
  }

  refreshInvoice(): void {
    if (this.selectedInvoice && this.selectedInvoice.id) {
      this.banhangService.getHoaDonById(this.selectedInvoice.id).subscribe(
        (hoaDon: any) => {
          this.selectInvoice(hoaDon);
          console.log("Reload hóa đơn thành công:", hoaDon);
        },
        error => {
          console.error("Lỗi khi reload hóa đơn:", error);
        }
      );
    }
  }

  loadPaymentMethods(): void {
    this.banhangService.getDanhSachPTTT().subscribe(
      (data: any[]) => {
        this.paymentMethods = data;
        console.log(data);
        if (data.length > 0) {
          this.selectedPaymentMethod = data[0].id;
        }
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu phương thức thanh toán:', error);
      }
    );
  }

  loadInvoices(): void {
    const request = {};
    this.banhangService.getDanhSachHD(request).subscribe(
      (response: any) => {
        // Nếu response.content không tồn tại, giả sử response là mảng các hóa đơn
        const invoicesArray = response.content || response;
        this.invoices = invoicesArray.filter((invoice: any) => invoice.trangThai === 5);
      },
      error => {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      }
    );
  }

}
