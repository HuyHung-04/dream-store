import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { BanhangService } from './banhang.service';
import { HttpParams } from '@angular/common/http';

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
  tenSanPham: string = '';
  mauSac: string = '';
  sizeSearch: string = '';
  danhSachSize: string[] = [];
  danhSachMau: string[] = [];
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
    this.loadDanhSachMau();
    this.loadDanhSachSize();
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
      idVoucher: this.selectedDiscount ? this.selectedDiscount.id : null,
      idPhuongThucThanhToan: this.selectedPaymentMethod ? this.selectedPaymentMethod : null,
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
      trangThai: 6,
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
      this.sanPhams = response.content.map((sp: any) => ({
      ...sp,
      anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
    }));
      this.totalPages = response.totalPages;
    });
  }
  loadDanhSachMau(): void {
    this.banhangService.getDanhSachMau().subscribe(response => {
      this.danhSachMau = response.map((mau: any) => mau.ten); // Giả sử API trả về danh sách chứa tên màu
    });
  }

  loadDanhSachSize(): void {
    this.banhangService.getDanhSachSize().subscribe(response => {
      this.danhSachSize = response.map((size: any) => size.ten); // Giả sử API trả về danh sách chứa tên size
    });
  }
  // loadSanPhamToBanHang(): void {
  //   this.banhangService.getSanPham(this.page, this.size).subscribe(response => {
  //     console.log(response.content); // Kiểm tra dữ liệu trả về từ API
  //     this.sanPhams = response.content;
  //     this.totalPages = response.totalPages;
  //   });
  // }

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
        this.discountAmount = total * (voucher.giaTriGiam / 100);
      } else {
        this.discountAmount = voucher.giaTriGiam;
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

    // Cập nhật hóa đơn với trạng thái thanh toán và reset các trường liên quan
    const updatedInvoice = {
      ...this.selectedInvoice,
      trangThai: 7,
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      ngaySua: new Date().toISOString()
    };

    this.banhangService.updateHoaDon(updatedInvoice.id, updatedInvoice).subscribe(
      response => {
        alert(`Thanh toán thành công`);
        this.cart = [];
        this.discountCode = '';
        this.discountAmount = 0;
        this.selectedKhachHang = null;
        this.tenKhachHang = '';
        this.soDienThoai = '';
        this.selectedDiscount = null;
        this.selectedInvoice = response;
        this.loadInvoices();
        // Hỏi người dùng có muốn xuất hóa đơn PDF không
        if (confirm("Bạn có muốn xuất hóa đơn PDF không?")) {
          this.exportPDF(response.id);
        }
      },
      error => {
        console.error('Lỗi khi cập nhật trạng thái hóa đơn:', error);
        alert('Thanh toán thất bại!');
      }
    );
  }
  exportPDF(hoaDonId: number) {
    this.banhangService.exportHoaDonPDF(hoaDonId).subscribe(
      (data: Blob) => this.downloadFile(data, `hoa-don-${hoaDonId}.pdf`),
      error => console.error('Lỗi khi tải file PDF:', error)
    );
  }
  downloadFile(data: Blob, filename: string) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
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
        if (response && response.data) {
          // Lấy mảng hóa đơn từ key "data"
          const invoicesArray = response.data;
          this.invoices = invoicesArray.filter((invoice: any) => invoice.trangThai === 6);
          console.log("Hóa đơn có trạng thái 6:", this.invoices);
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response);
        }
      },
      error => {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      }
    );
  }
  //tìm kiếm sản phẩm
  filterSanPham(): void {
    let params = new HttpParams().set('page', this.page.toString()).set('sizePage', '4');

    if (this.tenSanPham) {
      params = params.set('tenSanPham', this.tenSanPham);
    }
    if (this.mauSac) {
      params = params.set('mauSac', this.mauSac);
    }
    if (this.sizeSearch) {
      params = params.set('size', this.sizeSearch);
    }
    // console.log("Request gửi lên API:", params.toString());

    this.banhangService.locSanPham(params).subscribe(response => {
      // console.log("Dữ liệu trả về từ API:", response);

      if (response && response.content) {
        this.sanPhams = response.content.map((sp: any) => ({
          ...sp,
          anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
        }));
        this.totalPages = response.totalPages;
      } else {
        this.sanPhams = [];
        this.totalPages = 0;
      }
    }, error => {
      // console.error("Lỗi API lọc sản phẩm:", error);
    });
  }
  cancelInvoice(invoice: any) {
    if (confirm(`Bạn có chắc chắn muốn hủy hóa đơn ${invoice.maHoaDon}?`)) {
      this.banhangService.cancelHoaDon(invoice.id).subscribe(
        (response) => {
          console.log('Hủy hóa đơn thành công:', response);
          this.loadInvoices();
          this.selectedInvoice = null;
          this.cart = [];
          alert('Hủy hóa đơn thành công!');
        },
        (error) => {
          console.error('Lỗi khi hủy hóa đơn:', error);
          alert('Hủy hóa đơn thất bại!');
        }
      );
    }
  }

}
