import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { BanhangService } from './banhang.service';
import { HttpParams } from '@angular/common/http';

interface SanPham {
  id: number;
  maSanPhamChiTiet: string;
  tenSanPham: string;
  gia: number;
  giaTriGiam: number;
  hinhThucGiam: number;
  soLuong: number;
  tenMau: string;
  tenSize: string;
  anhUrl: string;
}

interface HoaDon {
  id: number;
  maHoaDon: string;
  idNhanVien: number;
  idKhachHang: number;
  idVoucher?: number;
  tongTienTruocVoucher: number;
  tongTienThanhToan: number;
  trangThai: number;
  ngayTao: string;
}

interface KhachHang {
  id: number;
  ten: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
}

interface NhanVien {
  id: number;
  ten: string;
  email: string;
}

interface Voucher {
  id: number;
  ten: string;
  giaTriGiam: number;
  hinhThucGiam: boolean;
  giaTriToiThieu: number;
  giamToiDa: number;
}

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
  invoices: HoaDon[] = [];
  discountCode: string = '';
  discountAmount: number = 0;
  hienThiDanhSachKhachHang: boolean = false;
  danhSachKhachHang: KhachHang[] = [];
  danhSachNhanVien: NhanVien[] = [];
  selectedNhanVien: number | null = null;
  sanPhams: SanPham[] = [];
  page: number = 0;
  size: number = 4;
  totalPages: number = 0;
  cart: any[] = [];
  sdtNguoiNhan: string = '';
  tenKhachHang: string = '';
  selectedInvoice: HoaDon | null = null;
  selectedKhachHang: KhachHang | null = null;
  discountCodes: Voucher[] = [];
  selectedDiscount: number | null = null;
  paymentMethods: any[] = [];
  selectedPaymentMethod: number | null = null;
  quetQr: boolean = false;

  bankId = 'vietinbank'; // mã ngân hàng viết thường
  accountNo = '0379083813';
  template = 'compact';
  addInfo = 'thanh toan hoa don';
  accountName = 'HOANG HUY HUNG';

  constructor(private banhangService: BanhangService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadSanPhamToBanHang();
    this.loadDanhSachMau();
    this.loadDanhSachSize();
    this.layDanhSachNhanVien();
    this.loadPaymentMethods();
    this.loadInvoices();
    this.getVoucher();
    this.cart = [];
  }

  // Tạo hóa đơn mới
  createInvoice() {
    if (!this.selectedNhanVien) {
      alert('Vui lòng chọn nhân viên!');
      // Tự động load lại danh sách nhân viên nếu chưa có nhân viên được chọn
      this.layDanhSachNhanVien();
      return;
    }

    if (!this.selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    const request = {
      idNhanVien: this.selectedNhanVien,
      idKhachHang: this.selectedKhachHang?.id || null,
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      tongTienTruocVoucher: 0,
      tongTienThanhToan: 0,
      trangThai: 6 // Trạng thái chờ thanh toán
    };

    console.log('Tạo hóa đơn với thông tin:', request);

    this.banhangService.createHoaDon(request).subscribe(
      (response) => {
        console.log('Tạo hóa đơn thành công:', response);
        this.invoices.push(response);
        this.selectInvoice(response);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi khi tạo hóa đơn:', error);
        alert('Không thể tạo hóa đơn. Vui lòng thử lại.');
      }
    );
  }

  // Chọn hóa đơn và load thông tin chi tiết
  selectInvoice(invoice: HoaDon) {
    if (!invoice || !invoice.id) {
      console.error("Response hoặc response.id không hợp lệ", invoice);
      return;
    }
    
    // Reset các giá trị
    this.selectedInvoice = invoice;
    this.cart = [];
    this.selectedDiscount = null;
    this.discountAmount = 0;

    // Lấy thông tin chi tiết hóa đơn
    this.banhangService.getHoaDonById(invoice.id).subscribe(
      (hoaDon) => {
        this.selectedInvoice = hoaDon;
        
        // Cập nhật thông tin khách hàng nếu có
        if (hoaDon.idKhachHang) {
          this.banhangService.getKhachHangById(hoaDon.idKhachHang).subscribe(
            (khachHang) => {
              this.selectedKhachHang = khachHang;
              this.tenKhachHang = khachHang.ten || 'Không tìm thấy';
              this.sdtNguoiNhan = khachHang.soDienThoai || '';
            }
          );
        }

        // Lấy chi tiết hóa đơn và cập nhật giỏ hàng
        this.banhangService.searchHDCT({ idHoaDon: hoaDon.id }).subscribe(
          (data) => {
            console.log('Danh sách hóa đơn chi tiết:', data);
            this.cart = data || [];
            
            // Tính lại tổng tiền trước voucher
            const total = this.getTotal();
            
            // Cập nhật selectedDiscount từ idVoucher của hóa đơn
            if (hoaDon.idVoucher) {
              this.selectedDiscount = hoaDon.idVoucher;
              // Lấy thông tin chi tiết voucher và cập nhật giảm giá
              this.banhangService.getDetailVoucher(hoaDon.idVoucher).subscribe(
                (voucher) => {
                  if (voucher) {
                    this.selectedDiscount = voucher.id;
                    
                    if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
                      this.discountAmount = 0;
                    } else {
                      let discountAmount = voucher.hinhThucGiam
                        ? total * (voucher.giaTriGiam / 100)
                        : voucher.giaTriGiam;

                      if (voucher.giamToiDa && discountAmount > Number(voucher.giamToiDa)) {
                        discountAmount = Number(voucher.giamToiDa);
                      }

                      this.discountAmount = discountAmount;
                    }
                  }
                  // Cập nhật tổng tiền sau khi có thông tin voucher
                  this.updateInvoiceTotal();
                  this.cdr.detectChanges();
                }
              );
            } else {
              // Cập nhật tổng tiền nếu không có voucher
              this.updateInvoiceTotal();
              this.cdr.detectChanges();
            }
          },
          (error) => {
            console.error('Lỗi khi lấy danh sách hóa đơn chi tiết:', error);
          }
        );
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin hóa đơn:', error);
        alert('Không thể lấy thông tin hóa đơn. Vui lòng thử lại.');
      }
    );
  }

  // Tìm khách hàng theo số điện thoại
  timKhachHang() {
    if (this.sdtNguoiNhan.trim() === '') return;
    console.log('Đang tìm khách hàng với số điện thoại:', this.sdtNguoiNhan);
    this.banhangService.getKhachHangBySdt(this.sdtNguoiNhan).subscribe(
      (khachHang) => {
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
      soDienThoai: this.sdtNguoiNhan,
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
        // Luôn set nhân viên mặc định là người đầu tiên trong danh sách
        if (data && data.length > 0) {
          this.selectedNhanVien = data[0].id;
          console.log('Đã chọn nhân viên mặc định:', this.selectedNhanVien);
        } else {
          console.error('Không có nhân viên nào trong danh sách');
          alert('Không thể tải danh sách nhân viên. Vui lòng kiểm tra lại.');
        }
      },
      (error: any) => {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        alert('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
      }
    );
  }

  // Chọn khách hàng từ modal
  chonKhachHang(khachHang: any) {
    this.selectedKhachHang = khachHang;
    this.tenKhachHang = khachHang.ten;
    this.sdtNguoiNhan = khachHang.soDienThoai;
    this.hienThiDanhSachKhachHang = false;
  }

  // Chọn khách hàng vãng lai
  chonKhachHangVangLai() {
    const khachHangVangLai: KhachHang = {
      id: 0,
      ten: 'Khách vãng lai',
      soDienThoai: '',
      email: '',
      diaChi: ''
    };

    this.selectedKhachHang = khachHangVangLai;
    this.tenKhachHang = khachHangVangLai.ten;
    this.sdtNguoiNhan = '';
    this.hienThiDanhSachKhachHang = false;
  }

  // Lấy danh sách sản phẩm để bán
  loadSanPhamToBanHang(): void {
    this.banhangService.getSanPham(this.page, this.size).subscribe(response => {
      if (response && response.content) {
        this.sanPhams = response.content.map((sp: any) => ({
          ...sp,
          anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
        }));
        this.totalPages = response.totalPages;
      }
    });
  }

  loadDanhSachMau(): void {
    this.banhangService.getDanhSachMau().subscribe(response => {
      this.danhSachMau = response.map((mau: any) => mau.ten);
    });
  }

  loadDanhSachSize(): void {
    this.banhangService.getDanhSachSize().subscribe(response => {
      this.danhSachSize = response.map((size: any) => size.ten);
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

  filterSanPham() {
    this.loadSanPhamToBanHang();
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  validateQuantity(item: any, newQuantity: number) {
    console.log('Start validateQuantity');
    const oldQuantity = item.soLuong;
    console.log('oldQuantity:', oldQuantity, 'newQuantity:', newQuantity);

    if (isNaN(newQuantity) || newQuantity < 1) {
      item.soLuong = 1;
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    // Tìm sản phẩm trong danh sách sản phẩm bằng idSanPhamChiTiet
    const productIndex = this.sanPhams.findIndex(p => p.id === item.idSanPhamChiTiet);
    
    if (productIndex === -1) {
      console.error('Debug - item:', item);
      console.error('Debug - sanPhams:', this.sanPhams);
      alert('Không tìm thấy sản phẩm trong kho!');
      return;
    }

    const product = this.sanPhams[productIndex];
    // Tính toán lại difference dựa trên số lượng mới và cũ
    const difference = oldQuantity - newQuantity;
    console.log('Calculated difference:', difference, 'oldQuantity:', oldQuantity, 'newQuantity:', newQuantity);
    
    // Tính toán số lượng có sẵn bằng cách cộng số lượng trong kho với số lượng cũ trong giỏ hàng
    const availableQuantity = product.soLuong + oldQuantity;
    console.log('Available quantity:', availableQuantity, 'Product stock:', product.soLuong);

    if (newQuantity > availableQuantity) {
      alert('Số lượng sản phẩm trong kho không đủ!');
      item.soLuong = oldQuantity;
      this.cdr.detectChanges();
      return;
    }

    // Cập nhật số lượng tạm thời
    this.sanPhams[productIndex].soLuong = availableQuantity - newQuantity;
    item.soLuong = newQuantity;
    this.cdr.detectChanges();

    console.log('Before updateHoaDonChiTiet');
    this.banhangService.updateHoaDonChiTiet(item.id, newQuantity).subscribe(
      response => {
        console.log('updateHoaDonChiTiet response:', response);
        if (response.error) {
          alert(response.error);
          // Khôi phục lại số lượng cũ
          item.soLuong = oldQuantity;
          this.sanPhams[productIndex].soLuong = availableQuantity - oldQuantity;
          this.cdr.detectChanges();
          return;
        }

        console.log('Checking difference condition:', difference !== 0, 'difference:', difference);
        
        // Luôn cập nhật số lượng sản phẩm nếu newQuantity khác oldQuantity
        if (newQuantity !== oldQuantity) {
          console.log('Before updateSoLuongSanPham, difference:', difference);
          this.banhangService.updateSoLuongSanPham(item.idSanPhamChiTiet, Math.abs(difference), difference > 0).subscribe(
            () => {
              console.log('updateSoLuongSanPham success');
              this.updateInvoiceTotal();
              this.updateVoucher();
              this.cart = [...this.cart];
              this.cdr.detectChanges();
            },
            error => {
              console.error('Lỗi khi cập nhật số lượng tồn:', error);
              // Khôi phục lại số lượng cũ
              item.soLuong = oldQuantity;
              this.sanPhams[productIndex].soLuong = availableQuantity - oldQuantity;
              this.cart = [...this.cart];
              this.cdr.detectChanges();
            }
          );
        } else {
          console.log('No quantity change, skipping updateSoLuongSanPham');
          this.updateInvoiceTotal();
          this.updateVoucher();
          this.cart = [...this.cart];
          this.cdr.detectChanges();
        }
      },
      error => {
        console.error('Lỗi khi cập nhật số lượng:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Cập nhật số lượng thất bại!');
        }
        // Khôi phục lại số lượng cũ
        item.soLuong = oldQuantity;
        this.sanPhams[productIndex].soLuong = availableQuantity - oldQuantity;
        this.cart = [...this.cart];
        this.cdr.detectChanges();
      }
    );
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: SanPham) {
    if (!this.selectedInvoice) {
      alert("Vui lòng chọn hóa đơn trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }
    if (product.soLuong < 1) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingCartItem = this.cart.find(item => item.idSanPhamChiTiet === product.id);
    if (existingCartItem) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng lên 1
      this.validateQuantity(existingCartItem, existingCartItem.soLuong + 1);
      return;
    }

    // Thêm sản phẩm vào hóa đơn
    this.banhangService.addSanPhamToHoaDon(this.selectedInvoice.id, product.id, 1).subscribe(
      (response: any) => {
        console.log('Thêm sản phẩm vào hóa đơn:', response);
        
        // Cập nhật số lượng tồn kho
        this.banhangService.updateSoLuongSanPham(product.id, 1, false).subscribe(
          () => {
            console.log('Cập nhật số lượng tồn thành công');
            
            // Cập nhật UI một lần duy nhất
            const productIndex = this.sanPhams.findIndex(p => p.id === product.id);
            if (productIndex !== -1) {
              this.sanPhams[productIndex].soLuong--;
            }
            
            // Lấy lại danh sách chi tiết hóa đơn để cập nhật giỏ hàng
            this.banhangService.searchHDCT({ idHoaDon: this.selectedInvoice?.id }).subscribe(
              (cartData) => {
                console.log('Danh sách hóa đơn chi tiết sau khi thêm:', cartData);
                this.cart = cartData || [];
                this.updateInvoiceTotal();
                this.updateVoucher();
                this.cdr.detectChanges();
              },
              (error) => {
                console.error('Lỗi khi lấy danh sách hóa đơn chi tiết:', error);
              }
            );
          },
          error => {
            console.error('Lỗi khi cập nhật số lượng tồn:', error);
            // Xóa sản phẩm khỏi hóa đơn nếu cập nhật số lượng thất bại
            if (response && response.id) {
              this.banhangService.deleteHoaDonChiTiet(response.id).subscribe(
                () => {
                  console.log('Đã xóa sản phẩm khỏi hóa đơn do cập nhật số lượng thất bại');
                },
                deleteError => {
                  console.error('Lỗi khi xóa sản phẩm khỏi hóa đơn:', deleteError);
                }
              );
            }
            alert('Không thể cập nhật số lượng tồn kho. Vui lòng thử lại.');
          }
        );
      },
      error => {
        console.error('Lỗi khi thêm sản phẩm vào hóa đơn:', error);
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
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
    // Kiểm tra xem hóa đơn đã được chọn chưa
    if (!this.selectedInvoice) {
      alert("Chưa chọn hoá đơn để xoá");
      return;
    }

    // Kiểm tra trạng thái hóa đơn (giả sử trạng thái 7 là "đã thanh toán")
    if (this.selectedInvoice.trangThai === 7) {
      alert('Hóa đơn đã thanh toán, không thể chỉnh sửa!');
      return;
    }

    const hoaDonChiTietId = item.id;
    const soLuongHoanLai = item.soLuong;
    const idSanPham = item.idSanPhamChiTiet;
    const hoaDonId = this.selectedInvoice.id; // Lưu ID hóa đơn ngay từ đầu

    // Xóa sản phẩm khỏi giỏ hàng trước
    this.banhangService.deleteHoaDonChiTiet(hoaDonChiTietId).subscribe(
      response => {
        console.log('Xóa sản phẩm khỏi giỏ hàng:', response);
        
        // Sau khi xóa thành công, cập nhật số lượng tồn kho
        this.banhangService.updateSoLuongSanPham(idSanPham, soLuongHoanLai, true).subscribe(
          () => {
            console.log('Cập nhật số lượng tồn thành công');
            
            // Cập nhật UI một lần duy nhất
            this.cart = this.cart.filter(i => i.id !== item.id);
            
            // Tìm sản phẩm trong danh sách và cập nhật số lượng
            const productIndex = this.sanPhams.findIndex(p => p.id === idSanPham);
            if (productIndex !== -1) {
              this.sanPhams[productIndex].soLuong += soLuongHoanLai;
            }
            
            this.updateInvoiceTotal();
            this.updateVoucher();
            this.cdr.detectChanges();
          },
          error => {
            console.error('Lỗi khi cập nhật số lượng tồn:', error);
            // Nếu cập nhật số lượng thất bại, thêm lại sản phẩm vào hóa đơn
            this.banhangService.addSanPhamToHoaDon(hoaDonId, idSanPham, soLuongHoanLai).subscribe(
              () => {
                console.log('Đã thêm lại sản phẩm vào hóa đơn');
                alert('Không thể cập nhật số lượng tồn kho. Vui lòng thử lại.');
              },
              errorRevert => {
                console.error('Lỗi khi thêm lại sản phẩm:', errorRevert);
                alert('Có lỗi xảy ra. Vui lòng kiểm tra lại thủ công.');
              }
            );
          }
        );
      },
      error => {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    );
  }

  // Tính tổng tiền của giỏ hàng
  getTotal() {
    return this.cart.reduce((total, item) => {
      const giaSauGiam = item.hinhThucGiam === 1
        ? item.gia - (item.gia * item.giaTriGiam / 100)
        : item.gia - item.giaTriGiam;
      return total + (item.soLuong * giaSauGiam);
    }, 0);
  }

  // Lấy thông tin voucher chi tiết và cập nhật giảm giá
  updateVoucher() {
    if (!this.selectedDiscount || !this.selectedInvoice) return;

    if (this.cart.length === 0) {
      this.discountAmount = 0;
      this.updateInvoiceTotal();
      return;
    }

    const total = this.getTotal();
    this.banhangService.getDetailVoucher(this.selectedDiscount).subscribe(
      (voucher) => {
        if (!voucher) {
          alert('Không tìm thấy thông tin voucher!');
          return;
        }

        if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
          this.discountAmount = 0;
          this.updateInvoiceTotal();
          return;
        }

        let discountAmount = voucher.hinhThucGiam
          ? total * (voucher.giaTriGiam / 100)
          : voucher.giaTriGiam;

        if (voucher.giamToiDa && discountAmount > Number(voucher.giamToiDa)) {
          discountAmount = Number(voucher.giamToiDa);
        }

        this.discountAmount = discountAmount;
        this.updateInvoiceTotal();
      },
      (error) => {
        console.error('Lỗi khi cập nhật voucher:', error);
      }
    );
  }

  // Áp dụng mã giảm giá đã chọn
  applyDiscount() {
    if (!this.selectedInvoice) {
      alert("Vui lòng chọn hóa đơn trước khi áp dụng mã giảm giá!");
      return;
    }

    if (this.cart.length === 0) {
      alert("Giỏ hàng đang trống, không thể áp dụng mã giảm giá!");
      return;
    }

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

    if (!this.selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    if (!this.selectedInvoice) {
      alert('Vui lòng chọn hóa đơn!');
      return;
    }

    const tongTienTruocVoucher = this.getTotal();
    const tongTienThanhToan = tongTienTruocVoucher - this.discountAmount;

    const request = {
      ...this.selectedInvoice,
      idVoucher: this.selectedDiscount,
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      tongTienTruocVoucher,
      tongTienThanhToan,
      trangThai: 7 // Trạng thái đã thanh toán
    };

    this.banhangService.updateHoaDon(this.selectedInvoice.id, request).subscribe(
      (response) => {
        alert('Thanh toán thành công!');
        this.resetAfterCheckout();
        if (confirm('Bạn có muốn xuất hóa đơn PDF không?')) {
          this.exportPDF(response.id);
        }
      },
      (error) => {
        console.error('Lỗi khi thanh toán:', error);
        alert('Thanh toán thất bại!');
      }
    );
  }

  private resetAfterCheckout(): void {
    this.cart = [];
    this.selectedInvoice = null;
    this.selectedDiscount = null;
    this.discountAmount = 0;
    this.selectedKhachHang = null;
    this.tenKhachHang = '';
    this.sdtNguoiNhan = '';
    this.loadInvoices();
    this.loadSanPhamToBanHang();
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
    
    if (this.selectedInvoice) {
      this.selectedInvoice.tongTienTruocVoucher = preVoucher;
      this.selectedInvoice.tongTienThanhToan = totalAfterVoucher;
      
      const updatedInvoice = {
        ...this.selectedInvoice,
        idVoucher: this.selectedDiscount,
        idPhuongThucThanhToan: this.selectedPaymentMethod,
        tongTienTruocVoucher: preVoucher,
        tongTienThanhToan: totalAfterVoucher
      };

      this.banhangService.updateHoaDon(updatedInvoice.id, updatedInvoice).subscribe(
        response => {
          this.selectedInvoice = response;
          console.log('Cập nhật hóa đơn thành công:', response);
          this.cdr.detectChanges();
        },
        error => {
          console.error('Lỗi khi cập nhật hóa đơn:', error);
        }
      );
    }
  }

  loadPaymentMethods(): void {
    this.banhangService.getDanhSachPTTT().subscribe(
      (data: any[]) => {
        // Lọc ra chỉ những phương thức có id là 2 hoặc 3
        this.paymentMethods = data.filter(method => method.id === 2 || method.id === 3);

        console.log(this.paymentMethods);

        if (this.paymentMethods.length > 0) {
          this.selectedPaymentMethod = this.paymentMethods[0].id;
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu phương thức thanh toán:', error);
      }
    );
  }

  logSelectedMethod() {
    console.log('Phương thức thanh toán đã chọn:', this.selectedPaymentMethod);
  }

  loadInvoices(): void {
    this.banhangService.getDanhSachHD({}).subscribe(
      (response) => {
        if (response && response.data) {
          this.invoices = response.data.filter((invoice: any) => invoice.trangThai === 6);
        }
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      }
    );
  }

  get qrUrl(): string {
    const amount = this.selectedInvoice?.tongTienThanhToan || 0;
    const encodedInfo = encodeURIComponent(this.addInfo);
    const encodedName = encodeURIComponent(this.accountName);
    return `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-${this.template}.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
  }

  kiemTraMoModal() {
    console.log(this.selectedPaymentMethod)
    if (Number(this.selectedPaymentMethod) === 3) {
      this.openQuetQr();
    } else {
      this.closeQuetQr();
    }
  }

  openQuetQr(){
    this.quetQr = true;
  }

  closeQuetQr(){
    this.quetQr = false;
  }

  // Thêm phương thức updateCartItem
  updateCartItem(item: any) {
    if(!this.selectedInvoice) {
      alert("Chưa chọn hoá đơn để cập nhật");
      return;
    }

    const index = this.cart.findIndex(cartItem => cartItem.id === item.id);
    if (index !== -1) {
      const oldQuantity = this.cart[index].soLuong;
      const newQuantity = item.soLuong;
      const difference = newQuantity - oldQuantity;

      // Kiểm tra số lượng tồn kho
      const product = this.sanPhams.find(p => p.id === item.id);
      if (product && difference > 0 && difference > product.soLuong) {
        alert('Số lượng sản phẩm trong kho không đủ!');
        item.soLuong = oldQuantity;
        return;
      }

      this.cart[index] = item;
      
      // Cập nhật số lượng trong hóa đơn chi tiết
      this.banhangService.updateHoaDonChiTiet(item.id, item.soLuong).subscribe(
        response => {
          console.log('Cập nhật số lượng thành công:', response);
          
          // Cập nhật số lượng tồn kho
          if (difference !== 0) {
            this.banhangService.updateSoLuongSanPham(item.id, Math.abs(difference), difference < 0).subscribe(
              () => {
                console.log('Cập nhật số lượng tồn thành công');
                // Load lại danh sách sản phẩm để đảm bảo số lượng chính xác
                this.loadSanPhamToBanHang();
                // Load lại chi tiết hóa đơn để cập nhật giỏ hàng
                this.layChiTietHoaDon();
              },
              error => {
                console.error('Lỗi khi cập nhật số lượng tồn:', error);
                // Khôi phục lại số lượng cũ nếu cập nhật thất bại
                item.soLuong = oldQuantity;
                this.cdr.detectChanges();
              }
            );
          }

          this.updateInvoiceTotal();
          this.updateVoucher();
        },
        error => {
          console.error('Lỗi khi cập nhật số lượng:', error);
          // Khôi phục lại số lượng cũ nếu cập nhật thất bại
          item.soLuong = oldQuantity;
          this.cdr.detectChanges();
        }
      );
    }
  }

  cancelInvoice(invoice: HoaDon) {
    if (!invoice) return;
    
    // Hiển thị confirm dialog
    if (!confirm('Bạn có chắc chắn muốn hủy hóa đơn này không?')) {
      return;
    }
    
    // Lấy danh sách chi tiết hóa đơn trước khi hủy
    this.banhangService.searchHDCT({ idHoaDon: invoice.id }).subscribe(
      (cartItems) => {
        if (!cartItems || cartItems.length === 0) {
          // Nếu không có sản phẩm nào, chỉ cần hủy hóa đơn
          this.processInvoiceCancellation(invoice.id);
          return;
        }

        // Đếm số lượng sản phẩm đã được cập nhật thành công
        let successCount = 0;
        const totalItems = cartItems.length;

        // Cập nhật số lượng cho từng sản phẩm
        cartItems.forEach(item => {
          this.banhangService.updateSoLuongSanPham(item.idSanPhamChiTiet, item.soLuong, true).subscribe(
            () => {
              console.log(`Đã trả lại ${item.soLuong} sản phẩm ${item.idSanPhamChiTiet} vào kho`);
              successCount++;

              // Kiểm tra nếu đã cập nhật xong tất cả sản phẩm
              if (successCount === totalItems) {
                // Sau khi cập nhật xong số lượng tất cả sản phẩm, tiến hành hủy hóa đơn
                this.processInvoiceCancellation(invoice.id);
              }
            },
            error => {
              console.error(`Lỗi khi trả lại số lượng cho sản phẩm ${item.idSanPhamChiTiet}:`, error);
              alert(`Không thể trả lại số lượng cho sản phẩm ${item.maSanPhamChiTiet}. Vui lòng kiểm tra lại.`);
            }
          );
        });
      },
      error => {
        console.error('Lỗi khi lấy danh sách chi tiết hóa đơn:', error);
        alert('Không thể hủy hóa đơn. Vui lòng thử lại.');
      }
    );
  }

  private processInvoiceCancellation(invoiceId: number) {
    this.banhangService.cancelHoaDon(invoiceId).subscribe(
      response => {
        console.log('Hủy hóa đơn thành công:', response);
        this.loadInvoices();
        this.loadSanPhamToBanHang(); // Cập nhật lại danh sách sản phẩm
        this.selectedInvoice = null;
        this.cart = [];
        alert('Đã hủy hóa đơn thành công.');
      },
      error => {
        console.error('Lỗi khi hủy hóa đơn:', error);
        alert('Không thể hủy hóa đơn. Vui lòng thử lại.');
      }
    );
  }
}
