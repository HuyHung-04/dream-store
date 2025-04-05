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

  bankId = 'vietinbank'; // mã ngân hàng viết thường
  accountNo = '0379083813';
  template = 'compact';
  addInfo = 'thanh toan hoa don';
  accountName = 'HOANG HUY HUNG';

  // Thêm mảng số tiền nhanh
  quickAmounts: number[] = [100000, 200000, 500000, 1000000];

  // Thêm các biến mới cho tìm kiếm khách hàng
  searchKhachHang: string = '';
  filteredKhachHang: KhachHang[] = [];

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
    this.getVoucher();
    this.cart = [];
  }

  private loadAllSanPham(): void {
    console.log('Loading all products...');
    this.banhangService.getAllSanPham().subscribe(
      response => {
        console.log('Response from getAllSanPham:', response);
        if (response && response.content) {
          this.allSanPhams = response.content.map((sp: any) => ({
            ...sp,
            anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
          }));
          console.log('Loaded all products:', this.allSanPhams);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error => {
        console.error('Error loading all products:', error);
      }
    );
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
            console.log('=== THÔNG TIN CHI TIẾT GIỎ HÀNG ===');
            if (data && data.length > 0) {
              console.log('Cấu trúc của một item trong cart:');
              const sampleItem = data[0];
              console.log({
                id: sampleItem.id,
                maSanPhamChiTiet: sampleItem.maSanPhamChiTiet,
                tenSanPham: sampleItem.tenSanPham,
                gia: sampleItem.gia,
                giaTriGiam: sampleItem.giaTriGiam,
                hinhThucGiam: sampleItem.hinhThucGiam,
                soLuong: sampleItem.soLuong,
                tenMau: sampleItem.tenMau,
                tenSize: sampleItem.tenSize,
                idSanPhamChiTiet: sampleItem.idSanPhamChiTiet,
                idHoaDon: sampleItem.idHoaDon,
                trangThai: sampleItem.trangThai
              });
              
              console.log('\nDanh sách tất cả items trong cart:');
              data.forEach((item, index) => {
                console.log(`\nItem ${index + 1}:`, item);
              });
            } else {
              console.log('Giỏ hàng trống');
            }
            
            // Gán soLuongBanDau cho mỗi sản phẩm trong giỏ hàng - bằng với soLuong hiện tại
            this.cart = data ? data.map(item => ({
              ...item,
              soLuongBanDau: item.soLuong
            })) : [];
            
            const total = this.getTotal();
            console.log('\nTổng tiền trước voucher:', total);
            
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
                        ? voucher.giaTriGiam
                        : total * (voucher.giaTriGiam / 100);

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
        console.log(this.selectedInvoice);
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
    const khachHangVangLai = {
      ten: 'Khách vãng lai',
      soDienThoai: '',
      email: '',
      diaChi: ''
    };

    // Lưu khách hàng vãng lai vào database
    this.banhangService.createKhachHang(khachHangVangLai).subscribe(
      (response: any) => {
        console.log('Tạo mới khách hàng vãng lai thành công:', response);
        this.selectedKhachHang = response;
        this.tenKhachHang = response.ten;
        this.sdtNguoiNhan = '';
        this.hienThiDanhSachKhachHang = false;

        // Nếu đã có hóa đơn được chọn, cập nhật thông tin khách hàng
        if (this.selectedInvoice) {
          const updatedInvoice = {
            ...this.selectedInvoice,
            idKhachHang: response.id,
            tenNguoiNhan: response.ten,
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
        console.error('Lỗi khi tạo mới khách hàng vãng lai:', error);
        alert('Không thể tạo khách hàng vãng lai. Vui lòng thử lại.');
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

  filterSanPham() {
    this.loadSanPhamToBanHang();
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  validateQuantity(item: any, newQuantity: number) {
    console.log('=== Cập nhật số lượng ===');
    console.log('Item cập nhật:', item);
    console.log('Số lượng mới:', newQuantity);
    
    const oldQuantity = item.soLuong;
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      item.soLuong = 1;
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    // Kiểm tra số lượng ban đầu nếu có
    if (item.soLuongBanDau !== undefined) {
      if (newQuantity > item.soLuongBanDau) {
        alert(`Số lượng không thể vượt quá số lượng ban đầu (${item.soLuongBanDau})!`);
        item.soLuong = oldQuantity;
        return;
      }
    }

    // Load all products and wait for the response before continuing
    this.banhangService.getAllSanPham().subscribe(
      response => {
        console.log('Response from getAllSanPham:', response);
        if (response && response.content) {
          this.allSanPhams = response.content.map((sp: any) => ({
            ...sp,
            anhUrl: sp.anhUrl ? `http://localhost:8080${sp.anhUrl}` : 'assets/images/no-image.png'
          }));
          
          console.log('Searching for product...');
          console.log('Item details:', {
            id: item.idSanPhamChiTiet,
            code: item.maSanPhamChiTiet
          });

          let product = this.allSanPhams.find(p => p.id === item.idSanPhamChiTiet);
          
          if (!product) {
            console.log('Product not found by ID, trying by code:', item.maSanPhamChiTiet);
            product = this.allSanPhams.find(p => p.maSanPhamChiTiet === item.maSanPhamChiTiet);
          }
          
          if (!product) {
            console.error('Product not found in inventory. Details:', {
              searchedId: item.idSanPhamChiTiet,
              searchedCode: item.maSanPhamChiTiet,
              availableProducts: this.allSanPhams.length
            });
            alert('Không tìm thấy sản phẩm trong kho! Vui lòng thử lại.');
            item.soLuong = oldQuantity;
            this.cdr.detectChanges();
            return;
          }

          console.log('Found product:', product);
          const difference = newQuantity - oldQuantity;
          console.log('Calculated difference:', difference, 'oldQuantity:', oldQuantity, 'newQuantity:', newQuantity);
          
          const availableQuantity = product.soLuong + oldQuantity;
          console.log('Available quantity:', availableQuantity, 'Product stock:', product.soLuong);

          if (newQuantity > availableQuantity) {
            alert('Số lượng sản phẩm trong kho không đủ!');
            item.soLuong = oldQuantity;
            this.cdr.detectChanges();
            return;
          }

          this.banhangService.updateHoaDonChiTiet(item.id, newQuantity).subscribe(
            response => {
              console.log('updateHoaDonChiTiet response:', response);
              if (response.error) {
                alert(response.error);
                item.soLuong = oldQuantity;
                this.cdr.detectChanges();
                return;
              }

              // Always update the UI regardless of quantity change
              this.banhangService.updateSoLuongSanPham(product.id, Math.abs(difference), difference < 0).subscribe(
                () => {
                  console.log('updateSoLuongSanPham success');
                  
                  // Update both lists and force refresh
                  this.loadSanPhamToBanHang();
                  
                  // Update cart item
                  item.soLuong = newQuantity;
                  this.cart = [...this.cart];
                  
                  // Update totals
                  this.updateInvoiceTotal();
                  this.updateVoucher();
                  
                  // Force change detection
                  this.cdr.detectChanges();
                  
                  // Verify updates
                  setTimeout(() => {
                    console.log('Verifying updates...');
                    this.loadSanPhamToBanHang();
                  }, 100);
                },
                error => {
                  console.error('Lỗi khi cập nhật số lượng tồn:', error);
                  item.soLuong = oldQuantity;
                  this.cart = [...this.cart];
                  this.cdr.detectChanges();
                }
              );
            },
            error => {
              console.error('Lỗi khi cập nhật số lượng:', error);
              if (error.error && error.error.message) {
                alert(error.error.message);
              } else {
                alert('Cập nhật số lượng thất bại!');
              }
              item.soLuong = oldQuantity;
              this.cart = [...this.cart];
              this.cdr.detectChanges();
            }
          );
        } else {
          console.error('Invalid response format:', response);
          alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
          item.soLuong = oldQuantity;
          this.cdr.detectChanges();
        }
      },
      error => {
        console.error('Error loading products:', error);
        alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        item.soLuong = oldQuantity;
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
    console.log('=== Thêm vào giỏ hàng ===');
    console.log('Sản phẩm thêm:', product);
    console.log('Sản phẩm đã tồn tại:', existingCartItem);
    if (existingCartItem) {
      // Nếu sản phẩm đã tồn tại, thêm trực tiếp vào hóa đơn
      this.banhangService.addSanPhamToHoaDon(this.selectedInvoice.id, product.id, 1).subscribe(
        (response: any) => {
          console.log('Thêm sản phẩm vào hóa đơn:', response);
          
          // Cập nhật UI trực tiếp thay vì gọi API
          const productIndex = this.sanPhams.findIndex(p => p.id === product.id);
          if (productIndex !== -1) {
            this.sanPhams[productIndex] = {
              ...this.sanPhams[productIndex],
              soLuong: this.sanPhams[productIndex].soLuong - 1
            };
            // Tạo một mảng mới để trigger change detection
            this.sanPhams = [...this.sanPhams];
          }
          
          // Lấy lại danh sách chi tiết hóa đơn để cập nhật giỏ hàng
          this.banhangService.searchHDCT({ idHoaDon: this.selectedInvoice?.id }).subscribe(
            (cartData) => {
              console.log('Danh sách hóa đơn chi tiết sau khi thêm:', cartData);
              this.cart = cartData.map(item => ({
                ...item,
                soLuongBanDau: item.idSanPhamChiTiet === product.id ? 
                  (existingCartItem.soLuongBanDau || existingCartItem.soLuong) + 1 : 
                  (item.soLuongBanDau || item.soLuong)
              })) || [];
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
          console.error('Lỗi khi thêm sản phẩm vào hóa đơn:', error);
          alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
        }
      );
      return;
    }

    // Thêm sản phẩm vào hóa đơn
    this.banhangService.addSanPhamToHoaDon(this.selectedInvoice.id, product.id, 1).subscribe(
      (response: any) => {
        console.log('Thêm sản phẩm vào hóa đơn:', response);
        
        // Cập nhật UI trực tiếp thay vì gọi API
        const productIndex = this.sanPhams.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
          this.sanPhams[productIndex] = {
            ...this.sanPhams[productIndex],
            soLuong: this.sanPhams[productIndex].soLuong - 1
          };
          // Tạo một mảng mới để trigger change detection
          this.sanPhams = [...this.sanPhams];
        }
        
        // Lấy lại danh sách chi tiết hóa đơn để cập nhật giỏ hàng
        this.banhangService.searchHDCT({ idHoaDon: this.selectedInvoice?.id }).subscribe(
          (cartData) => {
            console.log('Danh sách hóa đơn chi tiết sau khi thêm:', cartData);
            // Gán soLuongBanDau cho mỗi sản phẩm trong giỏ hàng
            this.cart = cartData.map(item => ({
              ...item,
              soLuongBanDau: item.idSanPhamChiTiet === product.id ? product.soLuong + 1 : (item.soLuongBanDau || item.soLuong)
            })) || [];
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

  // Tính đơn giá sau khuyến mãi
  calculateDiscountedPrice(item: any): number {
    if (!item) return 0;
    return item.gia - (item.gia * item.giaTriGiamKM / 100);
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
          ? voucher.giaTriGiam
          : total * (voucher.giaTriGiam / 100);

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
    
    this.tienThua = this.tienKhachDua - this.selectedInvoice.tongTienThanhToan;
    // Đảm bảo tiền khách đưa không âm
    if (this.tienKhachDua < 0) {
      this.tienKhachDua = 0;
      this.tienThua = -this.selectedInvoice.tongTienThanhToan;
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
      idVoucher: this.selectedDiscount,
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
            alert(`Thanh toán tiền mặt thành công!\nTiền thừa: ${this.tienThua.toLocaleString('vi-VN')} VNĐ`);
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
        console.error('Lỗi khi thanh toán:', error);
        alert('Thanh toán thất bại! Vui lòng thử lại.');
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
          console.error('Lỗi khi cập nhật hóa đơn:', error);
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
    console.log('Phương thức thanh toán được chọn:', this.selectedPaymentMethod);
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
}
