import { Component } from '@angular/core';
import { HoadonService } from '../hoadon/hoadon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selectedQuan: any = null;
  selectedPhuongXa: any = null;
  selectedIndex: number | null = null;
  sdtNguoiNhan: string = '';
  idDiaChi: number | null = null;
  selectedAddress: any = null; // Địa chỉ được chọn để hiển thị trong modal và giao diện chính
  activeTab = 'select';
  isModalOpen = false;
  isEditModalOpen = false;
  totalPrice: number = 0;
  vouchers: any[] = []; // Danh sách voucher
  totalPriceAfterDiscount: number = 0;
  selectedVoucherId: number | null = null; // ID của voucher đã chọn
  newAddress = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
  AddressEdit = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
  constructor(private hoadonService: HoadonService) { }

  // Phương thức gọi API khi component được khởi tạo
  ngOnInit(): void {
    this.getDiaChiKhachHang();
    this.loadTinhThanh();
    this.getChiTietGioHangSauThanhToan();
    this.getTotalPrice();
    this.getVoucherIdAndTen();
    console.log('Voucher list:', this.vouchers);

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
    this.selectedIndex = index;
    this.selectedAddress = this.diaChiList[index];
    this.closeModal();
  }

  // Lấy danh sách tỉnh thành
  loadTinhThanh() {
    this.hoadonService.getTinhThanh().subscribe((data) => {
      this.tinhThanhPhoList = data;
    });
  }

  // Khi chọn tỉnh, lấy danh sách quận huyện
  onSelectTinhThanh(event: any) {
    const maTinh = event.target.value;
    this.khachHang.tinhThanhPho = maTinh;
    this.hoadonService.getQuanHuyen(maTinh).subscribe((data) => {
      this.quanHuyenList = data.districts;
      this.khachHang.quanHuyen = null;
      this.phuongXaList = [];
    });
  }

  // Khi chọn huyện, lấy danh sách phường xã
  onSelectQuanHuyen(event: any) {
    const maHuyen = event.target.value;
    this.khachHang.quanHuyen = maHuyen;
    this.hoadonService.getPhuongXa(maHuyen).subscribe((data) => {
      this.phuongXaList = data.wards;
      this.khachHang.phuongXa = null;
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
  if (this.selectedVoucherId) {
    // Gọi API tính tổng tiền sau khi áp dụng voucher
    this.hoadonService.calculateTotalWithVoucher(this.idKhachHang, this.selectedVoucherId).subscribe(
      (response: number) => {
        this.totalPriceAfterDiscount = response;
        console.log('Số tiền cần thanh toán sau khi áp dụng voucher:', this.totalPriceAfterDiscount);
      },
      (error) => {
        console.error("Lỗi khi tính tổng tiền", error);
      }
    );
  } else {
    this.totalPriceAfterDiscount = this.totalPrice; // Nếu không có voucher, tổng tiền không thay đổi
  }
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
        this.newAddress = { id: '', tenNguoiNhan: '', sdtNguoiNhan: '', diaChiCuThe: '', tinhThanhPho: null, quanHuyen: null, phuongXa: null };
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
    
    this.hoadonService.getVoucherIdAndTen().subscribe(
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
}
