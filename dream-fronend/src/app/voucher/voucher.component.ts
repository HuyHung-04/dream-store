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
  maxVisiblePages = 3;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  selectedTrangThai: number = 3;
  showModalEdit = false;
  selectedVoucher: any = null;
  voucherEdit: any = {};
  searchText: string = '';
  visiblePages: number[] = [];
  filteredVouchers: any[] = [];
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
    this.voucherService.getVoucherDetail(voucherId).subscribe((voucher) => {
      this.voucherEdit = { ...voucher };
      this.isGiamToiDaDisabled = this.voucherEdit.hinhThucGiam === true; // Nếu giảm tiền thì ẩn Giảm tối đa
      this.showModalEdit = true;
    });
  }
  onHinhThucGiamChange2() {
    console.log(this.voucherEdit.hinhThucGiam);
    this.isGiamToiDaDisabled = this.voucherEdit.hinhThucGiam === true;
    if (this.isGiamToiDaDisabled) {
      this.voucherEdit.giamToiDa = null; // Xóa giá trị khi giảm theo tiền
    }
  }
  
  onHinhThucGiamChange() {
    console.log(this.voucher.hinhThucGiam);
    if (this.voucher.hinhThucGiam === true) { // Giảm giá
      this.voucher.giamToiDa = null; // Xóa giá trị giảm tối đa khi không cần dùng
    }
  }
  
  addVoucher() {
    if (!this.validateForm()) {
      return; // Stop execution if form is invalid
    }
    
    this.voucherService.addVoucher(this.voucher).subscribe(
      (response) => {
        alert('Thêm voucher thành công!');
        this.loadData();
        // Tải lại danh sách voucher
        this.closeModal();
        this.resetForm();
      },
      (error) => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi thêm voucher.');
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

      // Kiểm tra mã voucher đã tồn tại trong danh sách
      const isDuplicate = this.vouchers.some(voucher => voucher.ma == this.voucher.ma);

      if (isDuplicate) {
        this.errors.ma = 'Mã voucher đã tồn tại!';
      }
    }

    if (!this.voucher.ten.trim()) {
      this.errors.ten = 'Tên voucher không được để trống!';
    }

    if (this.voucher.hinhThucGiam === null || this.voucher.hinhThucGiam === undefined) {
      this.errors.hinhThucGiam = 'Vui lòng chọn hình thức giảm!';
    }

    if (this.voucher.giaTriGiam === null || this.voucher.giaTriGiam === undefined || this.voucher.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      // Ép về kiểu number để check
      const numericValue = Number(this.voucher.giaTriGiam);
      if (isNaN(numericValue)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (numericValue < 0) {
        this.errors.giaTriGiam = 'Giá trị giảm không được âm!';
      }
    }

    if (this.voucher.hinhThucGiam === 'money') {
      // Nếu giảm theo tiền, phải để trống giảm tối đa
      this.voucher.giamToiDa = null;
    } else if (this.voucher.hinhThucGiam === 'percent') {
      if (this.voucher.giamToiDa === null || this.voucher.giamToiDa === undefined || this.voucher.giamToiDa === '') {
        this.errors.giamToiDa = 'Giảm tối đa không được để trống khi giảm theo %!';
      } else { 
        const numericValue = Number(this.voucher.giamToiDa);
        if (isNaN(numericValue)) {
          this.errors.giamToiDa = 'Giảm tối đa phải là số!';
        } else if (numericValue < 0) {
          this.errors.giamToiDa = 'Giảm tối đa không được âm!';
        }
      }
    }
    

    if (this.voucher.hinhThucGiam === false) { // Chỉ kiểm tra nếu giảm theo %
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
      const currentDate = new Date(); //01/01/2024 15:09
      const startDate = new Date(this.voucher.ngayBatDau);
      const endDate = new Date(`${this.voucher.ngayKetThuc}T23:59:59.999`);

      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
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

  searchAndShowSearch(): void {
    if (this.searchText.trim() === '') {
      alert('Vui lòng nhập tên voucher để tìm kiếm.');
      return;
    }

    // Tìm kiếm voucher theo tên
    this.voucherService.searchVoucherByName(this.searchText).subscribe(
      (data) => {
        if (data.length > 0) {
          this.selectedVoucher = data[0]; // Hiển thị voucher đầu tiên trong kết quả
          this.showModalSearch = true; // Mở modal chi tiết
        } else {
          alert('Không tìm thấy voucher phù hợp.');
        }
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm voucher:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm.');
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

    // Sửa bên trong validateForm()
    if (this.voucherEdit.giaTriGiam === null || this.voucherEdit.giaTriGiam === undefined || this.voucherEdit.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      // Ép về kiểu number để check
      const numericValue = Number(this.voucherEdit.giaTriGiam);
      if (isNaN(numericValue)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (numericValue < 0) {
        this.errors.giaTriGiam = 'Giá trị giảm không được âm!';
      }
    }

    if (this.voucherEdit.donToiThieu === null || this.voucherEdit.donToiThieu === undefined || this.voucherEdit.donToiThieu === '') {
      this.errors.donToiThieu = 'Đơn tối thiểu không được để trống!';
    } else {
      // Ép về kiểu number để check
      const numericValue = Number(this.voucherEdit.donToiThieu);
      if (isNaN(numericValue)) {
        this.errors.donToiThieu = 'Đơn tối thiểu phải là số!';
      } else if (numericValue < 0) {
        this.errors.donToiThieu = 'Đơn tối thiểu không được âm!';
      }
    }

    if (this.voucherEdit.hinhThucGiam === 'money') {
      // Nếu giảm theo tiền, phải để trống giảm tối đa
      this.voucherEdit.giamToiDa = null;
    } else if (this.voucherEdit.hinhThucGiam === 'percent') {
      if (this.voucherEdit.giamToiDa === null || this.voucherEdit.giamToiDa === undefined || this.voucherEdit.giamToiDa === '') {
        this.errors.giamToiDa = 'Giảm tối đa không được để trống khi giảm theo %!';
      } else { 
        const numericValue = Number(this.voucherEdit.giamToiDa);
        if (isNaN(numericValue)) {
          this.errors.giamToiDa = 'Giảm tối đa phải là số!';
        } else if (numericValue < 0) {
          this.errors.giamToiDa = 'Giảm tối đa không được âm!';
        }
      }
    }
    


    if (!this.voucherEdit.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }
    // 6. Kiểm tra ngày kết thúc
    if (!this.voucherEdit.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(this.voucherEdit.ngayBatDau);
      const endDate = new Date(`${this.voucherEdit.ngayKetThuc}T23:59:59.999`);

      // Adjust startDate to 00:00 and endDate to 23:59
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }

      else if (endDate < currentDate && this.voucherEdit.trangThai == true) {
        this.errors.trangThai = 'Khuyến mãi đã hết hạn, trạng thái phải là "Không hoạt động".';
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

    if (this.voucherEdit.id) {
      this.voucherService.updateVoucher(this.voucherEdit).subscribe(
        (response) => {


          alert('Cập nhật voucher thành công!');
          this.loadData();
          console.log('Updated Voucher:', this.voucher.ngaySua);
          this.closeModalEdit();

        },
        (error) => {
          console.error('Error:', error);
          alert('Có lỗi xảy ra khi cập nhật voucher.');
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
  loadVoucherByTrangThai(trangThai: number, page: number): void {
    this.voucherService.getVoucherMaiByTrangThai(trangThai, page, 8).subscribe((response) => {
      this.vouchers = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.updateVisiblePages();
      this.filterVouchers();
    });
  }
  
  loadData(): void {
    console.log(this.selectedTrangThai);
    console.log(this.filterVouchers());
    if (this.selectedTrangThai !== 3) {
      this.loadVoucherByTrangThai(this.selectedTrangThai, 0);
    } else {
      this.loadPage(0);
    }
  }

  getVoucherDetail(id: number): void {
    this.voucherService.getVoucherDetail(id).subscribe(
      (data) => {
        this.voucher = data;

      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết voucher:', error);
        alert('Không tìm thấy thông tin voucher!');
      }
    );
  }

  loadPage(page: number): void {
    this.voucherService.getVoucher(page, 8).subscribe((response) => {
      this.vouchers = response.content; // Dữ liệu của trang hiện tại
      this.totalPages = response.totalPages; // Tổng số trang
      this.currentPage = page; // Cập nhật trang hiện tại
      this.updateVisiblePages();
      this.filterVouchers();
    });
  }
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      if (this.selectedTrangThai !== 3) {
        this.loadVoucherByTrangThai(this.selectedTrangThai, page);
      } else {
        this.loadPage(page);
      }
      
    } else {
      console.warn('Invalid page number:', page);
    }
  }
  filterVouchers() {
    if (this.searchText.trim()) {
      this.filteredVouchers = this.vouchers.filter((voucher) =>
        voucher.ten.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredVouchers = [...this.vouchers]; // Hiển thị tất cả nếu không tìm kiếm
    }
  }

  
  
  
  updateVisiblePages(): void {
    const startPage = Math.floor(this.currentPage / this.maxVisiblePages) * this.maxVisiblePages;
    const endPage = Math.min(startPage + this.maxVisiblePages, this.totalPages);

    this.visiblePages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      if (this.selectedTrangThai !== 3) {
        this.loadVoucherByTrangThai(this.selectedTrangThai, this.currentPage - 1);
      } else {
        this.loadPage(this.currentPage - 1);
      }
    
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      if (this.selectedTrangThai !== 3) {
        this.loadVoucherByTrangThai(this.selectedTrangThai, this.currentPage + 1);
      } else {
        this.loadPage(this.currentPage + 1);
      }
      
    }
  }

  openModal() {
    this.resetForm();
    this.showModal = true;
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

}
