import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KhuyenmaiService, SanPhamChiTietDto } from './khuyenmai.service';
import { FormsModule } from '@angular/forms';
import { SanphamService } from '../sanpham/sanpham.service';

@Component({
  selector: 'app-khuyenmai',
  imports: [CommonModule, FormsModule],
  templateUrl: './khuyenmai.component.html',
  styleUrl: './khuyenmai.component.css'
})
export class KhuyenmaiComponent implements OnInit {
  khuyenmais: any[] = [];
  showModal: boolean = false;
  showModalDetail: boolean = false;
  showModalSearch: boolean = false;
  maxPages = 3;
  selectedTrangThai: number = 3;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  sanPham: SanPhamChiTietDto[] = [];
  showChonSanPham: boolean = false;
  selectedKhuyenMaiId: number | null = null;
  showModalEdit = false;
  selectedKhuyenMai: any = null;
  khuyenmaiEdit: any = {};
  searchText: string = '';
  numberPages: number[] = [];
  filteredKhuyenMais: any[] = [];
  errors: any = {};
  khuyenmai: any = {
    id: '',
    ma: '',
    ten: '',
    giaTriGiam: null,
    ngayBatDau: '',
    ngayTao: '',
    ngaySua: '',
    ngayKetThuc: '',
    trangThai: null,
  };
  checkNgay: boolean = false;
  constructor(private khuyenmaiService: KhuyenmaiService, sanphamService: SanphamService) { }

  ngOnInit(): void {
    this.loadData()
  }

  resetForm() {
    this.khuyenmai = {
      ma: '',
      ten: '',
      giaTriGiam: null,
      ngayBatDau: '',
      ngayKetThuc: '',
      trangThai: null,
    };

  }
  editKhuyenMai(khuyenmaiId: number) {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_Quản lý') {
      this.khuyenmaiService.chiTietKhuyenMai(khuyenmaiId).subscribe((khuyenmai) => {
        this.khuyenmaiEdit = { ...khuyenmai };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(this.khuyenmaiEdit.ngayKetThuc);
        endDate.setHours(23, 59, 59, 999)
        const isExpired = endDate < today;
        // Nếu khuyến mãi đã hết hạn, không cho phép sửa
        if (isExpired) {
          this.checkNgay = true;
        }
        else {
          // Nếu voucher không hết hạn, cho phép sửa lại
          this.checkNgay = false;
        }
        this.showModalEdit = true;
      });
    } else {
      alert('Bạn không có quyền truy cập chức năng này.');
    }

  }

  onNgayKetThucChange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chốt giờ hôm nay

    const endDate = new Date(this.khuyenmaiEdit.ngayKetThuc);
    endDate.setHours(23, 59, 59, 999);

    if (endDate > today) {
      // Nếu đã gia hạn: cho phép sửa các trường
      this.checkNgay = false;
    } else {
      // Nếu vẫn hết hạn: giữ readonly
      this.checkNgay = true;
    }
  }

  addKhuyenMai() {

    if (!this.validateForm()) {
      return;
    }

    const isConfirmed = window.confirm('Bạn có chắc chắn muốn thêm khuyến mãi này?');

    if (!isConfirmed) {
      return;
    }


    this.khuyenmaiService.addKhuyenMai(this.khuyenmai).subscribe(
      (response) => {
        alert('Thêm khuyến mãi thành công!');
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

  loadSanPham(khuyenMaiId: number): void {
    // Tìm khuyến mãi theo ID
    const selectedKhuyenMai = this.khuyenmais.find(km => km.id === khuyenMaiId);

    if (!selectedKhuyenMai) {
      alert('Không tìm thấy khuyến mãi!');
      return;
    }

    // Kiểm tra nếu khuyến mãi không hoạt động
    if (!selectedKhuyenMai.trangThai) {
      alert('Khuyến mãi không hoạt động, không thể chọn sản phẩm!');
      return;
    }

    // Kiểm tra xem ngày bắt đầu có lớn hơn ngày hiện tại không
    const currentDate = new Date();
    const startDate = new Date(selectedKhuyenMai.ngayBatDau);
    currentDate.setHours(23, 59, 59, 999)
    startDate.setHours(0, 0, 0, 0)
    if (startDate > currentDate) {
      alert('Ngày bắt đầu khuyến mãi chưa đến, không thể chọn sản phẩm!');
      return;
    }

    this.selectedKhuyenMaiId = khuyenMaiId;
    this.khuyenmaiService.getSanPham(khuyenMaiId).subscribe(
      (products) => {
        this.sanPham = products.filter((product) => !product.disabled);
        this.showChonSanPham = true;
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

  closeChonSanPham(): void {
    this.showChonSanPham = false;
    this.sanPham = [];
  }


  luuSanPham(): void {
    if (this.selectedKhuyenMaiId === null) {
      alert('Không tìm thấy ID khuyến mãi!');
      return;
    }

    const isConfirmed = window.confirm('Bạn có chắc chắn muốn lưu khuyến mãi cho sản phẩm không');

    if (!isConfirmed) {
      return;
    }
    const selectedProductIds = this.sanPham
      .filter((product) => product.selected)
      .map((product) => product.id);

    this.khuyenmaiService.saveSanPhamWithKhuyenMai(this.selectedKhuyenMaiId, selectedProductIds).subscribe(
      (response: string) => {
        alert("Đã lưu sản phẩm");
        this.closeChonSanPham();
      },
      (error) => {
        alert('Có lỗi xảy ra khi lưu sản phẩm.');
      }
    );
  }

  validateForm(): boolean {
    this.errors = {};
    if (!this.khuyenmai.ma.trim()) {
      this.errors.ma = 'Mã khuyến mãi không được để trống!';
    }
    else {
      const checkTrungMa = this.khuyenmais.some(khuyenmai => khuyenmai.ma == this.khuyenmai.ma);
      if (checkTrungMa) {
        this.errors.ma = 'Mã khuyến mãi đã tồn tại!';
      }
    }
    if (!this.khuyenmai.ten.trim()) {
      this.errors.ten = 'Tên khuyến mãi không được để trống!';
    }

    if (this.khuyenmai.giaTriGiam === null || this.khuyenmai.giaTriGiam === undefined || this.khuyenmai.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {

      const checkSo = Number(this.khuyenmai.giaTriGiam);
      if (isNaN(checkSo)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (checkSo <= 0) {
        this.errors.giaTriGiam = 'Giá trị giảm không được nhỏ hơn 1!';
      }
      else if (checkSo > 100) {
        this.errors.giaTriGiam = 'Giá trị giảm không được quá 100%';
      }
    }

    if (!this.khuyenmai.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }

    if (!this.khuyenmai.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(`${this.khuyenmai.ngayBatDau}T23:58:59.999`);
      const endDate = new Date(`${this.khuyenmai.ngayKetThuc}T23:59:59.999`);

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

    if (this.khuyenmai.trangThai === null || this.khuyenmai.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }

    return Object.keys(this.errors).length === 0;
  }

  searchKhuyenMaiTheoTen(): void {
    if (this.searchText.trim() === '') {
      this.loadPage(0)
      return
    }
 
    this.khuyenmaiService.searchKhuyenMaiByTenAndTrangThai(this.selectedTrangThai,this.searchText,0,8).subscribe(
      (data) => {
        this.khuyenmais = data.content
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

    if (!this.khuyenmaiEdit.ma || !this.khuyenmaiEdit.ma.trim()) {
      this.errors.ma = 'Mã khuyến mãi không được để trống!';
    }

    if (!this.khuyenmaiEdit.ten || !this.khuyenmaiEdit.ten.trim()) {
      this.errors.ten = 'Tên khuyến mãi không được để trống!';
    }

    if (this.khuyenmaiEdit.giaTriGiam === null || this.khuyenmaiEdit.giaTriGiam === undefined || this.khuyenmaiEdit.giaTriGiam === '') {
      this.errors.giaTriGiam = 'Giá trị giảm không được để trống!';
    } else {
      const checkSo = Number(this.khuyenmaiEdit.giaTriGiam);
      if (isNaN(checkSo)) {
        this.errors.giaTriGiam = 'Giá trị giảm phải là số!';
      } else if (checkSo < 1) {
        this.errors.giaTriGiam = 'Giá trị giảm không được nhỏ hơn 1';
      }
      else if (checkSo > 100) {
        this.errors.giaTriGiam = 'Giá trị giảm không được lớn hơn 100%';
      }
    }
    if (!this.khuyenmaiEdit.ngayBatDau) {
      this.errors.ngayBatDau = 'Ngày bắt đầu không được để trống!';
    }

    if (!this.khuyenmaiEdit.ngayKetThuc) {
      this.errors.ngayKetThuc = 'Ngày kết thúc không được để trống!';
    }
    else {
      const currentDate = new Date();
      const startDate = new Date(`${this.khuyenmaiEdit.ngayBatDau}T23:58:59.999`);
      const endDate = new Date(`${this.khuyenmaiEdit.ngayKetThuc}T23:59:59.999`);
    
      endDate.setHours(23, 59, 59, 999);
      if (startDate > endDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu!';
      }
      else if (endDate < currentDate && this.khuyenmaiEdit.trangThai == true) {
        this.errors.trangThai = 'Khuyến mãi đã hết hạn, trạng thái phải là "Không hoạt động".';
      }
      else if (startDate < currentDate) {
        this.errors.ngayBatDau = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại!';
      }
      else if (endDate < currentDate) {
        this.errors.ngayKetThuc = 'Ngày kết thúc phải lớn hơn ngày hiện tại!';
      }

    }
    if (this.khuyenmaiEdit.trangThai === null || this.khuyenmaiEdit.trangThai === undefined) {
      this.errors.trangThai = 'Vui lòng chọn trạng thái!';
    }


    return Object.keys(this.errors).length === 0;
  }

  updateKhuyenMai() {
    if (!this.validateEditForm()) {
      return;
    }


    const isConfirmed = window.confirm('Bạn có chắc chắn muốn sửa khuyến mãi này?');

    if (!isConfirmed) {
      return;
    }
    if (this.khuyenmaiEdit.id) {
      this.khuyenmaiService.updateKhuyenMai(this.khuyenmaiEdit).subscribe(
        (response) => {
          alert('Cập nhật khuyến mãi thành công!');
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
      alert('ID khuyến mãi không hợp lệ!');
    }
  }


  showDetail(khuyenmaiId: number) {
    this.selectedKhuyenMai = this.khuyenmais.find(khuyenmai => khuyenmai.id === khuyenmaiId);
    this.showModalDetail = true;
  }

  locTheoTrangThai(trangThai: number, page: number): void {
    this.khuyenmaiService.searchKhuyenMaiByTenAndTrangThai(trangThai,this.searchText, page, 8).subscribe((response) => {
      this.khuyenmais = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.tinhSoTrang();
    });
  }
  loadData(): void {
    if (this.selectedTrangThai !== 3) {
      this.locTheoTrangThai(this.selectedTrangThai, 0);
    } else {
      this.loadPage(0);
    }
  }

  loadPage(page: number): void {
    this.khuyenmaiService.getKhuyenMai(page, 8).subscribe((response) => {
      this.khuyenmais = response.content;
      this.totalPages = response.totalPages;
      this.currentPage = page;
      this.tinhSoTrang();
    });
  }


  Page(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, page);
      } else {
        this.loadPage(page);
      }

    } else {
      console.warn('Invalid page number:', page);
    }
  }

  PreviousPage(): void {
    if (this.currentPage > 0) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, this.currentPage - 1);
      } else {
        this.loadPage(this.currentPage - 1);
      }

    }
  }
  tinhSoTrang(): void {
    const startPage = Math.floor(this.currentPage / this.maxPages) * this.maxPages;
    const endPage = Math.min(startPage + this.maxPages, this.totalPages);
    this.numberPages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  }

  NextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      if (this.selectedTrangThai !== 3) {
        this.locTheoTrangThai(this.selectedTrangThai, this.currentPage + 1);
      } else {
        this.loadPage(this.currentPage + 1);
      }

    }
  }

  searchSanPham(): void {
    if (!this.selectedKhuyenMaiId) {
      alert('Vui lòng chọn khuyến mãi trước khi tìm kiếm sản phẩm.');
      return;
    }

    this.khuyenmaiService.getSanPham(this.selectedKhuyenMaiId, this.searchText).subscribe(
      (sanpham) => {
        this.sanPham = sanpham.filter((sanpham) => !sanpham.disabled);
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm.');
      }
    );
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
    const ngayKetThuc = new Date(this.khuyenmaiEdit.ngayKetThuc);
    ngayKetThuc.setHours(23, 59, 59, 999)
    // Kiểm tra trạng thái voucher đã được áp dụng hay chưa và đã hết hạn chưa
    const isVoucherExpired = ngayKetThuc < currentDate;
    switch (fieldName) {
      case 'ma':
        if (isVoucherExpired) {
          alert('Khuyến mãi đã hết hạn, không thể sửa mã!');
        }
        break;
      case 'ten':
        if (isVoucherExpired) {
          alert('Khuyến mãi đã hết hạn, không thể sửa tên khuyến mãi!');
        }
        break;
      case 'giaTriGiam':
        if (isVoucherExpired) {
          alert('Khuyến mãi đã hết hạn, không thể sửa giá trị giảm!');
        }
        break;
      default:
        break;
    }
  }

}
