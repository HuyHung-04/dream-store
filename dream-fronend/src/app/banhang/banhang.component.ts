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
  allSanPhams: SanPham[] = [];
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
  showPaymentPopup: boolean = false;
  tienKhachDua: number = 0;
  tienThua: number = 0;
  cartTotal: number = 0;
  soLuongSanPham: number = 0;
  bankId = 'vietinbank'; // mã ngân hàng viết thường
  accountNo = '0379083813';
  template = 'compact';
  addInfo = 'thanh toan hoa don';
  accountName = 'HOANG HUY HUNG';
  selectedVoucher: any; // hoặc khai báo theo đúng kiểu nếu bạn có interface
  tenNhanVien: String = ''
  idNhanVien: number = 0;
  // Thêm mảng số tiền nhanh
  quickAmounts: number[] = [100000, 200000, 500000, 1000000];

  // Thêm các biến mới cho tìm kiếm khách hàng
  searchKhachHang: string = '';
  filteredKhachHang: KhachHang[] = [];

  // Thêm biến để theo dõi trạng thái thông báo
  private isShowingAlert = false;
  dsSanPham: any[] = [];
  giaGocSanPhamMap: { [id: number]: number } = {};
  // Thêm biến để lưu giá trị số lượng trước khi sửa
  private previousQuantity: number = 0;

  constructor(private banhangService: BanhangService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadSanPhamToBanHang();
    this.loadAllSanPham();
    this.loadDanhSachMau();
    this.loadDanhSachSize();
    this.layDanhSachNhanVien();
    this.loadPaymentMethods();
    this.loadInvoices();
    this.cart = [];
    this.cartTotal = this.getTotal();
    this.getVoucher(this.cartTotal);
  }

  private loadAllSanPham(): void {
    console.log('Loading all products...');
    this.banhangService.getAllSanPham().subscribe(
      response => {
        this.dsSanPham = response.content
        console.log('Response from getAllSanPham:', response);
        if (response && response.content) {
          this.allSanPhams = response.content.map((sp: any) => ({
            ...sp,

            anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
          }));


        } else {
          console.error('Invalid response format:', response);
        }
      },
      error => {
        console.error('Error loading all products:', error);
      }
    );
  }

  onDiscountChange(newValue: any) {
    if (newValue === null) {
      this.applyDiscount();
    }
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

    // Nếu không có khách hàng được chọn, sử dụng khách vãng lai (id = 1)
    if (!this.selectedKhachHang) {
      this.banhangService.getKhachHangById(1).subscribe(
        (khachVangLai) => {
          this.selectedKhachHang = khachVangLai;
          this.tenKhachHang = khachVangLai.ten;
          this.sdtNguoiNhan = '';
          this.createInvoiceWithKhachHang();
        },
        (error) => {
          console.error('Lỗi khi lấy thông tin khách vãng lai:', error);
          alert('Không thể tạo hóa đơn. Vui lòng thử lại.');
        }
      );
    } else {
      this.createInvoiceWithKhachHang();
    }
  }

  private createInvoiceWithKhachHang() {
    const request = {
      idNhanVien: this.selectedNhanVien,
      idKhachHang: this.selectedKhachHang?.id || 1, // Sử dụng ID 1 nếu không có khách hàng được chọn
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      tongTienTruocVoucher: 0,
      tongTienThanhToan: 0,
      trangThai: 6,
      tenNguoiNhan: this.tenKhachHang || 'Khách vãng lai',
      sdtNguoiNhan: this.sdtNguoiNhan || ''
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
        alert('Bạn chỉ có thể tạo tối đa 5 hóa đơn.');
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

        // Gọi hàm load chi tiết hóa đơn
        this.loadChiTietHoaDon(hoaDon.id);
        console.log(this.selectedInvoice);
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin hóa đơn:', error);
        alert('Không thể lấy thông tin hóa đơn. Vui lòng thử lại.');
      }
    );
  }

  loadChiTietHoaDon(idHoaDon: number) {
    this.banhangService.searchHDCT({ idHoaDon }).subscribe(
      (data) => {
        this.giaGocSanPhamMap = {};
        data.forEach(item => {
          const sanPhamChiTiet = this.dsSanPham.find(sp => sp.id === item.idSanPhamChiTiet);
          if (sanPhamChiTiet) {
            this.giaGocSanPhamMap[item.idSanPhamChiTiet] = sanPhamChiTiet.gia;
          }
        });
        console.log('=== THÔNG TIN CHI TIẾT GIỎ HÀNG ===');
        if (data && data.length > 0) {
          console.log('\nDanh sách tất cả items trong cart:');
          data.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`, item);
          });
        } else {
          console.log('Giỏ hàng trống');
        }

        this.cart = data ? data.map(item => {
          const giaGoc = this.giaGocSanPhamMap[item.idSanPhamChiTiet];
          const giaHienTai = item.gia;

          const daTungDuocGiam = giaGoc && giaHienTai < giaGoc;

          const giaTriGiamKM = daTungDuocGiam
            ? Math.round((1 - giaHienTai / giaGoc) * 100)
            : 0;

          return {
            ...item,
            soLuongBanDau: item.soLuong,
            gia: daTungDuocGiam ? giaHienTai : giaGoc,
            giaTriGiamKM: giaTriGiamKM,
          };
        }) : [];

        const total = this.getTotal();
        this.cartTotal = total;
        console.log('\nTổng tiền trước voucher:', total);

        this.getVoucher(total);

        // Nếu hóa đơn có voucher thì xử lý voucher
        if (this.selectedInvoice?.idVoucher) {
          this.banhangService.getDetailVoucher(this.selectedInvoice.idVoucher).subscribe(
            (voucher) => {
              if (voucher) {
                if (voucher.soLuong == 0 || voucher.trangThai == 0) {
                  this.selectedDiscount = null;
                  this.discountAmount = 0;
                }
                else {
                  this.selectedDiscount = voucher.id;
                  if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
                    this.discountAmount = 0;
                  } else {
                    let discountAmount = voucher.hinhThucGiam
                      ? voucher.giaTriGiam
                      : total * (voucher.giaTriGiam / 100);

                    if (voucher.giamToiDa && discountAmount > Number(voucher.giamToiDa)) {
                      discountAmount = Number(voucher.giamToiDa);
                    }
                    this.discountAmount = discountAmount;
                  }
                }
              }

              this.updateInvoiceTotal();

            },
            error => {
              console.error('Lỗi khi lấy chi tiết voucher:', error);
            }
          );
        } else {
          this.updateInvoiceTotal();
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách hóa đơn chi tiết:', error);
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

  // Lấy danh sách khách hàng
  layDanhSachKhachHang() {
    this.banhangService.getDanhSachKhachHang(0, 100).subscribe(
      (data: any) => {
        this.danhSachKhachHang = data.content;
        this.filteredKhachHang = [...this.danhSachKhachHang];
        console.log('Danh sách khách hàng:', this.danhSachKhachHang);
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
        alert('Không thể tải danh sách khách hàng. Vui lòng thử lại.');
      }
    );
  }

  // Lọc danh sách khách hàng theo từ khóa tìm kiếm
  filterKhachHang() {
    if (!this.searchKhachHang) {
      this.filteredKhachHang = [...this.danhSachKhachHang];
      return;
    }

    const searchTerm = this.searchKhachHang.toLowerCase();
    this.filteredKhachHang = this.danhSachKhachHang.filter(kh =>
      kh.ten.toLowerCase().includes(searchTerm) ||
      (kh.soDienThoai && kh.soDienThoai.includes(searchTerm))
    );
  }

  // Chọn khách hàng từ modal
  chonKhachHang(khachHang: KhachHang) {
    console.log('Khách hàng được chọn:', khachHang);
    this.selectedKhachHang = khachHang;
    this.tenKhachHang = khachHang.ten;
    this.sdtNguoiNhan = khachHang.soDienThoai;
    this.hienThiDanhSachKhachHang = false;

    // Nếu đã có hóa đơn được chọn, cập nhật thông tin khách hàng
    if (this.selectedInvoice) {
      const updatedInvoice = {
        ...this.selectedInvoice,
        idKhachHang: khachHang.id,
        tenNguoiNhan: khachHang.ten,
        sdtNguoiNhan: khachHang.soDienThoai
      };

      this.banhangService.updateHoaDon(this.selectedInvoice.id, updatedInvoice).subscribe(
        response => {
          console.log('Cập nhật khách hàng cho hóa đơn thành công:', response);
          this.selectedInvoice = response;
        },
        error => {
          console.error('Lỗi khi cập nhật khách hàng cho hóa đơn:', error);
          alert('Không thể cập nhật thông tin khách hàng cho hóa đơn. Vui lòng thử lại.');
        }
      );
    }
  }

  // Chọn khách hàng vãng lai
  chonKhachHangVangLai() {
    // Lấy thông tin khách vãng lai có id = 1 từ database
    this.banhangService.getKhachHangById(1).subscribe(
      (khachHangVangLai: any) => {
        console.log('Lấy thông tin khách hàng vãng lai thành công:', khachHangVangLai);
        this.selectedKhachHang = khachHangVangLai;
        this.tenKhachHang = khachHangVangLai.ten;
        this.sdtNguoiNhan = '';
        this.hienThiDanhSachKhachHang = false;

        // Nếu đã có hóa đơn được chọn, cập nhật thông tin khách hàng
        if (this.selectedInvoice) {
          const updatedInvoice = {
            ...this.selectedInvoice,
            idKhachHang: 1, // Luôn sử dụng ID 1 cho khách vãng lai
            tenNguoiNhan: khachHangVangLai.ten,
            sdtNguoiNhan: ''
          };

          this.banhangService.updateHoaDon(this.selectedInvoice.id, updatedInvoice).subscribe(
            response => {
              console.log('Cập nhật khách hàng cho hóa đơn thành công:', response);
              this.selectedInvoice = response;
            },
            error => {
              console.error('Lỗi khi cập nhật khách hàng cho hóa đơn:', error);
              alert('Không thể cập nhật thông tin khách hàng cho hóa đơn. Vui lòng thử lại.');
            }
          );
        }
      },
      (error: any) => {
        console.error('Lỗi khi lấy thông tin khách hàng vãng lai:', error);
        alert('Không thể lấy thông tin khách hàng vãng lai. Vui lòng thử lại.');
      }
    );
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

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  validateQuantity(item: any, newQuantity: number) {
    console.log('=== Cập nhật số lượng ===');
    console.log('Item cập nhật:', item);
    console.log('Số lượng mới:', newQuantity);

    const oldQuantity = item.soLuong;

    if (isNaN(newQuantity) || newQuantity < 1) {
      item.soLuong = oldQuantity;
      this.cdr.detectChanges();
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    // Load lại toàn bộ danh sách sản phẩm để có thông tin mới nhất
    this.banhangService.getAllSanPham().subscribe(
      response => {
        if (response && response.content) {
          this.allSanPhams = response.content.map((sp: any) => ({
            ...sp,
            anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
          }));

          // Tìm sản phẩm trong danh sách tất cả sản phẩm
          const product = this.allSanPhams.find((p: SanPham) => p.id === item.idSanPhamChiTiet);

          if (!product) {
            item.soLuong = oldQuantity;
            this.cdr.detectChanges();
            alert('Không tìm thấy thông tin sản phẩm!');
            return;
          }

          // Kiểm tra số lượng tồn kho
          if (newQuantity > product.soLuong) {
            item.soLuong = oldQuantity;
            this.cdr.detectChanges();
            alert(`Số lượng vượt quá số lượng trong kho`);
            return;
          }

          // Cập nhật số lượng trong hóa đơn chi tiết
          this.banhangService.updateHoaDonChiTiet(item.id, newQuantity).subscribe(
            response => {
              console.log('Cập nhật số lượng thành công:', response);

              // Cập nhật số lượng tồn kho
              const difference = newQuantity - oldQuantity;

              // Cập nhật số lượng trong danh sách sản phẩm hiện tại
              const productInList = this.sanPhams.find(p => p.id === item.idSanPhamChiTiet);
              if (productInList) {
                productInList.soLuong = product.soLuong - difference;
              }

              // Cập nhật số lượng trong allSanPhams
              const productInAll = this.allSanPhams.find(p => p.id === item.idSanPhamChiTiet);
              if (productInAll) {
                productInAll.soLuong = product.soLuong - difference;
              }

              if (difference !== 0) {
                this.banhangService.updateSoLuongSanPham(item.idSanPhamChiTiet, Math.abs(difference), difference < 0).subscribe(
                  () => {
                    console.log('Cập nhật số lượng tồn thành công');
                    this.loadSanPhamToBanHang();
                    this.loadAllSanPham();
                    this.layChiTietHoaDon();
                  },
                  error => {
                    console.error('Lỗi khi cập nhật số lượng tồn:', error);
                    item.soLuong = oldQuantity;
                    if (productInList) productInList.soLuong = product.soLuong;
                    if (productInAll) productInAll.soLuong = product.soLuong;
                    this.cdr.detectChanges();
                    alert('Lỗi khi cập nhật số lượng tồn kho!');
                  }
                );
              }

              this.updateInvoiceTotal();
              this.updateVoucher();
              this.cdr.detectChanges();
            },
            error => {
              console.error('Lỗi khi cập nhật số lượng:', error);
              item.soLuong = oldQuantity;
              this.cdr.detectChanges();
              alert('Lỗi khi cập nhật số lượng!');
            }
          );
        } else {
          console.error('Invalid response format:', response);
          item.soLuong = oldQuantity;
          this.cdr.detectChanges();
          alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        }
      },
      error => {
        console.error('Error loading products:', error);
        item.soLuong = oldQuantity;
        this.cdr.detectChanges();
        alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
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
    console.log('=== Thêm vào giỏ hàng ===');
    console.log('Sản phẩm thêm:', product);
    console.log('Sản phẩm đã tồn tại:', existingCartItem);
    if (existingCartItem) {
      // Nếu sản phẩm đã tồn tại, thêm trực tiếp vào hóa đơn
      this.banhangService.addSanPhamToHoaDon(this.selectedInvoice.id, product.id, 1).subscribe(
        (response: any) => {
          console.log('Thêm sản phẩm vào hóa đơn:', response);

          // // Cập nhật UI trực tiếp thay vì gọi API
          // const productIndex = this.sanPhams.findIndex(p => p.id === product.id);
          // if (productIndex !== -1) {
          //   this.sanPhams[productIndex] = {
          //     ...this.sanPhams[productIndex],
          //     soLuong: this.sanPhams[productIndex].soLuong - 1
          //   };
          //   // Tạo một mảng mới để trigger change detection
          //   this.sanPhams = [...this.sanPhams];
          // }
          this.loadSanPhamToBanHang()
          // Lấy lại danh sách chi tiết hóa đơn để cập nhật giỏ hàng
          this.banhangService.searchHDCT({ idHoaDon: this.selectedInvoice?.id }).subscribe(
            (cartData) => {
              console.log('Danh sách hóa đơn chi tiết sau khi thêm:', cartData);
              this.cart = cartData.map(item => {
                const sp = this.dsSanPham.find(sp => sp.id === item.idSanPhamChiTiet);
                const giaGoc = sp?.gia || item.gia;
                const giaHienTai = item.gia;

                const daGiamGia = giaHienTai < giaGoc;
                const giaTriGiamKM = daGiamGia ? Math.round((1 - giaHienTai / giaGoc) * 100) : 0;

                this.giaGocSanPhamMap[item.idSanPhamChiTiet] = giaGoc;

                return {
                  ...item,
                  soLuongBanDau: item.idSanPhamChiTiet === product.id
                    ? product.soLuong + 1
                    : (item.soLuongBanDau || item.soLuong),
                  giaTriGiamKM: giaTriGiamKM,
                  isGiamGia: daGiamGia
                };
              });
              this.getVoucher(this.getTotal());
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
          const message = error?.error?.error || 'Đã xảy ra lỗi khi cập nhật hóa đơn';
          alert(message);
          this.loadSanPhamToBanHang()
        }
      );
      return;
    }

    // Thêm sản phẩm vào hóa đơn
    this.banhangService.addSanPhamToHoaDon(this.selectedInvoice.id, product.id, 1).subscribe(
      (response: any) => {
        console.log('Thêm sản phẩm vào hóa đơn:', response);

        // // Cập nhật UI trực tiếp thay vì gọi API
        // const productIndex = this.sanPhams.findIndex(p => p.id === product.id);
        // if (productIndex !== -1) {
        //   this.sanPhams[productIndex] = {
        //     ...this.sanPhams[productIndex],
        //     soLuong: this.sanPhams[productIndex].soLuong - 1
        //   };
        //   // Tạo một mảng mới để trigger change detection
        //   this.sanPhams = [...this.sanPhams];
        // }
        this.loadSanPhamToBanHang()
        // Lấy lại danh sách chi tiết hóa đơn để cập nhật giỏ hàng
        this.banhangService.searchHDCT({ idHoaDon: this.selectedInvoice?.id }).subscribe(
          (cartData) => {
            console.log('Danh sách hóa đơn chi tiết sau khi thêm:', cartData);
            this.giaGocSanPhamMap = {};
            cartData.forEach(item => {
              const sanPhamChiTiet = this.dsSanPham.find(sp => sp.id === item.idSanPhamChiTiet);
              if (sanPhamChiTiet) {
                this.giaGocSanPhamMap[item.idSanPhamChiTiet] = sanPhamChiTiet.gia;
              }
            });
            // Gán soLuongBanDau cho mỗi sản phẩm trong giỏ hàng
            this.cart = cartData.map(item => {
              const sp = this.dsSanPham.find(sp => sp.id === item.idSanPhamChiTiet);
              const giaGoc = sp?.gia || item.gia;
              const giaHienTai = item.gia;

              const daGiamGia = giaHienTai < giaGoc;
              const giaTriGiamKM = daGiamGia ? Math.round((1 - giaHienTai / giaGoc) * 100) : 0;

              this.giaGocSanPhamMap[item.idSanPhamChiTiet] = giaGoc;

              return {
                ...item,
                soLuongBanDau: item.idSanPhamChiTiet === product.id
                  ? product.soLuong + 1
                  : (item.soLuongBanDau || item.soLuong),
                giaTriGiamKM: giaTriGiamKM,
                isGiamGia: daGiamGia
              };
            });
            this.getVoucher(this.getTotal());
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
        const message = error?.error?.error || 'Đã xảy ra lỗi khi cập nhật hóa đơn';
        alert(message);
        this.loadSanPhamToBanHang()
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
        console.log('Danh sách hóa đơn chi tiếtxxx:', data);
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
    console.log('=== Xóa khỏi giỏ hàng ===');
    console.log('Item xóa:', item);
    console.log('Giỏ hàng trước khi xóa:', this.cart);
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
        console.log('soLuonghoanlại', soLuongHoanLai);
        this.selectedDiscount = null;
        if (this.selectedInvoice) {
          this.selectedInvoice.idVoucher = undefined;
        }
        this.discountAmount = 0
        this.loadSanPhamToBanHang();
        this.loadChiTietHoaDon(hoaDonId);
        this.updateInvoiceTotal();
        this.updateVoucher();
        this.cdr.detectChanges();
      },
      error => {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    );
  }

  // Tính đơn giá sau khuyến mãi
  calculateDiscountedPrice(item: any): number {
    if (!item) return 0;
    return item.gia;
  }

  // Tính tổng giá cho một sản phẩm trong giỏ hàng
  calculateItemTotal(item: any): number {
    return this.calculateDiscountedPrice(item) * item.soLuong;
  }

  // Tính tổng giá của toàn bộ giỏ hàng
  getTotal(): number {
    return this.cart.reduce((total, item) => total + this.calculateItemTotal(item), 0);
  }

  // Tính tổng tiền sau khi áp dụng voucher
  getTotalAfterDiscount(): number {
    const total = this.getTotal();
    if (!this.selectedDiscount || !this.discountAmount) {
      return total;
    }
    return total - this.discountAmount;
  }

  // Lấy thông tin voucher chi tiết và cập nhật giảm giá vào hóa đơn
  updateVoucher(): void {
    // Kiểm tra xem đã chọn voucher và hóa đơn chưa
    if (!this.selectedDiscount || !this.selectedInvoice) return;

    // Nếu giỏ hàng trống thì không áp dụng giảm giá
    if (this.cart.length === 0) {
      this.discountAmount = 0;
      this.updateInvoiceTotal();
      return;
    }

    const total = this.getTotal(); // Tổng tiền trước giảm
    this.banhangService.getDetailVoucher(this.selectedDiscount).subscribe(
      (voucher) => {
        this.selectedVoucher = voucher;
        if (!voucher) {
          alert('Không tìm thấy thông tin voucher!');
          return;
        }

        // Nếu có điều kiện giá trị tối thiểu mà không đủ thì không áp dụng
        if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
          this.discountAmount = 0;
          alert(`Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher!`);
          this.updateInvoiceTotal();
          return;
        }

        let discountAmount = 0;

        if (voucher.hinhThucGiam) {
          // true: Giảm theo số tiền cố định
          discountAmount = voucher.giaTriGiam;
        } else {
          // false: Giảm theo phần trăm
          discountAmount = total * (voucher.giaTriGiam / 100);
        }

        // Kiểm tra giảm tối đa
        if (voucher.giamToiDa && discountAmount > voucher.giamToiDa) {
          discountAmount = voucher.giamToiDa;
        }

        // Gán số tiền giảm và cập nhật lại tổng hóa đơn
        this.discountAmount = discountAmount;
        this.updateInvoiceTotal();
      },
      (error) => {
        console.error('Lỗi khi cập nhật voucher:', error);
      }
    );
  }

  getDiscountDisplay(): string {
    if (!this.selectedDiscount || !this.selectedVoucher || this.discountAmount == 0) return '0 VND';

    const voucher = this.selectedVoucher;

    // Nếu giảm tiền mặt (hinhThucGiam = true)
    if (voucher.hinhThucGiam) {
      return `${voucher.giaTriGiam.toLocaleString()} VND`;
    }

    // Nếu giảm phần trăm
    if (!voucher.hinhThucGiam) {
      // Có giảm tối đa
      if (voucher.giamToiDa && this.discountAmount >= voucher.giamToiDa) {
        return `${voucher.giaTriGiam}% (Giảm tối đa: ${voucher.giamToiDa.toLocaleString()} VND)`;
      } else {
        return `${voucher.giaTriGiam}% - ${this.discountAmount.toLocaleString()} VND`;
      }
    }

    return '0 VND';
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
      this.discountAmount = 0;
      this.selectedVoucher = null;
      this.updateInvoiceTotal();
      return;
    }

    this.updateVoucher();
  }

  // Thêm phương thức chọn số tiền nhanh
  selectQuickAmount(amount: number) {
    if (!this.selectedInvoice) return;

    // Nếu số tiền nhỏ hơn tổng tiền cần thanh toán, cộng thêm vào số tiền hiện tại
    if (amount < this.selectedInvoice.tongTienThanhToan) {
      this.tienKhachDua += amount;
    } else {
      // Nếu số tiền lớn hơn hoặc bằng tổng tiền cần thanh toán, gán trực tiếp
      this.tienKhachDua = amount;
    }
    this.tinhTienThua();
  }

  // Sửa lại phương thức checkout
  checkout() {
    console.log('Bắt đầu thanh toán...');
    console.log('Giỏ hàng:', this.cart);
    console.log('Phương thức thanh toán:', this.selectedPaymentMethod);
    console.log('Hóa đơn được chọn:', this.selectedInvoice);

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

    // Xử lý theo phương thức thanh toán
    const paymentMethod = Number(this.selectedPaymentMethod);
    console.log('Xử lý thanh toán với phương thức:', paymentMethod);

    switch (paymentMethod) {
      case 2: // Tiền mặt
        console.log('Xử lý thanh toán tiền mặt');
        this.showPaymentPopup = true;
        this.tienKhachDua = 0;
        this.tienThua = -this.selectedInvoice.tongTienThanhToan;
        this.tinhTienThua()
        break;

      case 3: // Chuyển khoản
        console.log('Xử lý thanh toán chuyển khoản');
        if (confirm('Xác nhận đã nhận được tiền chuyển khoản?')) {
          this.processPayment();
        }
        break;

      default:
        console.error('Phương thức thanh toán không hợp lệ:', paymentMethod);
        alert('Phương thức thanh toán không hợp lệ!');
        break;
    }
  }

  // Thêm phương thức tính tiền thừa
  tinhTienThua() {
    if (!this.selectedInvoice) return;

    console.log('Tính tiền thừa:');
    console.log('Tiền khách đưa:', this.tienKhachDua);
    console.log('Tổng tiền hóa đơn:', this.selectedInvoice.tongTienThanhToan);

    // Nếu chưa nhập hoặc nhập sai định dạng, tiền thừa = 0
    if (!this.tienKhachDua || isNaN(this.tienKhachDua)) {
      this.tienThua = 0;
      console.log('Tiền khách chưa đưa hợp lệ => Tiền thừa = 0');
      return;
    }

    // Đảm bảo tiền khách đưa không âm
    if (this.tienKhachDua < 0) {
      this.tienKhachDua = 0;
      this.tienThua = -this.selectedInvoice.tongTienThanhToan;
    }
    else {
      this.tienThua = this.tienKhachDua - this.selectedInvoice.tongTienThanhToan;
    }
    console.log('Tiền thừa:', this.tienThua);
  }

  // Thêm phương thức xác nhận thanh toán từ popup
  confirmPayment() {
    console.log('Xác nhận thanh toán tiền mặt');
    console.log('Tiền khách đưa:', this.tienKhachDua);
    console.log('Tiền thừa:', this.tienThua);

    if (this.tienKhachDua < this.selectedInvoice!.tongTienThanhToan) {
      alert('Số tiền khách đưa không đủ!');
      return;
    }
    this.showPaymentPopup = false;
    this.processPayment();
  }

  // Thêm phương thức hủy popup thanh toán
  cancelPayment() {
    this.showPaymentPopup = false;
    this.tienKhachDua = 0;
    this.tienThua = 0;
  }

  // Sửa lại phương thức processPayment
  private processPayment() {
    console.log('Xử lý thanh toán cho hóa đơn:', this.selectedInvoice);
    const tongTienTruocVoucher = this.getTotal();
    const tongTienThanhToan = tongTienTruocVoucher - this.discountAmount;

    if (!this.selectedInvoice) {
      console.error('Không có hóa đơn được chọn');
      alert('Vui lòng chọn hóa đơn!');
      return;
    }

    const request = {
      ...this.selectedInvoice,
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      tongTienTruocVoucher,
      tongTienThanhToan,
      trangThai: 7, // Trạng thái đã thanh toán
      tenNguoiNhan: this.tenKhachHang || 'Khách vãng lai',
      sdtNguoiNhan: this.sdtNguoiNhan || ''
    };

    console.log('Dữ liệu cập nhật hóa đơn:', request);

    this.banhangService.updateHoaDon(this.selectedInvoice.id, request).subscribe(
      (response) => {
        console.log('Cập nhật hóa đơn thành công:', response);
        // Hiển thị thông báo tùy theo phương thức thanh toán
        switch (Number(this.selectedPaymentMethod)) {
          case 2: // Tiền mặt
            alert(`Thanh toán tiền mặt thành công!`);
            break;

          case 3: // Chuyển khoản
            alert('Thanh toán chuyển khoản thành công!');
            this.closeQuetQr(); // Đóng QR code nếu đang mở
            break;
        }

        this.resetAfterCheckout();
        if (confirm('Bạn có muốn xuất hóa đơn PDF không?')) {
          this.exportPDF(response.id);
        }
      },
      (error) => {
        const message = error?.error?.error || 'Đã xảy ra lỗi khi cập nhật hóa đơn';
        alert(message);
        if (this.selectedInvoice?.tongTienTruocVoucher) {
          this.selectedInvoice.tongTienThanhToan = this.selectedInvoice.tongTienTruocVoucher;
          this.discountAmount = 0;
          this.selectedDiscount = null
          this.getVoucher(this.selectedInvoice.tongTienTruocVoucher)
          this.applyDiscount()
        }
      }
    );
  }

  private resetAfterCheckout(): void {
    console.log('Reset sau khi thanh toán');
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


  getVoucher(cartTotal: number): void {
    console.log("Tổng tiền gửi vào voucher API:", cartTotal);

    this.banhangService.getVouchers(cartTotal).subscribe(
      (response: any) => {
        this.discountCodes = response;

        if (this.selectedDiscount && this.selectedInvoice && this.cart.length > 0) {
          this.applyDiscount();
        }
      },
      (error) => {
        console.error("Lỗi khi lấy danh sách voucher", error);
      }
    );
  }


  // Cập nhật tổng tiền hóa đơn: tongTienTruocVoucher và tongTienThanhToan
  updateInvoiceTotal(): void {
    const preVoucher = this.getTotal();
    this.cartTotal = this.getTotal()
    const totalAfterVoucher = preVoucher - this.discountAmount;
    if (this.selectedInvoice) {
      this.selectedInvoice.tongTienTruocVoucher = preVoucher;
      this.selectedInvoice.tongTienThanhToan = totalAfterVoucher;
      const updatedInvoice = {
        ...this.selectedInvoice,
        idVoucher: this.selectedDiscount,
        idPhuongThucThanhToan: this.selectedPaymentMethod,
        tongTienTruocVoucher: preVoucher,
        tongTienThanhToan: totalAfterVoucher,
        tenNguoiNhan: this.tenKhachHang || 'Khách vãng lai',
        sdtNguoiNhan: this.sdtNguoiNhan || ''
      };

      this.banhangService.updateHoaDon(updatedInvoice.id, updatedInvoice).subscribe(
        response => {
          this.selectedInvoice = response;
          console.log('Cập nhật hóa đơn thành công:', response);
          this.cdr.detectChanges();
        },
        error => {
          const message = error?.error?.error || 'Đã xảy ra lỗi khi cập nhật hóa đơn';
          alert(message);
          if (this.selectedInvoice?.tongTienTruocVoucher != null) {
            this.selectedInvoice.tongTienThanhToan = this.selectedInvoice.tongTienTruocVoucher;
            this.selectedDiscount = null;
            this.discountAmount = 0
            this.getVoucher(this.selectedInvoice.tongTienTruocVoucher);
          }
        }
      );
    }
  }

  loadPaymentMethods(): void {
    console.log('Đang tải phương thức thanh toán...');
    this.banhangService.getDanhSachPTTT().subscribe(
      (data: any[]) => {
        console.log('Dữ liệu phương thức thanh toán từ API:', data);
        // Lọc ra chỉ những phương thức có id là 2 hoặc 3
        this.paymentMethods = data.filter(method => method.id === 2 || method.id === 3);
        console.log('Danh sách phương thức thanh toán sau khi lọc:', this.paymentMethods);

        if (this.paymentMethods.length > 0) {
          this.selectedPaymentMethod = Number(this.paymentMethods[0].id);
          console.log('Phương thức thanh toán mặc định:', this.selectedPaymentMethod);
          this.cdr.detectChanges();
        } else {
          console.error('Không có phương thức thanh toán nào');
          alert('Không thể tải danh sách phương thức thanh toán. Vui lòng kiểm tra lại.');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu phương thức thanh toán:', error);
        alert('Không thể tải danh sách phương thức thanh toán. Vui lòng thử lại.');
      }
    );
  }

  logSelectedMethod() {
    console.log('Phương thức thanh toán đã chọn:', this.selectedPaymentMethod);
  }

  loadInvoices(): void {
    const idNhanVien = localStorage.getItem('idNhanVien');

    if (!idNhanVien) {
      console.error('Không tìm thấy idNhanVien trong localStorage');
      return;
    }

    this.banhangService.getDanhSachHD({}, +idNhanVien).subscribe(
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
    console.log('Phương thức thanh toán được chọn:', this.selectedPaymentMethod);
    if (Number(this.selectedPaymentMethod) === 3) {
      this.openQuetQr();
    } else {
      this.closeQuetQr();
    }
  }

  openQuetQr() {
    this.quetQr = true;
  }

  closeQuetQr() {
    this.quetQr = false;
  }

  // Thêm phương thức updateCartItem
  updateCartItem(item: any) {
    if (!this.selectedInvoice) {
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
                this.loadSanPhamToBanHang();
                this.loadAllSanPham();
                this.layChiTietHoaDon();
                this.getVoucher(this.getTotal());
                this.updateVoucher();
              },
              error => {
                console.error('Lỗi khi cập nhật số lượng tồn:', error);
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

    console.log('Bắt đầu hủy hóa đơn:', invoice.id);

    // Gọi trực tiếp API hủy hóa đơn, backend sẽ tự động hoàn trả số lượng
    this.processInvoiceCancellation(invoice.id);
  }

  private processInvoiceCancellation(invoiceId: number) {
    console.log('Tiến hành hủy hóa đơn:', invoiceId);
    this.banhangService.cancelHoaDon(invoiceId).subscribe(
      response => {
        console.log('Hủy hóa đơn thành công:', response);
        this.loadInvoices();
        this.selectedInvoice = null;
        this.cart = [];
        this.selectedDiscount = null;
        this.discountAmount = 0;
        // Load lại danh sách sản phẩm để cập nhật số lượng mới
        this.loadSanPhamToBanHang();
        this.loadAllSanPham();
        alert('Đã hủy hóa đơn thành công.');
      },
      error => {
        console.error('Lỗi khi hủy hóa đơn:', error);
        alert('Không thể hủy hóa đơn. Vui lòng thử lại.');
      }
    );
  }

  // Lấy danh sách nhân viên
  layDanhSachNhanVien() {
    this.banhangService.getDanhSachNhanVien(null).subscribe(
      (data: any[]) => {
        this.danhSachNhanVien = data;
        console.log("danhsach", data)
        const idNhanVienDangNhap = localStorage.getItem('idNhanVien');
        const nhanVienDangNhap = data.find(nv => nv.id.toString() === idNhanVienDangNhap);
        if (nhanVienDangNhap) {
          // Gán tên vào biến
          this.tenNhanVien = nhanVienDangNhap.ten;
          console.log("tên nhân viên", this.tenNhanVien)
          this.selectedNhanVien = nhanVienDangNhap.id;
          console.log('Tên nhân viên đăng nhập:', this.tenNhanVien);
        }
      },
      (error: any) => {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        alert('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
      }
    );
  }

  onTienKhachDuaChange(value: string) {
    const numericValue = value.replace(/[^0-9]/g, '');
    this.tienKhachDua = numericValue ? parseInt(numericValue) : 0;
    this.tinhTienThua();
  }


  clearTienKhachDua() {
    if (this.tienKhachDua === 0) {
      this.tienKhachDua = 0;
    }
  }

  // Thêm phương thức xử lý khi focus vào input
  onQuantityFocus(item: any) {
    // Lưu lại giá trị số lượng trước khi sửa
    this.previousQuantity = item.soLuong;
    console.log("số lượng cũ", this.previousQuantity)
  }

  // Thêm phương thức xử lý khi blur khỏi input
  onQuantityBlur(item: any, event: any) {
    const newQuantity = item.soLuong;
    item.maSanPhamChiTiet
    console.log(item.maSanPhamChiTiet)
    // Load lại toàn bộ danh sách sản phẩm để có thông tin mới nhất
    this.banhangService.getAllSanPham().subscribe(
      response => {
        if (response && response.content) {
          this.allSanPhams = response.content.map((sp: any) => ({
            ...sp,
            anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
          }));

          // Tìm sản phẩm trong danh sách tất cả sản phẩm
          const product = this.allSanPhams.find((p: SanPham) => p.id === item.idSanPhamChiTiet);

          if (!product) {
            item.soLuong = this.previousQuantity;
            this.cdr.detectChanges();
            alert('Không tìm thấy thông tin sản phẩm!');
            return;
          }

          // Kiểm tra các điều kiện
          if (isNaN(newQuantity) || newQuantity < 1) {
            item.soLuong = this.previousQuantity;
            this.cdr.detectChanges();
            alert('Số lượng phải lớn hơn 0!');
            return;
          }

          // Kiểm tra số lượng tồn kho
          if (newQuantity > product.soLuong + this.previousQuantity) {
            item.soLuong = this.previousQuantity;
            this.cdr.detectChanges();
            alert(`Số lượng vượt quá số lượng trong kho!`);
            this.loadSanPhamToBanHang()
            return;
          }

          // Nếu số lượng hợp lệ, tiến hành cập nhật
          this.banhangService.updateHoaDonChiTiet(item.id, newQuantity).subscribe(
            response => {
              console.log('Cập nhật số lượng thành công:', response);

              const product = this.allSanPhams.find(p => p.maSanPhamChiTiet === item.maSanPhamChiTiet);
              if (!product) {
                console.warn('Không tìm thấy sản phẩm trong allSanPhams để cập nhật số lượng');
                return
              }

              const soLuongHienTaiTrongKho = product.soLuong;
              const soLuongTonMoi = soLuongHienTaiTrongKho + this.previousQuantity - newQuantity;

              console.log(`Số lượng tồn kho hiện tại: ${soLuongHienTaiTrongKho}`);
              console.log(`Số lượng mới: ${newQuantity}`);
              console.log(`Số lượng tồn mới: ${soLuongTonMoi}`);
              console.log(`Số lượng tồn cũ: ${this.previousQuantity}`);
              if (soLuongTonMoi >= 0) {
                console.log(`Số lượng tồn mới đưa vào: ${soLuongTonMoi}`);
                this.banhangService.updateSoLuongSanPham(item.idSanPhamChiTiet, soLuongTonMoi, soLuongTonMoi < 0).subscribe(
                  () => {
                    console.log('Cập nhật số lượng tồn thành công');
                    this.loadSanPhamToBanHang();
                    this.loadAllSanPham();
                    this.layChiTietHoaDon();
                    // Cập nhật voucher ngay sau khi cập nhật số lượng
                    this.getVoucher(this.getTotal());
                    this.updateVoucher();
                  },
                  error => {
                    console.error('Lỗi khi cập nhật số lượng tồn:', error);
                    item.soLuong = this.previousQuantity;
                    this.cdr.detectChanges();
                  }
                );
              }

              this.updateInvoiceTotal();
              this.cdr.detectChanges();
            },
            error => {
              console.error('Lỗi khi cập nhật số lượng:', error);
              item.soLuong = this.previousQuantity;
              this.cdr.detectChanges();
              alert('Lỗi khi cập nhật số lượng!');
            }
          );
        } else {
          console.error('Invalid response format:', response);
          item.soLuong = this.previousQuantity;
          this.cdr.detectChanges();
          alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        }
      },
      error => {
        console.error('Error loading products:', error);
        item.soLuong = this.previousQuantity;
        this.cdr.detectChanges();
        alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
      }
    );
  }
}
