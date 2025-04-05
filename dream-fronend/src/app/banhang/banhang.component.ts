import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { BanhangService } from './banhang.service';
import { HttpParams } from '@angular/common/http';

interface HoaDon {
  id: number;
  idNhanVien: number;
  idKhachHang: number;
  idVoucher?: number;
  maHoaDon: string;
  tenNguoiNhan: string;
  sdtNguoiNhan: string;
  diaChiNhanHang: string;
  tongTienTruocVoucher: number;
  tongTienThanhToan: number;
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
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
  quetQr: boolean = false;

  bankId = 'vietinbank'; // mã ngân hàng viết thường
  accountNo = '0379083813';
  template = 'compact';
  addInfo = 'thanh toan hoa don';
  accountName = 'HOANG HUY HUNG';

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
    // Kiểm tra nếu là khách vãng lai thì tạo khách hàng vãng lai trước
    if (this.tenKhachHang === 'Khách vãng lai') {
      const newKhachHang = {
        ten: 'Khách vãng lai',
        soDienThoai: '',
        email: '',
        diaChi: '',
        trangThai: 1
      };

      this.banhangService.createKhachHang(newKhachHang).subscribe(
        (khachHangResponse: any) => {
          // Sau khi tạo khách hàng vãng lai thành công, tạo hóa đơn
          const request = {
            idKhachHang: khachHangResponse.id,
            idNhanVien: this.selectedNhanVien,
            idVoucher: this.selectedDiscount ? this.selectedDiscount.id : null,
            idPhuongThucThanhToan: this.selectedPaymentMethod ? this.selectedPaymentMethod : null,
            tenNguoiNhan: this.tenKhachHang,
            sdtNguoiNhan: '',
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
        },
        (error) => {
          console.error('Lỗi khi tạo khách hàng vãng lai:', error);
        }
      );
      return;
    }

    // Kiểm tra cho khách hàng thường
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
    // Reset voucher khi chọn hóa đơn mới
    this.selectedDiscount = null;
    this.discountAmount = 0;

    this.banhangService.getHoaDonById(response.id).subscribe(
      (hoaDon: HoaDon) => {
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
        if (hoaDon && hoaDon.idNhanVien) {
          // @ts-ignore
          this.banhangService.getNhanVienById(hoaDon.idNhanVien!).subscribe(
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

        // Load thông tin voucher nếu hóa đơn đã có voucher
        if (hoaDon.idVoucher) {
          // Tìm voucher trong danh sách vouchers
          const voucher = this.discountCodes.find(v => v.id === hoaDon.idVoucher);
          if (voucher) {
            this.selectedDiscount = voucher.id;
            this.updateVoucherSilently(); // Sử dụng phiên bản không gọi refreshInvoice
          } else {
            // Nếu chưa có danh sách voucher, load lại danh sách và tìm
            this.banhangService.getVoucher().subscribe(
              (vouchers: any[]) => {
                this.discountCodes = vouchers;
                const foundVoucher = vouchers.find(v => v.id === hoaDon.idVoucher);
                if (foundVoucher) {
                  this.selectedDiscount = foundVoucher.id;
                  this.updateVoucherSilently(); // Sử dụng phiên bản không gọi refreshInvoice
                }
              }
            );
          }
        }

        // Load chi tiết hóa đơn và cập nhật tổng tiền
        this.layChiTietHoaDon();
        this.getTotal();
        
        // Cập nhật lại tổng tiền và voucher sau khi load xong chi tiết
        setTimeout(() => {
          this.updateInvoiceTotal();
          if (hoaDon.idVoucher) {
            this.updateVoucherSilently();
          }
        }, 500);
      },
      (error) => console.error('Lỗi khi lấy hóa đơn:', error)
    );
  }

  // Phiên bản của updateVoucher không gọi refreshInvoice
  updateVoucherSilently() {
    const total = this.getTotal();

    this.banhangService.getDetailVoucher(this.selectedDiscount).subscribe(
      (voucher: any) => {
        if (!voucher) {
          alert("Không tìm thấy thông tin voucher!");
          return;
        }

        // Kiểm tra điều kiện giảm giá tối thiểu
        if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
          this.discountAmount = 0;
          this.updateInvoiceTotal();
          return;
        }

        // Tính giá trị giảm giá ban đầu
        let discountAmount: number;

        if (voucher.hinhThucGiam) {
          // Giảm theo phần trăm (hinhThucGiam = true)
          discountAmount = total * (voucher.giaTriGiam / 100);
        } else {
          // Giảm số tiền cố định (hinhThucGiam = false)
          discountAmount = voucher.giaTriGiam;
        }

        // Kiểm tra giá trị tối đa
        if (voucher.giamToiDa && discountAmount > Number(voucher.giamToiDa)) {
          discountAmount = Number(voucher.giamToiDa);
        }

        // Gán giá trị cuối cùng
        this.discountAmount = discountAmount;
        this.updateInvoiceTotal();
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin voucher:', error);
      }
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

  // Chọn khách hàng vãng lai
  chonKhachHangVangLai() {
    const khachHangVangLai = {
      id: null,
      ten: 'Khách vãng lai',
      soDienThoai: '',
      email: '',
      diaChi: '',
      trangThai: 1
    };

    this.selectedKhachHang = khachHangVangLai;
    this.tenKhachHang = khachHangVangLai.ten;
    this.soDienThoai = '';
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
      this.cdr.detectChanges();
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

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  validateQuantity(item: any) {
    const oldQuantity = item.soLuong;

    if (isNaN(item.soLuong) || item.soLuong < 1) {
      item.soLuong = 1;
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    // Tìm sản phẩm trong danh sách sản phẩm để kiểm tra số lượng tồn
    const product = this.sanPhams.find(p => p.id === item.idSanPham);
    if (product) {
      // Tính toán số lượng thay đổi
      const difference = oldQuantity - item.soLuong;
      // Kiểm tra xem có đủ số lượng để tăng không
      if (difference < 0 && Math.abs(difference) > product.soLuong) {
        alert('Số lượng sản phẩm trong kho không đủ!');
        item.soLuong = oldQuantity;
        return;
      }
    }

    // Cập nhật số lượng trong giỏ hàng trước
    this.banhangService.updateHoaDonChiTiet(item.id, item.soLuong).subscribe(
      response => {
        if (response.error) {
          alert(response.error);
          item.soLuong = oldQuantity;
          return;
        }

        console.log('Cập nhật số lượng thành công:', response);

        const difference = oldQuantity - item.soLuong;
        
        if (difference !== 0) {
          // Cập nhật số lượng tồn kho
          this.banhangService.updateSoLuongSanPham(item.idSanPham, Math.abs(difference), difference > 0).subscribe(
            () => {
              console.log('Cập nhật số lượng tồn thành công');
              // Load lại danh sách sản phẩm để đảm bảo số lượng chính xác
              this.loadSanPhamToBanHang();
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
        this.updateVoucherSilently();
      },
      error => {
        console.error('Lỗi khi cập nhật số lượng:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Cập nhật số lượng thất bại!');
        }
        // Khôi phục lại số lượng cũ nếu cập nhật thất bại
        item.soLuong = oldQuantity;
        this.cdr.detectChanges();
      }
    );
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
            this.updateCartItem(existingItem);
        } else {
            alert('Số lượng sản phẩm không đủ!');
            return;
        }
    } else {
        this.cart.push({ ...product, soLuong: 1 });
    }

    this.cart = [...this.cart]; // Cập nhật lại danh sách giỏ hàng

    this.banhangService.addSanPhamToHoaDon(hoaDonId, product.id, 1).subscribe(
        response => {
            console.log('Thêm sản phẩm vào hóa đơn:', response);
            
            // Cập nhật số lượng tồn kho
            this.banhangService.updateSoLuongSanPham(product.id, 1, false).subscribe(
                () => {
                    console.log('Cập nhật số lượng tồn thành công');
                    // Load lại danh sách sản phẩm để đảm bảo số lượng chính xác
                    this.loadSanPhamToBanHang();
                    // Load lại chi tiết hóa đơn để cập nhật giỏ hàng
                    this.layChiTietHoaDon();
                },
                error => {
                    console.error('Lỗi khi cập nhật số lượng tồn:', error);
                    // Xóa sản phẩm khỏi giỏ hàng nếu cập nhật thất bại
                    this.cart = this.cart.filter(i => i.id !== product.id);
                    this.cdr.detectChanges();
                }
            );
            this.selectInvoice(this.selectedInvoice);
            this.updateInvoiceTotal();
            this.updateVoucherSilently();
        },
        error => {
            console.error('Lỗi khi thêm sản phẩm vào hóa đơn:', error);
            // Xóa sản phẩm khỏi giỏ hàng nếu thêm thất bại
            this.cart = this.cart.filter(i => i.id !== product.id);
            this.cdr.detectChanges();
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
    const soLuongHoanLai = item.soLuong;
    const idSanPham = item.idSanPham;

    this.banhangService.deleteHoaDonChiTiet(hoaDonChiTietId).subscribe(
        response => {
            console.log('Xóa sản phẩm khỏi giỏ hàng:', response);
            this.cart = this.cart.filter(i => i.id !== item.id);
            
            // Cập nhật lại số lượng tồn kho
            this.banhangService.updateSoLuongSanPham(idSanPham, soLuongHoanLai, true).subscribe(
                () => {
                    console.log('Cập nhật số lượng tồn thành công');
                    // Load lại danh sách sản phẩm để đảm bảo số lượng chính xác
                    this.loadSanPhamToBanHang();
                    // Load lại chi tiết hóa đơn để cập nhật giỏ hàng
                    this.layChiTietHoaDon();
                },
                error => {
                    console.error('Lỗi khi cập nhật số lượng tồn:', error);
                    // Khôi phục lại sản phẩm trong giỏ hàng nếu cập nhật thất bại
                    this.cart.push(item);
                    this.cdr.detectChanges();
                }
            );

            this.updateInvoiceTotal();
            this.updateVoucherSilently();
        },
        error => {
            console.error('Lỗi khi xóa sản phẩm:', error);
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

    this.banhangService.getDetailVoucher(this.selectedDiscount).subscribe(
      (voucher: any) => {
        if (!voucher) {
          alert("Không tìm thấy thông tin voucher!");
          return;
        }
        console.log("Voucher từ API:", voucher);

        // Kiểm tra điều kiện giảm giá tối thiểu
        if (voucher.giaTriToiThieu && total < voucher.giaTriToiThieu) {
          this.discountAmount = 0;
          this.updateInvoiceTotal();
          this.refreshInvoice();
          return;
        }

        // Tính giá trị giảm giá ban đầu
        let discountAmount: number;
        let discountMessage: string;

        if (voucher.hinhThucGiam) {
          // Giảm theo phần trăm (hinhThucGiam = true)
          discountAmount = total * (voucher.giaTriGiam / 100);
        } else {
          // Giảm số tiền cố định (hinhThucGiam = false)
          discountAmount = voucher.giaTriGiam;
        }

        // Kiểm tra giá trị tối đa
        if (voucher.giamToiDa && discountAmount > Number(voucher.giamToiDa)) {
          discountAmount = Number(voucher.giamToiDa);
        }

        // Gán giá trị cuối cùng
        this.discountAmount = discountAmount;
        this.updateInvoiceTotal();
        this.refreshInvoice();
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin voucher:', error);
      }
    );
  }

  // Áp dụng mã giảm giá đã chọn
  applyDiscount() {
    if (!this.selectedInvoice) {
      alert("Vui lòng chọn hóa đơn trước khi áp dụng mã giảm giá!");
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

    // Tính toán tổng tiền trước khi áp dụng voucher
    const tongTienTruocVoucher = this.getTotal();

    // Tính toán tổng tiền sau khi áp dụng voucher
    const tongTienThanhToan = tongTienTruocVoucher - this.discountAmount;

    // Tạo đối tượng hóa đơn chi tiết
    const hoaDonChiTiets = this.cart.map(item => ({
      idSanPham: item.id,
      soLuong: item.soLuong,
      donGia: item.gia,
      thanhTien: item.soLuong * item.gia
    }));

    // Tạo đối tượng hóa đơn hoàn chỉnh
    const hoaDon = {
      id: this.selectedInvoice.id,
      idKhachHang: this.selectedKhachHang.id,
      idNhanVien: this.selectedNhanVien,
      idVoucher: this.selectedDiscount ? this.selectedDiscount.id : null,
      idPhuongThucThanhToan: this.selectedPaymentMethod,
      tenNguoiNhan: this.tenKhachHang,
      sdtNguoiNhan: this.soDienThoai,
      diaChiNhanHang: '',
      hinhThucThanhToan: '',
      phiVanChuyen: 0,
      tongTienTruocVoucher: tongTienTruocVoucher,
      tongTienThanhToan: tongTienThanhToan,
      ngayNhanDuKien: '',
      ngayTao: this.selectedInvoice.ngayTao,
      ngaySua: new Date().toISOString(),
      trangThai: 7,
      ghiChu: '',
      hoaDonChiTiets: hoaDonChiTiets
    };

    // Gọi API để lưu hóa đơn
    this.banhangService.updateHoaDon(hoaDon.id, hoaDon).subscribe(
      response => {
        alert(`Thanh toán thành công`);
        // Reset các trường
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
        // Lọc ra chỉ những phương thức có id là 2 hoặc 3
        this.paymentMethods = data.filter(method => method.id === 2 || method.id === 3);

        console.log(this.paymentMethods);

        if (this.paymentMethods.length > 0) {
          this.selectedPaymentMethod = this.paymentMethods[0].id;
        }
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu phương thức thanh toán:', error);
      }
    );
  }

  logSelectedMethod() {
    console.log('Phương thức thanh toán đã chọn:', this.selectedPaymentMethod);
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
          this.discountCode = '';
          this.discountAmount = 0;
          this.selectedKhachHang = null;
          this.tenKhachHang = '';
          this.soDienThoai = '';
          this.loadSanPhamToBanHang();
          this.selectedDiscount = null;
          alert('Hủy hóa đơn thành công!');
        },
        (error) => {
          console.error('Lỗi khi hủy hóa đơn:', error);
          alert('Hủy hóa đơn thất bại!');
        }
      );
    }
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
                this.updateVoucherSilently();
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

}
