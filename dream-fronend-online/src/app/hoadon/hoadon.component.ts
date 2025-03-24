import { HoadonService } from '../hoadon/hoadon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
interface Voucher {
  id: number;
  ten: string;
  giamToiDa: number;
  giaTriGiam: number;
  hinhThucGiam: boolean; // true: giảm trực tiếp, false: phần trăm
}


@Component({
  selector: 'app-hoadon',
  imports: [CommonModule, FormsModule],
  templateUrl: './hoadon.component.html',
  styleUrl: './hoadon.component.css'
})

export class HoadonComponent {

  // Mảng chứa danh sách địa chỉ khách hàng
  diaChiList: any[] = [];
  idKhachHang: number = 0; // ID của khách hàng, bạn có thể thay đổi theo nhu cầu
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
  selectedTinh: any = null;
  selectedSdtNguoiNhan: any = null
  selectedTenNguoiNhan: any = null
  selectedDiaChiCuThe: any = null
  selectedQuan: any = null;
  selectedPhuongXa: any = null;
  selectedIndex: number | null = null;
  sdtNguoiNhan: string = '';
  idDiaChi: number | null = null;
  selectedAddress: any = null; // Địa chỉ được chọn để hiển thị trong modal và giao diện chính
  activeTab = 'select';
  isModalOpen = false;
  modalthongbao = false;
  isEditModalOpen = false;
  totalPrice: number = 0;
  selectedVoucher: Voucher | null = null;
  errorMessage: string = '';
  shippingFee: number | null = null;
  selectedPhuongThucThanhToan: number | null = null;
  phuongThucThanhToan: any[] = [];
  vouchers: any[] = []; // Danh sách voucher
  tongTienSauVoucher: number = 0;
  selectedVoucherId: number = 0; // ID của voucher đã chọn
  fullAddress: string = '';
  thongBaoTrong: boolean = false;
  maHoaDon: string = '';
  newAddress = {
    id: '',
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    tinhThanhPho: '',
    quanHuyen: '',
    phuongXa: '',
    idKhachHang: this.idKhachHang // Truyền thẳng ID khách hàng
  };
  AddressEdit = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
  constructor(private hoadonService: HoadonService, private router: Router, private cookieService: CookieService, private cdRef: ChangeDetectorRef) { }

  // Phương thức gọi API khi component được khởi tạo
  ngOnInit(): void {
    const khachhangStr = this.cookieService.get('khachhang');
    if (khachhangStr) {
      const khachhang = JSON.parse(khachhangStr);
      this.idKhachHang = khachhang.id; // hoặc khachhang.idKhachHang tùy theo API trả về
      console.log("ID khách hàng từ cookie:", this.idKhachHang);
      this.resetForm();
      this.getDiaChiKhachHang();
      this.loadTinhThanh();
      this.getChiTietGioHangSauThanhToan();
      this.getTotalPrice();
      this.getVoucherIdAndTen();
      console.log('Voucher list:', this.vouchers);
    } else {
      alert("Bạn chưa đăng nhập!");
      this.router.navigate(['/dangnhap']);
    }
    this.loadPaymentMethods();
  }

  // Phương thức gọi API để lấy danh sách địa chỉ của khách hàng
  getDiaChiKhachHang(): void {
    this.hoadonService.getDiaChiKhachHang(this.idKhachHang)
      .subscribe(
        (response: any) => {
          this.diaChiList = response || [];

          if (this.diaChiList.length > 0) {
            this.selectedAddress = this.diaChiList[0];
            this.selectedDiaChiCuThe = this.selectedAddress.diaChiCuThe;
            this.selectedQuan = this.selectedAddress.quanHuyen;
            this.selectedPhuongXa = this.selectedAddress.phuongXa;
            this.selectedSdtNguoiNhan = this.selectedAddress.sdtNguoiNhan;
            this.selectedTenNguoiNhan = this.selectedAddress.tenNguoiNhan;
            this.selectedTinh = this.selectedAddress.tinhThanhPho;
            this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}-${this.selectedDiaChiCuThe}`;

            //  Gọi tính phí vận chuyển sau khi có địa chỉ
            this.calculateShipping();
          } else {
            this.isModalOpen = true;
            this.activeTab = 'add';
          }
          this.cdRef.detectChanges(); // Cập nhật giao diện ngay lập tức
        },
        (error) => {
          console.error('Lỗi khi lấy địa chỉ khách hàng:', error);
        }
      );
  }


  // Phương thức để lấy chi tiết giỏ hàng sau thanh toán
  getChiTietGioHangSauThanhToan(): void {
    this.hoadonService.getChiTietGioHangSauThanhToan(this.idKhachHang).subscribe(
      (response: any) => {
        console.log('Chi tiết giỏ hàng sau thanh toán:', response);
        this.chiTietGioHang = response; // Gán chi tiết giỏ hàng nhận được từ API vào mảng chiTietGioHang

        if (this.chiTietGioHang == null) {
          alert('Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán!');
          this.router.navigate(['/banhang']); // hoặc điều hướng đến trang phù hợp
        }
        this.cdRef.detectChanges(); // Cập nhật giao diện ngay lập tức
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết giỏ hàng sau thanh toán:', error);
        alert('Không thể lấy chi tiết giỏ hàng. Vui lòng thử lại!');
      }
    );
  }

  // Phương thức mở modal và hiển thị danh sách địa chỉ
  openModal(): void {
    this.isModalOpen = true; // Mở modal
  }

  // Phương thức đóng modal
  closeModal(): void {
    this.isModalOpen = false; // Đóng modal
    // Nếu không có địa chỉ nào => hiển thị cảnh báo
    if (this.diaChiList.length === 0) {
      this.thongBaoTrong = true;
    }
  }

  openEditModal(): void {
    this.isEditModalOpen = true;
    this.isModalOpen = false; // Close the original modal
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  // Phương thức để chọn địa chỉ từ danh sách trong modal
  selectAddress(index: number): void {
    console.log("chon", this.selectedAddress)
    this.selectedDiaChiCuThe = this.selectedAddress.diaChiCuThe
    this.selectedIndex = index;
    this.selectedAddress = this.diaChiList[index];
    // Ghép selectedTinh, selectedQuan, selectedPhuongXa thành một chuỗi
    this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}-${this.selectedDiaChiCuThe}`;
    // Lưu tên quận/huyện và phường/xã vào biến riêng biệt
    this.selectedTinh = this.selectedAddress.tinhThanhPho
    this.selectedQuan = this.selectedAddress.quanHuyen;
    this.selectedPhuongXa = this.selectedAddress.phuongXa;
    this.selectedSdtNguoiNhan = this.selectedAddress.sdtNguoiNhan
    this.selectedTenNguoiNhan = this.selectedAddress.tenNguoiNhan
    // Gọi phương thức tính phí vận chuyển khi chọn địa chỉ
    this.calculateShipping()
    this.closeModal(); // Đóng modal sau khi chọn
  }

  // Lấy tỉnh thành
  loadTinhThanh(): void {
    this.hoadonService.getTinhThanh().subscribe((response: any) => {
      console.log("Danh sách tỉnh thành:", response.data);
      // Nếu response là mảng, gán trực tiếp; nếu không, kiểm tra xem có response.data hay không
      this.tinhThanhPhoList = response.data
      console.log("tỉnh thành", this.tinhThanhPhoList);
    });
  }

  onSelectTinhThanh(event: any): void {
    const selectedProvinceName = event.target.value;  // Lấy tên tỉnh người dùng chọn
    const selectedProvince = this.tinhThanhPhoList.find(tinh => tinh.ProvinceName === selectedProvinceName);  // Tìm ProvinceID từ tên tỉnh

    if (selectedProvince) {
      this.newAddress.tinhThanhPho = selectedProvince.ProvinceName;  // Lưu tên tỉnh vào newAddress
      const ProvinceID = selectedProvince.ProvinceID;  // Lấy ProvinceID
      // Gọi API để lấy quận/huyện dựa trên ProvinceID
      this.hoadonService.getQuanHuyen(ProvinceID).subscribe(
        (response: any) => {
          this.quanHuyenList = response.data || [];  // Cập nhật danh sách quận huyện
          // Sau khi đã có danh sách quận huyện, chọn quận huyện đã lưu từ trước nếu có
          if (this.AddressEdit.quanHuyen) {
            this.newAddress.quanHuyen = this.AddressEdit.quanHuyen;  // Chọn lại quận huyện cũ
            // Tìm quận huyện đã lưu và tự động chọn nó
            const selectedDistrict = this.quanHuyenList.find(district => district.DistrictName === this.AddressEdit.quanHuyen);
            if (selectedDistrict) {
              // Chọn quận huyện đã lưu
              this.newAddress.quanHuyen = selectedDistrict.DistrictName;
            }
            // Gọi lại để lấy phường xã nếu quận huyện đã chọn
            this.onSelectQuanHuyen({ target: { value: this.AddressEdit.quanHuyen } });
          }
        },
        (error) => {
          console.error("Lỗi khi lấy quận huyện:", error);
        }
      );
    }
  }


  onSelectQuanHuyen(event: any): void {
    const selectedDistrictName = event.target.value;  // Lấy tên quận huyện
    const selectedDistrict = this.quanHuyenList.find(quan => quan.DistrictName === selectedDistrictName);  // Tìm DistrictID từ tên quận

    if (selectedDistrict) {
      this.newAddress.quanHuyen = selectedDistrict.DistrictName;  // Lưu tên quận vào newAddress
      const DistrictID = selectedDistrict.DistrictID;  // Lấy DistrictID

      // Gọi API để lấy phường xã dựa trên DistrictID
      this.hoadonService.getPhuongXa(DistrictID).subscribe(
        (response: any) => {
          this.phuongXaList = response.data || [];  // Cập nhật danh sách phường xã

          // Sau khi đã có danh sách phường xã, chọn phường xã đã lưu từ trước nếu có
          if (this.AddressEdit.phuongXa) {
            this.newAddress.phuongXa = this.AddressEdit.phuongXa;  // Chọn lại phường xã cũ
          }
        },
        (error) => {
          console.error("Lỗi khi lấy phường xã:", error);
        }
      );
    }
  }



  getTotalPrice() {
    this.hoadonService.getTotalPrice(this.idKhachHang).subscribe(
      (response: number) => {
        this.totalPrice = response;
        console.log("Tổng tiền giỏ hàng: ", this.totalPrice);
        this.tongTienKhongCoVoucher()
      },
      (error) => {
        console.error("Lỗi khi lấy tổng tiền giỏ hàng", error);
      }
    );
  }

  // Cập nhật tổng tiền thanh toán sau khi áp dụng voucher
  updateTotalPrice(): void {
    if (this.selectedVoucher) {
      console.log("Voucher đã chọn:", this.selectedVoucher);
      console.log(this.idKhachHang)
      console.log(this.shippingFee)
      // Gọi API tính tổng tiền sau khi áp dụng voucher
      this.hoadonService.calculateTotalWithVoucher(this.idKhachHang, this.selectedVoucher.id, this.shippingFee ?? 0).subscribe(
        (response: number) => {
          this.tongTienSauVoucher = response;
          console.log('Số tiền cần thanh toán sau khi áp dụng voucher:', this.tongTienSauVoucher);
        },
        (error) => {
          console.error("Lỗi khi tính tổng tiền", error);
        }
      );
    } else {
      console.warn("Không có voucher nào được chọn!");

      this.tongTienSauVoucher = this.totalPrice;
    }
  }

  // Phương thức gọi API lấy danh sách phương thức thanh toán
  loadPaymentMethods(): void {
    this.hoadonService.getPaymentMethods().subscribe(
      (response: any) => {
        // Lọc ra phương thức có id = 1
        this.phuongThucThanhToan = response.filter((method: any) => method.id === 1);
        // Nếu có phương thức thanh toán id = 1, đặt nó làm mặc định
        if (this.phuongThucThanhToan.length > 0) {
          this.selectedPhuongThucThanhToan = this.phuongThucThanhToan[0].id;
        }
        // console.log("Phương thức thanh toán:", this.phuongThucThanhToan);
      },
      (error) => {
        this.errorMessage = 'Có lỗi xảy ra khi lấy danh sách phương thức thanh toán.';
        console.error(error);
      }
    );
  }
  
  

  // Gọi API để cập nhật thông tin địa chỉ
  updateDiaChi(): void {
    if (this.AddressEdit.id) {
      console.log("sua", this.newAddress)
      this.hoadonService.updateDiaChiKhachHang(this.AddressEdit).subscribe(
        (response) => {
          console.log("update", response)
          alert("Địa chỉ đã được cập nhật!");
          // Cập nhật lại địa chỉ trong danh sách
          const index = this.diaChiList.findIndex((diaChi) => diaChi.id === this.AddressEdit.id);
          if (index !== -1) {
            this.diaChiList[index] = response;  // Cập nhật địa chỉ trong danh sách với dữ liệu mới
          }
          this.closeEditModal();  // Đóng modal sau khi cập nhật thành công
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


  addDiaChi() {
    console.log(this.newAddress)
    // Kiểm tra xem các trường có được nhập đầy đủ không
    if (!this.newAddress.tenNguoiNhan || !this.newAddress.diaChiCuThe ||
      !this.newAddress.tinhThanhPho || !this.newAddress.quanHuyen || !this.newAddress.phuongXa) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ!");
      return;
    }

    // Gọi API để thêm địa chỉ mới
    this.hoadonService.addDiaChiKhachHang(this.newAddress).subscribe(
      (response: any) => {
        this.diaChiList.push(response); // Thêm địa chỉ mới vào danh sách
        alert("Địa chỉ đã được thêm thành công!");
        // Cập nhật địa chỉ vừa thêm làm địa chỉ được chọn
        this.selectedAddress = response;
        this.selectedTinh = response.tinhThanhPho;
        this.selectedQuan = response.quanHuyen;
        this.selectedPhuongXa = response.phuongXa;
        this.selectedDiaChiCuThe = response.diaChiCuThe;
        this.selectedSdtNguoiNhan = response.sdtNguoiNhan;
        this.selectedTenNguoiNhan = response.tenNguoiNhan;
        this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}-${this.selectedDiaChiCuThe}`;
        // Reset lại dữ liệu nhập
        this.resetForm();
        // Quay lại tab chọn địa chỉ
        this.activeTab = 'select';
      },
      (error) => {
        console.error("Lỗi khi thêm địa chỉ:", error);
        alert("Không thể thêm địa chỉ. Vui lòng thử lại!");
      }
    );
  }


  // Chỉnh sửa địa chỉ
  editDiaChi(id: number) {
    this.hoadonService.getDiaChiDetail(id).subscribe((response) => {

      this.AddressEdit = { ...response };  // Cập nhật dữ liệu vào AddressEdit
      console.log("Thông tin địa chỉ lấy từ API:", this.AddressEdit);
      // Cập nhật thông tin tỉnh/thành phố

      this.onSelectTinhThanh({ target: { value: this.AddressEdit.tinhThanhPho } });  // Gọi lại để lấy quận huyện

      // Cập nhật thông tin quận huyện

      this.onSelectQuanHuyen({ target: { value: this.AddressEdit.quanHuyen } });  // Gọi lại để lấy phường xã

      // Cập nhật thông tin phường xã
      this.khachHang.phuongXa = this.AddressEdit.phuongXa;

      // Mở modal chỉnh sửa
      this.openEditModal();
    }, (error) => {
      console.error('Lỗi khi lấy địa chỉ chi tiết:', error);
      alert('Không thể lấy thông tin địa chỉ để chỉnh sửa!');
    });
  }

  deleteDiaChi(id: number, index: number): void {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      this.hoadonService.deleteDiaChiKhachHang(id).subscribe(
        () => {
          alert("Địa chỉ đã được xóa thành công!");
          this.diaChiList.splice(index, 1); // Xóa địa chỉ khỏi danh sách hiển thị

          // Nếu không còn địa chỉ nào, đặt selectedAddress thành null hoặc mở modal để thêm địa chỉ mới
          if (this.diaChiList.length === 0) {
            this.selectedAddress = null; // Hoặc mở modal thêm địa chỉ mới
            this.isModalOpen = true; // Nếu bạn muốn mở modal để người dùng thêm địa chỉ mới
          } else {
            // Nếu còn địa chỉ, chọn lại địa chỉ đầu tiên (hoặc bạn có thể thêm logic để chọn lại địa chỉ khác)
            this.selectedAddress = this.diaChiList[0];
          }
          // Cập nhật giao diện
          this.cdRef.detectChanges();
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
    this.hoadonService.getAvailableVouchers(this.idKhachHang).subscribe(
      (response: any) => {
        this.vouchers = response;
        console.log('Danh sách voucher:', response); // Log danh sách voucher để kiểm tra
        // Lưu dữ liệu voucher vào mảng hoặc biến nếu cần
        // Example: this.vouchers = response;
      },
      (error) => {
        console.error("Lỗi khi lấy danh sách voucher", error);
      }
    );
  }

  calculateShipping() {
    const pickProvince = 'Hà Nội';
    const pickDistrict = 'Quận Hoàn Kiếm';
    const weight = 200;
    const deliverOption = 'none';

    this.hoadonService.calculateShippingFee(pickProvince, pickDistrict, this.selectedTinh, this.selectedQuan, weight, deliverOption)
      .subscribe((response) => {
        this.shippingFee = response.fee.fee
        console.log("tiền ship", response.fee);
        this.tongTienKhongCoVoucher()
      }, error => {
        console.error('Error calculating shipping fee', error);
      });
  }

  // Phương thức gọi API để tạo hóa đơn và thêm các sản phẩm
  createHoaDon(): void {
    if (!this.selectedAddress || !this.fullAddress || this.fullAddress.trim() === '') {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    // Nếu không có voucher, gán null
    if (this.selectedPhuongThucThanhToan == null) {
      alert("Phương thức thanh toán không được để trống");
      return;
    }

    const paymentMethodId = this.selectedPhuongThucThanhToan;
    const voucherId = this.selectedVoucher ? this.selectedVoucher.id : null;
    this.hoadonService.createHoaDon(
      this.idKhachHang,
      voucherId,
      this.totalPrice,
      paymentMethodId,
      this.tongTienSauVoucher,
      this.selectedSdtNguoiNhan,
      this.selectedTenNguoiNhan,
      this.fullAddress,
      this.shippingFee ?? 0
    ).subscribe(
      (response) => {
        console.log('Hóa đơn đã được tạo thành công:', response);
        alert('Hóa đơn đã được tạo thành công!');
        this.hoadonService.increaseOrderCount(); // Thông báo có đơn hàng mới
        this.modalthongbao = true;
        this.maHoaDon = response.ma;

      },
      (error) => {
        console.error('Lỗi khi tạo hóa đơn:', error);
        alert('Không thể tạo hóa đơn. Vui lòng thử lại!');
      }
    );
  }


  backSanpham(): void {
    window.history.back();
  }


  // Đóng modal khi click bên ngoài
  closeModalThongBao() {
    this.modalthongbao = false;
  }
  viewInvoiceDetails(): void {
    console.log('Xem chi tiết đơn hàng');
    this.router.navigate(['/donhang', this.maHoaDon]);
    this.closeModalThongBao();  // Đóng modal khi thực hiện hành động
  }

  viewInvoiceHistory() {
    console.log('Xem lịch sử đơn hàng');
    this.router.navigate(['/lichsudonhang']);
    this.closeModalThongBao();
  }

  goHome() {
    console.log('Quay về trang chủ');
    this.closeModalThongBao();
    // Ví dụ quay về trang chủ
    this.router.navigate(['/banhang']);
  }

  resetForm(): void {
    // Reset các trường trong newAddress về giá trị mặc định
    this.newAddress = {
      id: '',
      tenNguoiNhan: '',
      sdtNguoiNhan: '',
      diaChiCuThe: '',
      tinhThanhPho: '',
      quanHuyen: '',
      phuongXa: '',
      idKhachHang: this.idKhachHang
    };

  }


  getVoucherDisplayText(): string {
    if (!this.selectedVoucher || this.totalPrice === 0) return '';
    const v = this.selectedVoucher;

    // Nếu là giảm trực tiếp
    if (v.hinhThucGiam) {
      return `Giá trị giảm: ${v.giaTriGiam.toLocaleString()} VND`;
    }

    // Nếu là giảm phần trăm
    const calculatedDiscount = (this.totalPrice * v.giaTriGiam) / 100;

    if (v.giamToiDa && calculatedDiscount > v.giamToiDa) {
      return `Giảm tối đa: ${v.giamToiDa.toLocaleString()} VND`;
    } else {
      return `Giảm ${v.giaTriGiam}% - ${calculatedDiscount.toLocaleString()} VND`;
    }
  }

  tongTienKhongCoVoucher(): void {
    const shipping = this.shippingFee ?? 0;
    this.tongTienSauVoucher = this.totalPrice + shipping;
  }

  openAddAddress(): void {
    this.isModalOpen = true;
    this.activeTab = 'add';
  }

}