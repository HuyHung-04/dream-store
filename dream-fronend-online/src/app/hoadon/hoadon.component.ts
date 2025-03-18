import { Component } from '@angular/core';
import { HoadonService } from '../hoadon/hoadon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

interface Voucher {
  id: number;
  ten: string;
  giamToiDa: number;
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
  idKhachHang: number = 2; // ID của khách hàng, bạn có thể thay đổi theo nhu cầu
  khachHang: any = {
    tenKhachHang: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    tinhThanhPho: null,
    quanHuyen: null,
    phuongXa: null
  };
  tinhThanhPhoList: any[] = [];
  quanHuyenList: any[] = [];
  phuongXaList: any[] = [];
  // Mảng chứa chi tiết giỏ hàng
  chiTietGioHang: any[] = [];
  selectedTinh: any = null;
  selectedSdtNguoiNhan: any = null
  selectedTenNguoiNhan: any = null
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
  availableServices: any[] = [];
  // Các thông tin đơn hàng
  serviceId: number = 53321;    // ID gói dịch vụ
  insuranceValue: number = 500000;  // Giá trị bảo hiểm
  coupon: string | null = null; // Mã giảm giá (có thể là null)
  fromDistrictId: number = 1542;  // Quận xuất phát
  toDistrictId: number = 1444;    // Quận đích đến
  toWardCode: string = "20314";   // Mã phường xã đích đến
  height: number = 15;         // Chiều cao gói hàng (cm)
  length: number = 15;         // Chiều dài gói hàng (cm)
  weight: number = 1000;       // Khối lượng gói hàng (gram)
  width: number = 15;          // Chiều rộng gói hàng (cm)
  shippingFee: number | null = null;
  selectedPaymentMethod: number | null = null;
  paymentMethods: any[] = [];
  selectedVoucherMaxDiscount: number | null = null;
  vouchers: any[] = []; // Danh sách voucher
  totalPriceAfterDiscount: number = 0;
  selectedVoucherId: number = 0; // ID của voucher đã chọn
  fullAddress: string = '';
  invoiceId: string =''; 
  newAddress = {
    id: '',
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiCuThe: '',
    tinhThanhPho: null,
    quanHuyen: null,
    phuongXa: null,
    idKhachHang: this.idKhachHang // Truyền thẳng ID khách hàng
  };
  AddressEdit = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
  constructor(private hoadonService: HoadonService, private router: Router) { }

  // Phương thức gọi API khi component được khởi tạo
  ngOnInit(): void {
    this.getDiaChiKhachHang();
    this.loadTinhThanh();
    this.getChiTietGioHangSauThanhToan();
    this.getTotalPrice();
    this.getVoucherIdAndTen();
    console.log('Voucher list:', this.vouchers);
    this.getAvailableShippingServices();
    // Chọn địa chỉ đầu tiên và tính phí vận chuyển
    if (this.diaChiList.length > 0) {
      this.selectedAddress = this.diaChiList[0];  // Chọn địa chỉ đầu tiên
      this.selectedQuan = Number(this.selectedAddress.quanHuyen);  // Lưu quận
      this.selectedPhuongXa = this.selectedAddress.phuongXa;  // Lưu phường xã
      this.selectedSdtNguoiNhan = this.selectedAddress.sdtNguoiNhan
      this.selectedTenNguoiNhan = this.selectedAddress.tenNguoiNhan
      this.selectedTinh = this.selectedAddress.tinhThanhPho
      this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}`;
      this.calculateFee();  // Tính phí vận chuyển cho địa chỉ đầu tiên
    }
    this.loadPaymentMethods();
  }

  // Phương thức gọi API để lấy danh sách địa chỉ của khách hàng
  getDiaChiKhachHang(): void {
    this.hoadonService.getDiaChiKhachHang(this.idKhachHang)
      .subscribe(
        (response: any) => {
          console.log(response)
          this.diaChiList = response || []; // Nếu không có dữ liệu, gán mảng trống
          if (this.diaChiList.length > 0) {
            this.selectedAddress = this.diaChiList[0]; // Chọn địa chỉ đầu tiên để hiển thị
            this.selectedQuan = Number(this.selectedAddress.quanHuyen); // Lưu quận
            this.selectedPhuongXa = this.selectedAddress.phuongXa; // Lưu phường xã
            this.selectedSdtNguoiNhan = this.selectedAddress.sdtNguoiNhan
            this.selectedTenNguoiNhan = this.selectedAddress.tenNguoiNhan
            this.selectedTinh = this.selectedAddress.tinhThanhPho
            this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}`;
            // Tính phí vận chuyển cho địa chỉ đầu tiên
            this.calculateFee();
          }
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
    console.log(this.selectedAddress)
    this.selectedIndex = index;
    this.selectedAddress = this.diaChiList[index];
    // Ghép selectedTinh, selectedQuan, selectedPhuongXa thành một chuỗi
    this.fullAddress = `${this.selectedTinh}-${this.selectedQuan}-${this.selectedPhuongXa}`;
    // Lưu tên quận/huyện và phường/xã vào biến riêng biệt
    this.selectedTinh = this.selectedAddress.tinhThanhPho
    this.selectedQuan = Number(this.selectedAddress.quanHuyen);
    this.selectedPhuongXa = this.selectedAddress.phuongXa;
    this.selectedSdtNguoiNhan = this.selectedAddress.sdtNguoiNhan
    this.selectedTenNguoiNhan = this.selectedAddress.tenNguoiNhan
    console.log("quan", this.selectedQuan)
    console.log("tinh", this.selectedTinh)
    console.log("huyen", this.selectedPhuongXa)
    // Gọi phương thức tính phí vận chuyển khi chọn địa chỉ
    this.calculateFee();
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
    const ProvinceID = event.target.value;
    console.log("Province ID chọn:", ProvinceID);

    if (!ProvinceID || ProvinceID === 'undefined') {
      console.error("Province ID invalid:", ProvinceID);
      return;
    }

    this.hoadonService.getQuanHuyen(ProvinceID).subscribe(
      (response: any) => {
        console.log("Danh sách quận huyện:", response);
        this.quanHuyenList = response.data || [];
      },
      (error) => {
        console.error("Lỗi khi lấy quận huyện:", error);
      }
    );
  }



  // Lấy phường xã theo huyện
  onSelectQuanHuyen(event: any): void {
    const districtId = event.target.value;
    this.hoadonService.getPhuongXa(districtId).subscribe((response: any) => {
      console.log(response)
      this.phuongXaList = response.data || [];
    });
  }


  getTotalPrice() {
    this.hoadonService.getTotalPrice(this.idKhachHang).subscribe(
      (response: number) => {
        this.totalPrice = response;
        console.log("Tổng tiền giỏ hàng: ", this.totalPrice);
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

      this.selectedVoucherMaxDiscount = this.selectedVoucher.giamToiDa ?? 0;
      console.log("Giảm tối đa:", this.selectedVoucherMaxDiscount);
      console.log(this.idKhachHang)
      console.log(this.shippingFee)
      // Gọi API tính tổng tiền sau khi áp dụng voucher
      this.hoadonService.calculateTotalWithVoucher(this.idKhachHang, this.selectedVoucher.id, this.shippingFee ?? 0).subscribe(
        (response: number) => {
          this.totalPriceAfterDiscount = response;
          console.log('Số tiền cần thanh toán sau khi áp dụng voucher:', this.totalPriceAfterDiscount);
        },
        (error) => {
          console.error("Lỗi khi tính tổng tiền", error);
        }
      );
    } else {
      console.warn("Không có voucher nào được chọn!");
      this.selectedVoucherMaxDiscount = 0;
      this.totalPriceAfterDiscount = this.totalPrice;
    }
  }

  // Phương thức gọi API lấy danh sách phương thức thanh toán
  loadPaymentMethods(): void {
    this.hoadonService.getPaymentMethods().subscribe(
      (response: any) => {
        this.paymentMethods = response; // Gán dữ liệu lấy được vào mảng paymentMethods
        console.log("phuong thuc", this.paymentMethods)
      },
      (error) => {
        this.errorMessage = 'Có lỗi xảy ra khi lấy danh sách phương thức thanh toán.'; // Hiển thị lỗi nếu có
        console.error(error);
      }
    );
  }
  // Gọi API để cập nhật thông tin địa chỉ
  updateDiaChi(): void {
    if (this.AddressEdit.id) {
      console.log("sua", this.AddressEdit)
      this.hoadonService.updateDiaChiKhachHang(this.AddressEdit).subscribe(
        (updatedDiaChi) => {
          console.log(updatedDiaChi)
          alert("Địa chỉ đã được cập nhật!");
          // Cập nhật lại địa chỉ đã sửa trong danh sách
          const index = this.diaChiList.findIndex((diaChi) => diaChi.id === this.AddressEdit.id);
          if (index !== -1) {
            this.diaChiList[index] = updatedDiaChi;  // Cập nhật địa chỉ trong danh sách
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
        // Reset lại dữ liệu nhập
        this.newAddress = {
          id: '',
          tenNguoiNhan: '',
          sdtNguoiNhan: '',
          diaChiCuThe: '',
          tinhThanhPho: null,
          quanHuyen: null,
          phuongXa: null,
          idKhachHang: this.idKhachHang // Truyền thẳng ID khách hàng
        };
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
      console.log("Thông tin địa chỉ lấy từ API:", response);
      this.AddressEdit = { ...response };  // Cập nhật dữ liệu vào AddressEdit
      // Chọn lại thành phố
      this.khachHang.tinhThanhPho = this.AddressEdit.tinhThanhPho;
      this.onSelectTinhThanh({ target: { value: this.AddressEdit.tinhThanhPho } });  // Gọi lại để lấy quận huyện

      // Chọn lại quận huyện
      this.khachHang.quanHuyen = this.AddressEdit.quanHuyen;
      this.onSelectQuanHuyen({ target: { value: this.AddressEdit.quanHuyen } });  // Gọi lại để lấy phường xã
      this.openEditModal();  // Mở modal chỉnh sửa
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

  getAvailableShippingServices(): void {
    const shopId = 4697468;
    this.hoadonService.getAvailableServices(this.fromDistrictId, this.toDistrictId, shopId)
      .subscribe(
        (response) => {
          console.log('Danh sách gói dịch vụ:', response);
          this.availableServices = response.data || [];
        },
        (error) => {
          console.error('Lỗi khi lấy danh sách gói dịch vụ:', error);
        }
      );
  }

  // Phương thức tính phí vận chuyển
  calculateFee(): void {
    console.log(this.fromDistrictId)
    console.log(this.selectedQuan)
    console.log(this.selectedPhuongXa)
    this.hoadonService.calculateShippingFee(
      this.serviceId,
      this.insuranceValue,
      this.coupon,
      this.fromDistrictId,
      this.selectedQuan,
      this.selectedPhuongXa,
      this.height,
      this.length,
      this.weight,
      this.width,
    )
      .subscribe(
        (response) => {
          console.log('Phí vận chuyển:', response);
          this.shippingFee = response.data.total;
          console.log(this.shippingFee)
        },
        (error: HttpErrorResponse) => {
          // In ra message lỗi trả về từ API
          console.error('Lỗi khi tính phí vận chuyển:', error.error.message);
        }
      );
  }

  // Phương thức gọi API để tạo hóa đơn và thêm các sản phẩm
  createHoaDon(): void {
    if (this.selectedVoucher) {
      const paymentMethodId = this.selectedPaymentMethod ?? 0; // Chọn phương thức thanh toán, nếu không chọn thì mặc định là 0
      console.log("voucher", this.selectedVoucher.id)
      console.log("phi van chuyen",this.shippingFee)
      this.hoadonService.createHoaDon(
        this.idKhachHang,
        this.selectedVoucher.id,
        this.totalPrice,
        paymentMethodId,
        this.totalPriceAfterDiscount,
        this.selectedSdtNguoiNhan,
        this.selectedTenNguoiNhan,
        this.fullAddress,
        this.shippingFee ?? 0
      ).subscribe(
        (response) => {
          console.log('Hóa đơn đã được tạo thành công:', response);
          alert('Hóa đơn đã được tạo thành công!');
          this.modalthongbao = true;
          this.invoiceId = response.ma;  // Assuming the response contains the ID

  
   
        },
        (error) => {
          console.error('Lỗi khi tạo hóa đơn:', error);
          alert('Không thể tạo hóa đơn. Vui lòng thử lại!');
        }
      );
    }
  }




    // Đóng modal khi click bên ngoài
    closeModalThongBao() {
      this.modalthongbao = false;
    }
    viewInvoiceDetails(): void {
      console.log('Xem chi tiết đơn hàng');
      this.router.navigate(['/donhang', this.invoiceId]);
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
}
