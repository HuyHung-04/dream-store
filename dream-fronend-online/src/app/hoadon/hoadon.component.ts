import { HoadonService } from '../hoadon/hoadon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
interface Voucher {
  id: number;
  ten: string;
  giamToiDa: number;
  giaTriGiam: number;
  hinhThucGiam: boolean;
}


@Component({
  selector: 'app-hoadon',
  imports: [CommonModule, FormsModule],
  templateUrl: './hoadon.component.html',
  styleUrl: './hoadon.component.css'
})

export class HoadonComponent {
  diaChiList: any[] = [];
  idKhachHang: number = 0;
  khachHang: any = {
    tenKhachHang: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    tinhThanhPho: '',
    quanHuyen: '',
    phuongXa: ''
  };
  giaTriGiam?: number;
  giamToiDa?: number;
  hinhThucGiam?: boolean;
  tinhThanhPhoList: any[] = [];
  quanHuyenList: any[] = [];
  phuongXaList: any[] = [];
  chiTietGioHang: any[] = [];
  chonTinh: any = null;
  chonSdtNguoiNhan: any = null
  chonTenNguoiNhan: any = null
  chonDiaChiCuThe: any = null
  chonQuan: any = null;
  chonPhuongXa: any = null;
  selectedIndex: number | null = null;
  sdtNguoiNhan: string = '';
  idDiaChi: number | null = null;
  chonDiaChi: any = null;
  activeTab = 'select';
  isModalOpen = false;
  modalthongbao = false;
  isEditModalOpen = false;
  TongTienTamTinh: number = 0;
  chonVoucher: Voucher | null = null;
  errorMessage: string = '';
  shippingFee: number = 0;
  chonPhuongThucThanhToan: number | null = null;
  phuongThucThanhToan: any[] = [];
  vouchers: any[] = []; // Danh sách voucher
  tongTienThanhToan: number = 0;
  fullDiaChi: string = '';
  thongBaoTrong: boolean = false;
  maHoaDon: string = '';
  idHoaDon: number = 0;
  paymentUrl: string = '';
  newDiaChi = {
    id: '',
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    tinhThanhPho: '',
    quanHuyen: '',
    phuongXa: '',
    idKhachHang: this.idKhachHang
  };
  diaChiEdit = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
  constructor(private hoadonService: HoadonService, private router: Router, private cookieService: CookieService, private cdRef: ChangeDetectorRef, private activatedRoute: ActivatedRoute) { }

  idSanPhamBack: string = '';
  //   Khởi tạo component:
  //  - Kiểm tra đăng nhập qua cookie
  //  - Load địa chỉ, tỉnh thành, giỏ hàng, voucher
  //  - Xử lý callback từ VNPay

  ngOnInit(): void {
    const khachhangStr = this.cookieService.get('khachhang');
    if (khachhangStr) {
      const khachhang = JSON.parse(khachhangStr);
      this.idKhachHang = khachhang.id;
      this.resetForm();
      this.getDiaChiKhachHang();
      this.loadTinhThanh();
      this.getChiTietGioHangSauThanhToan();
      // this.getTamTinh();
      this.getVoucherIdAndTen();
    } else {
      alert("Bạn chưa đăng nhập!");
      this.router.navigate(['/dangnhap']);
    }
    this.loadPhuongThucThanhToan();
    this.vnpay()
  }



  // Xử lý phản hồi từ VNPay:
  // - Kiểm tra mã phản hồi thành công (00)
  // - Tạo hóa đơn từ dữ liệu trong localStorage

  vnpay(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const vnp_ResponseCode = params['vnp_ResponseCode'];
      if (vnp_ResponseCode === '00') {
        const paymentData = localStorage.getItem('paymentData');
        if (paymentData) {
          const chiTietThanhToan = JSON.parse(paymentData);
          this.createHoaDonFromVnPay(chiTietThanhToan);
          localStorage.removeItem('paymentData');
        }
      } else {
      }
    });
  }



  //  Tạo hóa đơn từ kết quả thanh toán VNPay thành công
  //  @param paymentData Dữ liệu thanh toán từ localStorage

  createHoaDonFromVnPay(paymentData: any): void {
    this.hoadonService.createHoaDonFull(paymentData).subscribe(
      (response) => {
        alert('Đơn hàng đã được thanh toán thành công!');
        localStorage.removeItem('gioHangThanhToan');
        this.hoadonService.increaseOrderCount();
        this.modalthongbao = true;
        this.idHoaDon = response.id;
      },
      (error) => {
        const rawMessage = error?.error?.message || "";
        if (rawMessage.startsWith("HET_HANG:")) {
          alert(rawMessage.replace("HET_HANG:", ""));
          this.router.navigate(['/banhang']);
          localStorage.removeItem('gioHangThanhToan');
        } else if (rawMessage.startsWith("VUOT_TON:")) {
          alert(rawMessage.replace("VUOT_TON:", ""));
        }
        else if (rawMessage.startsWith("VOUCHER_HET:")) {
          alert(rawMessage.replace("VOUCHER_HET:", ""));
          this.getVoucherIdAndTen()
          this.chonVoucher = null
          this.getTinhVoucher()
        }
        else if (rawMessage.startsWith("VOUCHER_KHONG_HOAT_DONG:")) {
          alert(rawMessage.replace("VOUCHER_KHONG_HOAT_DONG:", ""));
        }
        else if (rawMessage.startsWith("KHONG_CO_SAN_PHAM:")) {
          alert(rawMessage.replace("KHONG_CO_SAN_PHAM:", ""));
          this.router.navigate(['/banhang']);
        }
        else {
          alert(error);
        }
      }
    );
  }



  //  Lấy danh sách địa chỉ của khách hàng:
  //  - Hiển thị địa chỉ đầu tiên nếu có
  //  - Mở modal thêm địa chỉ nếu chưa có địa chỉ

  getDiaChiKhachHang(): void {
    this.hoadonService.getDiaChiKhachHang(this.idKhachHang)
      .subscribe(
        (response: any) => {
          this.diaChiList = response || [];
          if (this.diaChiList.length > 0) {
            this.chonDiaChi = this.diaChiList[0];
            this.chonDiaChiCuThe = this.chonDiaChi.diaChiCuThe;
            this.chonQuan = this.chonDiaChi.quanHuyen;
            this.chonPhuongXa = this.chonDiaChi.phuongXa;
            this.chonSdtNguoiNhan = this.chonDiaChi.sdtNguoiNhan;
            this.chonTenNguoiNhan = this.chonDiaChi.tenNguoiNhan;
            this.chonTinh = this.chonDiaChi.tinhThanhPho;
            this.fullDiaChi = `${this.chonTinh}-${this.chonQuan}-${this.chonPhuongXa}-${this.chonDiaChiCuThe}`;
            this.tinhPhiShipping();
          } else {
            this.isModalOpen = true;
            this.activeTab = 'add';
            alert("Chưa có địa chỉ! Vui lòng tạo địa chỉ để thanh toán")
          }
          this.cdRef.detectChanges();
        },
        (error) => {
          console.error('Lỗi khi lấy địa chỉ khách hàng:', error);
        }
      );
  }


  // Lấy chi tiết giỏ hàng để thanh toán:
  //  - Kiểm tra giỏ hàng trống

  getChiTietGioHangSauThanhToan(): void {
    this.hoadonService.getChiTietGioHangSauThanhToan(this.idKhachHang).subscribe(
      (response: any) => {
        if (response && response.length > 0) {
          this.chiTietGioHang = response;
          this.TongTienTamTinh = 0;
          this.chiTietGioHang.forEach((item: any) => {
            this.TongTienTamTinh += item.soLuong * item.donGia;
          });
          this.getVoucherIdAndTen();
          this.cdRef.detectChanges();
        } else {
          this.loadGioHangFromLocalStorage();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết giỏ hàng sau thanh toán:', error);
        this.loadGioHangFromLocalStorage();
      }
    );
  }

  loadGioHangFromLocalStorage() {
    const gioHangData = localStorage.getItem('gioHangThanhToan');
    if (gioHangData) {
      this.chiTietGioHang = JSON.parse(gioHangData);
      this.TongTienTamTinh = 0;
      this.chiTietGioHang.forEach((item: any) => {
        this.TongTienTamTinh += item.soLuong * item.donGia;
      });
      this.getVoucherIdAndTen();
      this.cdRef.detectChanges();
    } else {
      alert('Giỏ hàng trống! Bạn chưa thanh toán sản phẩm nào.');
      this.router.navigate(['/banhang']);
    }
  }


  calculateTotal() {
    this.TongTienTamTinh = 0;
    this.chiTietGioHang.forEach((item: any) => {
      this.TongTienTamTinh += item.soLuong * item.donGia;
    });
  }

  openModal(): void {
    this.isModalOpen = true;
    this.activeTab = 'select'
  }


  closeModal(): void {
    this.isModalOpen = false;
    if (this.diaChiList.length === 0) {
      this.thongBaoTrong = true;
    }
  }

  openEditModal(): void {
    this.isEditModalOpen = true;
    this.isModalOpen = false;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }


  // Chọn địa chỉ từ danh sách:
  // @param index Vị trí địa chỉ trong danh sách

  selectDiaChi(index: number): void {
    this.selectedIndex = index;
    this.chonDiaChi = this.diaChiList[index];
    this.chonDiaChiCuThe = this.chonDiaChi.diaChiCuThe
    this.chonTinh = this.chonDiaChi.tinhThanhPho
    this.chonQuan = this.chonDiaChi.quanHuyen;
    this.chonPhuongXa = this.chonDiaChi.phuongXa;
    this.chonSdtNguoiNhan = this.chonDiaChi.sdtNguoiNhan
    this.chonTenNguoiNhan = this.chonDiaChi.tenNguoiNhan
    this.fullDiaChi = `${this.chonTinh}-${this.chonQuan}-${this.chonPhuongXa}-${this.chonDiaChiCuThe}`;
    this.tinhPhiShipping()
    this.closeModal();

  }

  // Load danh sách tỉnh/thành phố từ API
  loadTinhThanh(): void {
    this.hoadonService.getTinhThanh().subscribe((response: any) => {
      this.tinhThanhPhoList = response.data
    });
  }


  // Xử lý chọn quận/huyện:
  // Load danh sách phường/xã tương ứng

  onSelectTinhThanh(event: any): void {
    const chonTenTinh = event.target.value;
    const chonTinh = this.tinhThanhPhoList.find(tinh => tinh.ProvinceName === chonTenTinh);
    if (chonTinh) {
      this.newDiaChi.tinhThanhPho = chonTinh.ProvinceName;
      // Reset các giá trị liên quan
      this.newDiaChi.quanHuyen = '';
      this.newDiaChi.phuongXa = '';
      this.quanHuyenList = [];
      this.phuongXaList = [];

      const tinhId = chonTinh.ProvinceID;
      this.hoadonService.getQuanHuyen(tinhId).subscribe(
        (response: any) => {
          this.quanHuyenList = response.data || [];
          if (this.diaChiEdit.quanHuyen) {
            this.newDiaChi.quanHuyen = this.diaChiEdit.quanHuyen;
            const chonHuyen = this.quanHuyenList.find(huyen => huyen.DistrictName === this.diaChiEdit.quanHuyen);
            if (chonHuyen) {
              this.newDiaChi.quanHuyen = chonHuyen.DistrictName;
            }
            this.onSelectQuanHuyen({ target: { value: this.diaChiEdit.quanHuyen } });
          }
        },
        (error) => {
          console.error("Lỗi khi lấy quận huyện:", error);
        }
      );
    }
  }

  //  Xử lý chọn quận/huyện:
  // - Load danh sách phường/xã tương ứng

  onSelectQuanHuyen(event: any): void {
    const chonTenHuyen = event.target.value;
    const chonHuyen = this.quanHuyenList.find(huyen => huyen.DistrictName === chonTenHuyen);
    if (chonHuyen) {
      this.newDiaChi.quanHuyen = chonHuyen.DistrictName;
      // Reset phường/xã
      this.newDiaChi.phuongXa = '';
      this.phuongXaList = [];

      const huyenId = chonHuyen.DistrictID;
      this.hoadonService.getPhuongXa(huyenId).subscribe(
        (response: any) => {
          this.phuongXaList = response.data || [];
          if (this.diaChiEdit.phuongXa) {
            this.newDiaChi.phuongXa = this.diaChiEdit.phuongXa;
          }
        },
        (error) => {
          console.error("Lỗi khi lấy phường xã:", error);
        }
      );
    }
  }


  // // Lấy tổng tiền tạm tính từ giỏ hàng
  // getTamTinh() {
  //   this.hoadonService.getTamTinh(this.idKhachHang).subscribe(
  //     (response: number) => {
  //       this.TongTienTamTinh = response;
  //       this.getVoucherIdAndTen();
  //       this.tongTienKhongCoVoucher()
  //     },
  //     (error) => {
  //       console.error("Lỗi khi lấy tổng tiền giỏ hàng", error);
  //     }
  //   );
  // }

  // // Cập nhật tổng tiền thanh toán sau khi áp dụng voucher
  // updatedTamTinh(): void {
  //   if (this.chonVoucher) {
  //     this.hoadonService.getTongTienThanhToan(this.idKhachHang, this.chonVoucher.id, this.shippingFee ?? 0).subscribe(
  //       (response: number) => {
  //         this.tongTienThanhToan = response;
  //       },
  //       (error) => {
  //         console.error("Lỗi khi tính tổng tiền", error);
  //       }
  //     );
  //   } else {
  //     console.warn("Không có voucher nào được chọn!");
  //     this.tongTienThanhToan = this.TongTienTamTinh;
  //   }
  // }

  // Phương thức gửi yêu cầu tạo thanh toán
  createThanhToan(): void {
    const paymentData = {
      idKhachHang: this.idKhachHang,
      voucherId: this.chonVoucher ? this.chonVoucher.id : null,
      tongTienTruocGiam: this.TongTienTamTinh,
      paymentMethodId: this.chonPhuongThucThanhToan,
      tongTienSauGiam: this.tongTienThanhToan,
      sdtNguoiNhan: this.chonSdtNguoiNhan,
      tenNguoiNhan: this.chonTenNguoiNhan,
      diaChi: this.fullDiaChi,
      shippingFee: this.shippingFee,
      chiTietGioHang: this.chiTietGioHang // ✅ Thêm chi tiết giỏ hàng ở đây
    };
    console.log("pay", paymentData)
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    if (this.chonPhuongThucThanhToan == 4) {
      this.hoadonService.createThanhToanVnpay(this.tongTienThanhToan).subscribe(
        (response: any) => {
          if (response.code == 'ok') {
            window.localStorage.setItem('paymentStatus', 'success');
            const paymentUrl = response.paymentUrl;
            const isConfirmed = confirm('Bạn có chắc chắn muốn thanh toán qua VNPAY không?');
            if (isConfirmed) {
              window.location.href = paymentUrl;
            }
          }
        },
        (error) => {
          console.error('Lỗi khi tạo thanh toán:', error);
          this.errorMessage = 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!';
        }
      );
    } else if (this.chonPhuongThucThanhToan == 1) {
      this.createHoaDon();
    } else {
      alert("Phương thức thanh toán không hợp lệ!");
    }
  }


  // Phương thức gọi API lấy danh sách phương thức thanh toán
  loadPhuongThucThanhToan(): void {
    this.hoadonService.getPhuongThucThanhToan().subscribe(
      (response: any) => {
        this.phuongThucThanhToan = response.filter((method: any) => method.id === 1 || method.id === 4);
        if (this.phuongThucThanhToan.length > 0) {
          this.chonPhuongThucThanhToan = this.phuongThucThanhToan[0].id;
        }
      },
      (error) => {
        this.errorMessage = 'Có lỗi xảy ra khi lấy danh sách phương thức thanh toán.';
        console.error(error);
      }
    );
  }

  // Cập nhật địa chỉ đã chỉnh sửa
  updateDiaChi(): void {
    const validationError = this.validateEditForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const confirmAdd = window.confirm("Bạn có chắc chắn muốn lưu địa chỉ không?");
    if (!confirmAdd) return;

    if (this.diaChiEdit.id) {
      console.log("sua", this.newDiaChi)
      this.hoadonService.updateDiaChiKhachHang(this.diaChiEdit).subscribe(
        (response) => {
          console.log("update", response)
          alert("Địa chỉ đã được cập nhật!");
          this.activeTab = 'select';
          this.getDiaChiKhachHang()
          this.closeEditModal();
          this.activeTab = 'select';
          this.isModalOpen = true;
        },
        (error) => {
          console.error("Lỗi khi cập nhật địa chỉ", error);
          alert("Không thể cập nhật địa chỉ. Vui lòng thử lại!");
        }
      );
    } else {
      alert("Vui lòng chọn một địa chỉ hợp lệ để cập nhật.");
    }
  }

  // Hàm kiểm tra form thêm địa chỉ 
  validateAddForm(): string | null {
    const dc = this.newDiaChi;

    if (!dc.tenNguoiNhan?.trim()) return "Vui lòng nhập tên người nhận";

    if (!dc.sdtNguoiNhan?.trim()) return "Vui lòng nhập số điện thoại";

    // Kiểm tra không chứa chữ
    if (/[a-zA-Z]/.test(dc.sdtNguoiNhan)) return "Số điện thoại không được chứa chữ cái";

    // Kiểm tra đúng 10 số và bắt đầu bằng số 0
    if (!/^0\d{9}$/.test(dc.sdtNguoiNhan)) {
      return "Số điện thoại không đúng định dạng";
    }

    if (!dc.diaChiCuThe?.trim()) return "Vui lòng nhập địa chỉ cụ thể";
    if (!dc.tinhThanhPho) return "Vui lòng chọn tỉnh/thành phố";
    if (!dc.quanHuyen) return "Vui lòng chọn quận/huyện";
    if (!dc.phuongXa) return "Vui lòng chọn phường/xã";

    return null;
  }

  // Hàm kiểm tra form sửa địa chỉ
  validateEditForm(): string | null {
    const dc = this.diaChiEdit;

    if (!dc.tenNguoiNhan?.trim()) return "Vui lòng nhập tên người nhận";

    if (!dc.sdtNguoiNhan?.trim()) return "Vui lòng nhập số điện thoại";

    // Kiểm tra không chứa chữ
    if (/[a-zA-Z]/.test(dc.sdtNguoiNhan)) return "Số điện thoại không được chứa chữ cái";

    // Kiểm tra đúng 10 số và bắt đầu bằng số 0
    if (!/^0\d{9}$/.test(dc.sdtNguoiNhan)) {
      return "Số điện thoại không đúng định dạng";
    }

    if (!dc.diaChiCuThe?.trim()) return "Vui lòng nhập địa chỉ cụ thể";
    if (!dc.tinhThanhPho) return "Vui lòng chọn tỉnh/thành phố";
    if (!dc.quanHuyen) return "Vui lòng chọn quận/huyện";
    if (!dc.phuongXa) return "Vui lòng chọn phường/xã";

    return null;
  }

  //Thêm địa chỉ mới
  addDiaChi() {
    const validationError = this.validateAddForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const confirmAdd = window.confirm("Bạn có chắc chắn muốn thêm địa chỉ mới không?");
    if (!confirmAdd) return;

    this.hoadonService.addDiaChiKhachHang(this.newDiaChi).subscribe(
      (response: any) => {
        this.diaChiList.push(response);
        alert("Địa chỉ đã được thêm thành công!");
        this.chonDiaChi = response;
        this.chonTinh = response.tinhThanhPho;
        this.chonQuan = response.quanHuyen;
        this.chonPhuongXa = response.phuongXa;
        this.chonDiaChiCuThe = response.diaChiCuThe;
        this.chonSdtNguoiNhan = response.sdtNguoiNhan;
        this.chonTenNguoiNhan = response.tenNguoiNhan;
        this.fullDiaChi = `${this.chonTinh}-${this.chonQuan}-${this.chonPhuongXa}-${this.chonDiaChiCuThe}`;
        this.resetForm();
        this.activeTab = 'select';
        this.getDiaChiKhachHang()

      },
      (error) => {
        console.error("Lỗi khi thêm địa chỉ:", error);
        alert("Không thể thêm địa chỉ. Vui lòng thử lại!");
      }
    );
  }


  // Chỉnh sửa địa chỉ
  diaChiDetail(id: number) {
    this.hoadonService.getDiaChiDetail(id).subscribe((response) => {

      this.diaChiEdit = { ...response };
      console.log("Thông tin địa chỉ lấy từ API:", this.diaChiEdit);
      // Cập nhật thông tin tỉnh/thành phố

      this.onSelectTinhThanh({ target: { value: this.diaChiEdit.tinhThanhPho } });

      // Cập nhật thông tin quận huyện

      this.onSelectQuanHuyen({ target: { value: this.diaChiEdit.quanHuyen } });

      // Cập nhật thông tin phường xã
      this.khachHang.phuongXa = this.diaChiEdit.phuongXa;
      this.openEditModal();
    }, (error) => {
      console.error('Lỗi khi lấy địa chỉ chi tiết:', error);
      alert('Không thể lấy thông tin địa chỉ để chỉnh sửa!');
    });
  }

  //xóa địa chỉ
  deleteDiaChi(id: number, index: number): void {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      this.hoadonService.deleteDiaChiKhachHang(id).subscribe(
        () => {
          alert("Địa chỉ đã được xóa thành công!");
          this.getDiaChiKhachHang();
        },
        (error) => {
          console.error("Lỗi khi xóa địa chỉ:", error);
          alert("Không thể xóa địa chỉ. Vui lòng thử lại!");
        }
      );
    }
  }

  // Phương thức gọi API để lấy danh sách voucher
  getVoucherIdAndTen(): void {
    this.hoadonService.getVouchers(this.TongTienTamTinh).subscribe(
      (response: any) => {
        this.vouchers = response;
        if (!this.chonVoucher && this.vouchers.length >= 0) {
          this.chonVoucher = null;
          this.getTongTienThanhToan(); // Tính lại tổng tiền
        }
      },
      (error) => {
        console.error("Lỗi khi lấy danh sách voucher", error);
      }
    );
  }

  //tính phí ship
  tinhPhiShipping() {
    const pickProvince = 'Hà Nội';
    const pickDistrict = 'Quận Hoàn Kiếm';
    const weight = 200;
    const deliverOption = 'none';

    this.hoadonService.tinhTienShip(pickProvince, pickDistrict, this.chonTinh, this.chonQuan, weight, deliverOption)
      .subscribe((response) => {
        this.shippingFee = response.fee.fee
        this.tongTienKhongCoVoucher()
      }, error => {
        console.error('Error', error);
      });
  }

  //tạo đơn hàng
  createHoaDon(): void {
    if (!this.chonDiaChi || !this.fullDiaChi || this.fullDiaChi.trim() === '') {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    if (this.chonPhuongThucThanhToan == null) {
      alert("Phương thức thanh toán không được để trống");
      return;
    }

    if (this.chonPhuongThucThanhToan != 4) {
      const confirmCreateInvoice = confirm('Bạn có muốn tạo đơn hàng không?');
      if (!confirmCreateInvoice) return;
    }

    const data = {
      idKhachHang: this.idKhachHang,
      voucherId: this.chonVoucher ? this.chonVoucher.id : null,
      tongTienTruocGiam: this.TongTienTamTinh,
      paymentMethodId: this.chonPhuongThucThanhToan,
      tongTienSauGiam: this.tongTienThanhToan,
      sdtNguoiNhan: this.chonSdtNguoiNhan,
      tenNguoiNhan: this.chonTenNguoiNhan,
      diaChi: this.fullDiaChi,
      shippingFee: this.shippingFee,
      chiTietGioHang: this.chiTietGioHang  // 👈 Thêm chi tiết giỏ hàng
    };

    this.hoadonService.createHoaDonFull(data).subscribe(
      (response) => {
        alert('Đơn hàng đã được tạo thành công!');
        this.hoadonService.increaseOrderCount();
        this.modalthongbao = true;
        this.idHoaDon = response.id;
        localStorage.removeItem('gioHangThanhToan');

      },
      (error) => {
        const rawMessage = error?.error?.message || "";
        if (rawMessage.startsWith("HET_HANG:")) {
          alert(rawMessage.replace("HET_HANG:", ""));
          this.router.navigate(['/banhang']);
          localStorage.removeItem('gioHangThanhToan');
        } else if (rawMessage.startsWith("VUOT_TON:")) {
          alert(rawMessage.replace("VUOT_TON:", ""));
        }
        else if (rawMessage.startsWith("VOUCHER_HET:")) {
          alert(rawMessage.replace("VOUCHER_HET:", ""));
          this.getVoucherIdAndTen()
          this.chonVoucher = null
          this.getTinhVoucher()
        }
        else if (rawMessage.startsWith("VOUCHER_KHONG_HOAT_DONG:")) {
          alert(rawMessage.replace("VOUCHER_KHONG_HOAT_DONG:", ""));
          this.getVoucherIdAndTen()
          this.chonVoucher = null
          this.getTinhVoucher()
        }
        else if (rawMessage.startsWith("NGUNG_HOAT_DONG:")) {
          alert(rawMessage.replace("NGUNG_HOAT_DONG:", ""));
          this.router.navigate(['/banhang']);
        }
        else if (rawMessage.startsWith("KHONG_CO_SAN_PHAM:")) {
          alert(rawMessage.replace("KHONG_CO_SAN_PHAM:", ""));
          this.router.navigate(['/banhang']);
        }
        else {
          alert(error);
        }
      }
    );
  }


  backSanpham(): void {
    if (this.idSanPhamBack) {
      this.router.navigate(['/sanpham', this.idSanPhamBack]);
    } else {
      window.history.back(); // fallback nếu không có id
    }
  }



  closeModalThongBao() {
    this.modalthongbao = false;
  }

  viewInvoiceDetails(): void {
    console.log('Xem chi tiết đơn hàng');
    this.router.navigate(['/donhang', this.idHoaDon]);
    this.closeModalThongBao();
  }

  viewInvoiceHistory() {
    console.log('Xem lịch sử đơn hàng');
    this.router.navigate(['/lichsudonhang']);
    this.closeModalThongBao();
  }

  goHome() {
    console.log('Quay về trang chủ');
    this.closeModalThongBao();
    this.router.navigate(['/banhang']);
  }

  resetForm(): void {
    this.newDiaChi = {
      id: '',
      tenNguoiNhan: '',
      sdtNguoiNhan: '',
      diaChiCuThe: '',
      tinhThanhPho: '',
      quanHuyen: '',
      phuongXa: '',
      idKhachHang: this.idKhachHang
    };
    this.quanHuyenList = [];
    this.phuongXaList = [];
  }

  //tính giá trị giảm của voucher
  getTinhVoucher(): string {
    if (!this.chonVoucher || this.TongTienTamTinh === 0) return '';
    const v = this.chonVoucher;

    // Nếu là giảm trực tiếp
    if (v.hinhThucGiam) {
      return `Giá trị giảm: ${v.giaTriGiam.toLocaleString()} VND`;
    }

    // Nếu là giảm phần trăm
    const giaTriGiam = (this.TongTienTamTinh * v.giaTriGiam) / 100;

    if (v.giamToiDa && giaTriGiam > v.giamToiDa) {
      return `Giảm tối đa: ${v.giamToiDa.toLocaleString()} VND`;
    } else {
      return `Giảm ${v.giaTriGiam}% - ${giaTriGiam.toLocaleString()} VND`;
    }
  }

  // Tính tổng tiền thanh toán
  getTongTienThanhToan(): void {

    let giaTriGiam = 0;

    // Nếu có voucher
    if (this.chonVoucher) {
      const v = this.chonVoucher;

      if (v.hinhThucGiam) {
        // Giảm trực tiếp tiền
        giaTriGiam = v.giaTriGiam;
      } else {
        // Giảm theo %
        giaTriGiam = (this.TongTienTamTinh * v.giaTriGiam) / 100;

        // Kiểm tra giảm tối đa
        if (v.giamToiDa && giaTriGiam > v.giamToiDa) {
          giaTriGiam = v.giamToiDa;
        }
      }
    }

    // Tổng tiền = tạm tính - giảm + phí ship
    this.tongTienThanhToan = this.TongTienTamTinh - giaTriGiam + this.shippingFee;

    // Làm tròn tổng tiền thanh toán
    this.tongTienThanhToan = Math.round(this.tongTienThanhToan);

    // Nếu lỡ giảm quá lớn (âm) thì set = phí ship thôi
    if (this.TongTienTamTinh < this.shippingFee) {
      this.TongTienTamTinh = this.shippingFee;
    }


  }


  tongTienKhongCoVoucher(): void {
    const shipping = this.shippingFee ?? 0;
    this.tongTienThanhToan = this.TongTienTamTinh + shipping;
  }

  openAddAddress(): void {
    this.isModalOpen = true;
    this.resetForm();
    this.activeTab = 'add';
  }

}