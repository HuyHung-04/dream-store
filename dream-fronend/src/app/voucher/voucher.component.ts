import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoucherService } from './voucher.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voucher',
  imports: [CommonModule, FormsModule],
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.css',
})
export class VoucherComponent implements OnInit {
  vouchers: any[] = [];
  showModal: boolean = false;
  showModalDetail: boolean = false;
  showModalSearch: boolean = false;
  isGiamToiDaDisabled: boolean = false;
  maxPages = 3;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 7;
  selectedTrangThai: number = 3;
  showModalEdit = false;
  selectedVoucher: any = null;
  voucherEdit: any = {};
  searchText: string = '';
  numberPages: number[] = [];
  voucherUsed: boolean = false;
  checkNgay: boolean = false;
  tenVouchers: any[] = [];
  errors: any = {};
  voucher: any = {
    id: '',
    ma: '',
    ten: '',
    soLuong: '',
    hinhThucGiam: null,
    giaTriGiam: null,
    donToiThieu: null,
    giamToiDa: null,
    ngayBatDau: '',
    ngayTao: '',
    ngaySua: '',
    ngayKetThuc: '',
    trangThai: null,
  };
  constructor(private voucherService: VoucherService) { }
  ngOnInit(): void {
    this.loadData()

  }

  resetForm() {
    this.voucher = {
      ma: '',
      ten: '',
      hinhThucGiam: null,
      giaTriGiam: null,
      ngayBatDau: '',
      ngayKetThuc: '',
      trangThai: null,
    };

  }
  editVoucher(voucherId: number) {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_Quản lý') {
      this.voucherService.checkVoucherUsed(voucherId).subscribe((isUsed) => {
        this.voucherService.getVoucherDetail(voucherId).subscribe((voucher) => {
          this.voucherEdit = { ...voucher };
          this.voucherUsed = isUsed;
          // Kiểm tra nếu voucher đã hết hạn
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = new Date(this.voucherEdit.ngayKetThuc);
          endDate.setHours(23, 59, 59, 999)
          const isExpired = endDate < today;
          // Nếu voucher đã hết hạn, không cho phép sửa
          if (isExpired) {
            this.checkNgay = true;
          }
          else {
            // Nếu voucher không hết hạn, cho phép sửa lại
            this.checkNgay = false;
          }
          this.isGiamToiDaDisabled = this.voucherEdit.hinhThucGiam === true;
          this.showModalEdit = true;
          // Cập nhật lại readonly cho các trường khi gia hạn


        });
      });
    } else {
      alert('Bạn không có quyền truy cập chức năng này.');
    }

  }

  onNgayKetThucChange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chốt giờ hôm nay

    const endDate = new Date(this.voucherEdit.ngayKetThuc);
    endDate.setHours(23, 59, 59, 999);

    if (endDate > today) {
      // Nếu đã gia hạn: cho phép sửa các trường
      this.checkNgay = false;
    } else {
      // Nếu vẫn hết hạn: giữ readonly
      this.checkNgay = true;
    }
  }

  onHinhThucGiamChange2() {
    console.log(this.voucherEdit.hinhThucGiam);
    this.isGiamToiDaDisabled = this.voucherEdit.hinhThucGiam === true;
    if (this.isGiamToiDaDisabled) {
      this.voucherEdit.giamToiDa = null;
    }
  }

  onHinhThucGiamChange() {
    if (this.voucher.hinhThucGiam === true) {
      this.voucher.giamToiDa = null;
    }
  }

  addVoucher() {

    if (!this.validateForm()) {
      return;
    }

    const isConfirmed = window.confirm('Bạn có chắc chắn muốn thêm voucher này?');

    if (!isConfirmed) {
      return;
    }

    this.voucherService.addVoucher(this.voucher).subscribe(
      (response) => {
        alert('Thêm voucher thành công!');
        this.loadData();
        this.closeModal();
        this.resetForm();
      },
      (error) => {
        if (error.status === 403) {
          alert('Bạn không có quyền truy cập chức năng này.');
        } else {
          alert('Có lỗi xảy ra khi cập nhật voucher.');
        }
      }
    );
  }


  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.voucher.ma.trim()) {
      this.errors.ma = 'Mã voucher không được để trống!';
    }
    else {
      const checkTrungMa = this.vouchers.some(voucher => voucher.ma == this.voucher.ma);

      if (checkTrungMa) {
        this.errors.ma = 'Mã voucher đã tồn tại!';
      }
    }

    if (!this.voucher.ten.trim()) {
      this.errors.ten = 'Tên voucher không được để trống!';
    }

    if (!this.voucher.soLuong == null) {
      this.errors.soLuong = 'Số lượng không được để trống!';
    }

    if (
      this.voucher.soLuong === null ||
      this.voucher.soLuong === undefined ||
      this.voucher.soLuong === ''
    ) {
      this.errors.soLuong = 'Số lượng không được để trống!';
    } else {
      const checkSo = Number(this.voucher.soLuong);
      if (isNaN(checkSo)) {
        this.errors.soLuong = 'Số lượng phải là số!';
      } else if (checkSo <= 0) {
        this.errors.soLuong = 'Số lượng phải lớn hơn 0!';
      }
    }


    if (
      this.voucher.donToiThieu === null ||
      this.voucher.donToiThieu === undefined ||
      this.voucher.donToiThieu === ''
    ) {
      this.errors.donToiThieu = 'Đơn tối thiểu không được để trống!';
    }
    else {
      // Ép về kiểu number để check
      const checkSo = Number(this.voucher.donToiThieu);
      if (isNaN(checkSo)) {
        this.errors.donToiThieu = 'Đơn tối thiểu phải là số!';
      } else if (checkSo < 0) {
        this.errors.donToiThieu = 'Đơn tối thiểu không được âm!';
      }
    }

    if (this.voucher.hinhThucGiam === null || this.voucher.hinhThucGiam === undefined) {
      this.errors.hinhThucGiam = 'Vui lòng chọn hình thức giảm!';
    }

    if (this.voucher.giaTriGiam === null || this.voucher.giaTriGiam === undefined || this.voucher.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      const checkGiaTriGiam = Number(this.voucher.giaTriGiam);

      if (this.voucher.hinhThucGiam === true) {
        // Nếu hình thức giảm là theo số tiền
        if (isNaN(checkGiaTriGiam)) {
          this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
        } else if (checkGiaTriGiam <= 0) {
          this.errors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0!';
        }
        else {
          const donToiThieu = Number(this.voucher.donToiThieu);
          if (checkGiaTriGiam >= donToiThieu) {
            this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn hoặc bằng đơn tối thiểu!';
          }
        }
      } else {
        // Nếu hình thức giảm là theo phần trăm
        if (isNaN(checkGiaTriGiam)) {
          this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
        } else if (checkGiaTriGiam <= 0) {
          this.errors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0!';
        } else if (checkGiaTriGiam > 100) {
          this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn 100%!';
        }
      }
    }

    if (this.voucher.hinhThucGiam == true) {
      // Nếu giảm theo tiền, phải để trống giảm tối đa
      this.voucher.giamToiDa = null;
    }


    if (this.voucher.hinhThucGiam === false) {
      if (this.voucher.giamToiDa === null || this.voucher.giamToiDa === undefined || this.voucher.giamToiDa === '') {
        this.errors.giamToiDa = 'Giảm tối đa không được để trống!';
      } else {
        // Ép về kiểu number để check
        const numericValue = Number(this.voucher.giamToiDa);
        if (isNaN(numericValue)) {
          this.errors.giamToiDa = 'Giảm tối đa phải là số!';
        } else if (numericValue < 0) {
          this.errors.giamToiDa = 'Giảm tối đa không được âm!';
        }
      }
    }

    if (!this.voucher.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }

    if (!this.voucher.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(`${this.voucher.ngayBatDau}T23:58:59.999`);
      const endDate = new Date(`${this.voucher.ngayKetThuc}T23:59:59.999`);

      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }

      if (startDate < currentDate) {
        this.errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại!';
      }

      if (endDate < currentDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc không được nhỏ hơn ngày hiện tại!';
      }
    }

    if (this.voucher.trangThai === null || this.voucher.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }

    return Object.keys(this.errors).length === 0;
  }

  searchVoucherTheoTen(): void {
    if (this.searchText.trim() === '') {
      this.loadPage(0)
      return
    }
 
    this.voucherService.searchVoucherByTenAndTrangThai(this.selectedTrangThai,this.searchText,0,8).subscribe(
      (data) => {
        this.vouchers = data.content
         this.totalPages = data.totalPages || 0; 
         this.currentPage = 0; 
         this.tinhSoTrang(); 
      },
      (error) => {

      }
    );
  }
  validateEditForm(): boolean {

    this.errors = {};

    if (!this.voucherEdit.ma || !this.voucherEdit.ma.trim()) {
      this.errors.ma = 'Mã voucher không được để trống!';
    }

    if (!this.voucherEdit.ten || !this.voucherEdit.ten.trim()) {
      this.errors.ten = 'Tên voucher không được để trống!';
    }
    if (this.voucherEdit.hinhThucGiam === null || this.voucherEdit.hinhThucGiam === undefined) {
      this.errors.hinhThucGiam = 'Vui lòng chọn hình thức giảm!';
    }

    if (
      this.voucherEdit.soLuong === null ||
      this.voucherEdit.soLuong === undefined ||
      this.voucherEdit.soLuong === ''
    ) {
      this.errors.soLuong = 'Số lượng không được để trống!';
    } else {
      const checkSo = Number(this.voucherEdit.soLuong);
      if (isNaN(checkSo)) {
        this.errors.soLuong = 'Số lượng phải là số!';
      } else if (checkSo <= 0) {
        this.errors.soLuong = 'Số lượng phải lớn hơn 0!';
      }
    }

    if (this.voucherEdit.giaTriGiam === null || this.voucherEdit.giaTriGiam === undefined || this.voucherEdit.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      const checkGiaTriGiam = Number(this.voucherEdit.giaTriGiam);

      if (this.voucherEdit.hinhThucGiam === true) {
        // Nếu hình thức giảm là theo số tiền
        if (isNaN(checkGiaTriGiam)) {
          this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
        } else if (checkGiaTriGiam <= 0) {
          this.errors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0!';
        }
        else {
          const donToiThieu = Number(this.voucherEdit.donToiThieu);
          if (checkGiaTriGiam >= donToiThieu) {
            this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn hoặc bằng đơn tối thiểu!';
          }
        }
      } else {
        // Nếu hình thức giảm là theo phần trăm
        if (isNaN(checkGiaTriGiam)) {
          this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
        } else if (checkGiaTriGiam <= 0) {
          this.errors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0!';
        } else if (checkGiaTriGiam > 100) {
          this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn 100%!';
        }
      }
    }

    if (this.voucherEdit.donToiThieu === null || this.voucherEdit.donToiThieu === undefined || this.voucherEdit.donToiThieu === '') {
      this.errors.donToiThieu = 'Đơn tối thiểu không được để trống!';
    } else {
      // Ép về kiểu number để check
      const checkSo = Number(this.voucherEdit.donToiThieu);
      if (isNaN(checkSo)) {
        this.errors.donToiThieu = 'Đơn tối thiểu phải là số!';
      } else if (checkSo < 0) {
        this.errors.donToiThieu = 'Đơn tối thiểu không được âm!';
      }
    }

    if (this.voucherEdit.hinhThucGiam == true) {
      // Nếu giảm theo tiền, phải để trống giảm tối đa
      this.voucherEdit.giamToiDa = null;
    } 


    if (!this.voucherEdit.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }

    if (!this.voucherEdit.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(`${this.voucherEdit.ngayBatDau}T23:58:59.999`);
      const endDate = new Date(`${this.voucherEdit.ngayKetThuc}T23:59:59.999`);
      endDate.setHours(23, 59, 59, 999);

      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }

      else if (endDate < currentDate && this.voucherEdit.trangThai == true) {
        this.errors.trangThai = 'Khuyến mãi đã hết hạn, trạng thái phải là "Không hoạt động".';
      }

      else if (endDate < currentDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải lớn hơn ngày hiện tại!';
      }

    }
    if (this.voucherEdit.trangThai === null || this.voucherEdit.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }


    return Object.keys(this.errors).length === 0;
  }

  updateVoucher() {
    if (!this.validateEditForm()) {
      return;
    }

    const isConfirmed = window.confirm('Bạn có chắc chắn muốn cập nhật voucher này?');

    if (!isConfirmed) {
      return;
    }

    if (this.voucherEdit.id) {
      this.voucherService.updateVoucher(this.voucherEdit).subscribe(
        (response) => {
          alert('Cập nhật voucher thành công!');
          this.loadData();
          this.closeModalEdit();

        },
        (error) => {
          if (error.status === 403) {
            alert('Bạn không có quyền truy cập chức năng này.');
          } else {
            alert('Có lỗi xảy ra khi cập nhật voucher.');
          }
        }
      );
    } else {
      alert('ID voucher không hợp lệ!');
    }
  }

  showDetail(voucherId: number) {
    this.selectedVoucher = this.vouchers.find(voucher => voucher.id === voucherId);
    this.showModalDetail = true;
  }
  locTrangThai(trangThai: number, page: number): void {
    this.voucherService.searchVoucherByTenAndTrangThai(trangThai,this.searchText, page, 8).subscribe((response) => {
      this.vouchers = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.tinhSoTrang();
    });
  }

  loadData(): void {
    if (this.selectedTrangThai !== 3) {
      this.locTrangThai(this.selectedTrangThai, 0);
    } else {
      this.loadPage(0);
    }
  }

  loadPage(page: number): void {
    this.voucherService.getVoucher(page, 8).subscribe((response) => {
      this.vouchers = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.tinhSoTrang();
    });
  }
  Page(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      if (this.selectedTrangThai !== 3) {
        this.locTrangThai(this.selectedTrangThai, page);
      } else {
        this.loadPage(page);
      }

    } else {

    }
  }


  tinhSoTrang(): void {
    const startPage = Math.floor(this.currentPage / this.maxPages) * this.maxPages;
    const endPage = Math.min(startPage + this.maxPages, this.totalPages);

    this.numberPages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  }

  PreviousPage(): void {
    if (this.currentPage > 0) {
      if (this.selectedTrangThai !== 3) {
        this.locTrangThai(this.selectedTrangThai, this.currentPage - 1);
      } else {
        this.loadPage(this.currentPage - 1);
      }

    }
  }

  NextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      if (this.selectedTrangThai !== 3) {
        this.locTrangThai(this.selectedTrangThai, this.currentPage + 1);
      } else {
        this.loadPage(this.currentPage + 1);
      }

    }
  }

  openModal() {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_Quản lý') {
      this.showModal = true;
      this.resetForm();
    } else {
      alert('Bạn không có quyền truy cập chức năng này.');
    }
  }

  // Hàm đóng modal
  closeModal() {
    this.errors = {}
    this.resetForm();
    this.showModal = false;
  }
  openModalDetail() {
    this.resetForm();
    this.showModalDetail = true;
  }
  closeModalDetail() {
    this.resetForm();
    this.showModalDetail = false;
  }
  openModalEdit() {
    this.resetForm();
    this.showModalEdit = true;
  }
  closeModalEdit() {
    this.errors = {}
    this.resetForm();
    this.showModalEdit = false;
  }
  openModalSearch() {
    this.resetForm();
    this.showModalSearch = true;
  }
  closeModalSearch() {
    this.resetForm();
    this.showModalSearch = false;
  }

  showCannotEditMessage(fieldName: string): void {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const ngayKetThuc = new Date(this.voucherEdit.ngayKetThuc);
    ngayKetThuc.setHours(23, 59, 59, 999)
    // Kiểm tra trạng thái voucher đã được áp dụng hay chưa và đã hết hạn chưa
    const isVoucherExpired = ngayKetThuc < currentDate;
    const isVoucherUsed = this.voucherUsed;

    switch (fieldName) {
      case 'ma':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa mã!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa mã!');
        }
        break;
      case 'ten':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa tên voucher!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa tên voucher!');
        }
        break;
      case 'giaTriGiam':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa giá trị giảm!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa giá trị giảm!');
        }
        break;
      case 'soLuong':
       if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa số lượng!');
        }
        break;
      case 'hinhThucGiam':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa hình thức giảm!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa hình thức giảm!');
        }
        break;
      case 'donToiThieu':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa đơn tối thiểu!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa đơn tối thiểu!');
        }
        break;
      case 'giamToiDa':
        if (isVoucherUsed) {
          alert('Voucher đã được áp dụng, không thể sửa giảm tối đa!');
        } else if (isVoucherExpired) {
          alert('Voucher đã hết hạn, không thể sửa giảm tối đa!');
        }
        break;
      default:
        break;

    }
  }


}
