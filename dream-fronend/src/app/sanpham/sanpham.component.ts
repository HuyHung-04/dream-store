import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanphamService } from './sanpham.service';
import { FormsModule } from '@angular/forms';
import { Anh } from './sanpham.service';
import { ChangeDetectorRef } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-sanpham',
  standalone: true,
  imports: [CommonModule ,FormsModule,NgSelectModule],
  templateUrl: './sanpham.component.html',
  styleUrls: ['./sanpham.component.css']
})
export class SanphamComponent implements OnInit {
  // khai báo mảng
  sanPhams: any[] = [];
  sanPhamChiTiets: any[] = [];
  thuongHieus: any[] = [];
  chatLieus: any[] = [];
  coAos: any[] = [];
  xuatXus: any[] = [];
  sizes: any[] = [];
  mauSacs: any[] = [];
  // khai báo modal
  showModal: boolean = false;
  showModalSanPhamChiTiet: boolean = false;
  showModalThuocTinh: boolean = false;
  showModalQuanLyAnh: boolean = false;
  showModalSanPhamChiTietThem: boolean = false; 
  // vallidate
  validationErrors: { [key: string]: string } = {};
  // id sản phẩm
  idSanPham: number = 0;
  // list ảnh
  anhHienCo: Anh[] = [];
  selectedFiles: File[] = [];
  activeSizes: any[] = [];
  activeMauSacs: any[] = [];
  // thêm sản phẩm
  sanPhamRequest: any = {
    ma: '',
    ten: '',
    thuongHieu: { id: '' },
    xuatXu: { id: '' },
    chatLieu: { id: '' },
    coAo: { id: '' },
    trangThai: 1,
    ngayTao: '',
    ngaySua: ''
  };
  // thêm sản phẩm chi tiết
  sanPhamChiTietRequest: any = {
    id: '',              
    ma: '',             
    gia: '',            
    soLuong: '',        
    sanPham: { id: '', ten: '' },          
    sizes: [],  
    mauSacs: [],
    trangThai: '',        
    ngayTao: '',         
    ngaySua: ''          
  }; 
  // lọc sản phẩm theo thuộc tính
  searchFilter: any = {
    thuongHieu: { id: '' },
    xuatXu: { id: '' },
    chatLieu: { id: '' },
    coAo: { id: '' },
    trangThai: ''
  };
  // lọc sản phẩm chi tiết
  searchFilterSanPhamChiTiet: any = {
    gia: '',            
    soLuong: '',         
    size: {            
      id: ''           
    },
    mauSac: {            
      id: ''           
    },
    trangThai: ''
  };
  // sửa sản phẩm
  editSanPham(sanPham: any): void {
    this.sanPhamRequest = { 
      id: sanPham.id, 
      ma: sanPham.ma,
      ten: sanPham.ten,
      thuongHieu: { id: sanPham.idThuongHieu },
      xuatXu: { id: sanPham.idXuatXu },
      chatLieu: { id: sanPham.idChatLieu },
      coAo: { id: sanPham.idCoAo },
      trangThai: sanPham.trangThai,
      ngayTao: sanPham.ngayTao,
      ngaySua: new Date().toISOString().split('T')[0],// ngày hiện tại
    };
    this.showModal = true; // Mở modal
  }
  // sửa sản phẩm chi tiết
  editSanPhamChiTiet(sanPhamChiTiet: any): void {
    // console.log("Dữ liệu đầu vào sanPhamChiTiet:", sanPhamChiTiet);
    this.sanPhamChiTietRequest = { 
      id: sanPhamChiTiet.id,
      ma: sanPhamChiTiet.ma,
      gia: sanPhamChiTiet.gia,
      soLuong: sanPhamChiTiet.soLuong,
      sanPham: {
        id: sanPhamChiTiet.idSanPham || '', 
        ten: sanPhamChiTiet.tenSanPham || ''
      },
      //Hiển thị tên thay vì id
      sizes: sanPhamChiTiet.tenSize ? [{ id: sanPhamChiTiet.idSize, ten: sanPhamChiTiet.tenSize }] : [],
      mauSacs: sanPhamChiTiet.tenMauSac ? [{ id: sanPhamChiTiet.idMauSac, ten: sanPhamChiTiet.tenMauSac }] : [],
      trangThai: sanPhamChiTiet.trangThai ?? 1, 
      ngayTao: sanPhamChiTiet.ngayTao || '',
      ngaySua: new Date().toISOString().split('T')[0], 
    };
    // console.log("Dữ liệu sau khi map:", this.sanPhamChiTietRequest);
    this.showModalSanPhamChiTietThem = true; // Mở modal sửa
  }

  // định chọn thương hiệu đầu
  selectedThuocTinh: string = 'thuongHieu';
  // thuộc tính
  thuongHieuRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  chatLieuRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  coAoRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  mauSacRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  sizeRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  xuatXuRequest: any = {
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    trangThai: 1
  }

  constructor(private sanphamService: SanphamService, private cdRef: ChangeDetectorRef) {}
  

  ngOnInit(): void {
    this.loadData()
  }

  // hàm load 
  loadData() : void{
  this.listSanPham()
  this.listSanPhamChiTiet()
  this.listThuongHieu()
  this.listChatLieu()
  this.listCoAo()
  this.listXuatXu()
  this.listSize()
  this.listMauSac()
  this.listMauSacStatus()
  this.listSizeStatus()
  }
  
  // phân trang và danh sách sản phẩm
  currentSanPhamPage: number = 0; // Trang hiện tại của sản phẩm
  sanPhamPageSize: number = 7; // Số sản phẩm mỗi trang
  totalSanPhamPages: number = 0; // Tổng số trang sản phẩm

  changeSanPhamPage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalSanPhamPages) {
      this.currentSanPhamPage = newPage;
      this.listSanPham(); // Load dữ liệu trang mới
    }
  }

  listSanPham(): void {
    this.sanphamService.getSanPham(this.currentSanPhamPage, this.sanPhamPageSize)
      .subscribe(data => {
        console.log("Danh sách sản phẩm:", data);
        this.sanPhams = Array.isArray(data.content) ? data.content : [];
        this.totalSanPhamPages = data.totalPages;
      });
  }
  // lọc sản phẩm
  searchSanPham(): void {
    this.sanphamService.searchSanPham(
      this.searchFilter.thuongHieu.id,
      this.searchFilter.xuatXu.id,
      this.searchFilter.chatLieu.id,
      this.searchFilter.coAo.id,
      this.searchFilter.trangThai,
      this.searchFilter.ten,
      this.currentSanPhamPage,
      this.sanPhamPageSize
    ).subscribe(data => {
      console.log("Kết quả tìm kiếm:", data);
      this.sanPhams = data.content;
      this.totalSanPhamPages = data.totalPages;
    });
  }
  onSearchFilterChange(): void {
    this.searchSanPham();
  }

  // phân trang và list sản phẩm chi tiết
  currentSanPhamId: number = 0; // ID sản phẩm đang xem chi tiết
  currentPage: number = 0; // Trang hiện tại
  pageSize: number = 5; // Số sản phẩm chi tiết mỗi trang
  totalPages: number = 0; // Tổng số trang

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.listSanPhamChiTiet(); 
    }
  }   
  listSanPhamChiTiet(): void {
    if (!this.currentSanPhamId) {
      // console.warn("Không có sản phẩm nào được chọn để hiển thị chi tiết.");
      return;
    }
    this.sanphamService.getSanPhamChiTiet(this.currentSanPhamId, this.currentPage, this.pageSize)
      .subscribe(dataSanPhamChiTiet => {
        console.log("Dữ liệu sản phẩm chi tiết:", dataSanPhamChiTiet);
        this.sanPhamChiTiets = dataSanPhamChiTiet.content || [];
        this.totalPages = dataSanPhamChiTiet.totalPages;
      });
  }
  // lọc sản phẩm chi tiết
  searchSanPhamChiTiet(): void {
    if (!this.selectedProduct || !this.selectedProduct.id) {
      console.warn("Chưa chọn sản phẩm để lọc sản phẩm chi tiết.");
      return;
    }
    this.sanphamService.searchSanPhamChiTiet(
      this.selectedProduct.id, // Thêm idSanPham vào tham số
      this.searchFilterSanPhamChiTiet.gia,
      this.searchFilterSanPhamChiTiet.soLuong,
      this.searchFilterSanPhamChiTiet.size?.id, // Kiểm tra null để tránh lỗi
      this.searchFilterSanPhamChiTiet.mauSac?.id, // Kiểm tra null để tránh lỗi
      this.searchFilterSanPhamChiTiet.trangThai,
      this.currentPage,
      this.pageSize
    ).subscribe(data => {
      console.log("Kết quả tìm kiếm sản phẩm chi tiết:", data);
      this.sanPhamChiTiets = data.content;
      this.totalPages = data.totalPages;
    });
  }
  
  onSearchSanPhamChiTiet(): void {
    this.searchSanPhamChiTiet();
  }
  // danh sách thuộc tính
  listThuongHieu(): void {
    this.sanphamService.getThuongHieu().subscribe(data => {
      console.log("Thương Hiệu Data", data); // Log dữ liệu
      this.thuongHieus = Array.isArray(data) ? data : []; // Gán dữ liệu từ response
    }, error => {
      console.error("Lỗi khi gọi API thương hiệu", error); // Log lỗi nếu có
    });
  }
  
  listChatLieu(): void {
    this.sanphamService.getChatLieu().subscribe(data => {
      console.log("Chất Liệu Data", data);
      this.chatLieus = Array.isArray(data) ? data : []; // Gán dữ liệu đúng từ thuộc tính content
    });
  }
  
  listCoAo(): void {
    this.sanphamService.getCoAo().subscribe(data => {
      console.log("Cổ Áo Data", data);
      this.coAos = Array.isArray(data) ? data : []; // Gán dữ liệu đúng từ thuộc tính content
    });
  }
  
  listXuatXu(): void {
    this.sanphamService.getXuatXu().subscribe(data => {
      console.log("Xuất Xứ Data", data);
      this.xuatXus = Array.isArray(data) ? data : []; 
    });
  }
  
  listSize(): void {
    this.sanphamService.getSize().subscribe(data => {
      console.log("Size Data", data);
      this.sizes = Array.isArray(data) ? data : []; 
    });
  } 

  listMauSac(): void {
    this.sanphamService.getMauSac().subscribe(data => {
      console.log("Màu sắc Data", data);
      this.mauSacs = Array.isArray(data) ? data : []; 
    });
  } 
  // mở modal sản phẩm
  openModalSanPham() {
    this.sanPhamRequest = {
      ma: '',
      ten: '',
      thuongHieu: { id: '' },
      xuatXu: { id: '' },
      chatLieu: { id: '' },
      coAo: { id: '' },
      trangThai: '',
      ngayTao: '',
      ngaySua: ''
    };
    this.showModal = true;
  }
  // mở modal sản phẩm chi tiết khi thêm và sửa
  openModalSanPhamChiTietThem(sanPhamChiTiet?: any): void {
    // console.log("Dữ liệu đầu vào sanPhamChiTiet:", sanPhamChiTiet);
    if (sanPhamChiTiet) {
        this.sanPhamChiTietRequest = {
            id: sanPhamChiTiet.id,
            ma: sanPhamChiTiet.ma,
            gia: sanPhamChiTiet.gia,
            soLuong: sanPhamChiTiet.soLuong,
            sanPham: { 
                id: sanPhamChiTiet.idSanPham || '', 
                ten: sanPhamChiTiet.tenSanPham || ''
            },
            // Chuyển danh sách về mảng các ID thay vì để rỗng
            sizes: sanPhamChiTiet.sizes ? sanPhamChiTiet.sizes.map((size: any) => size.id) : (sanPhamChiTiet.idSize ? [sanPhamChiTiet.idSize] : []),
            mauSacs: sanPhamChiTiet.mauSacs ? sanPhamChiTiet.mauSacs.map((mau: any) => mau.id) : (sanPhamChiTiet.idMauSac ? [sanPhamChiTiet.idMauSac] : []),
  
            trangThai: sanPhamChiTiet.trangThai ?? 1,
            ngayTao: sanPhamChiTiet.ngayTao || '',
            ngaySua: new Date().toISOString().split('T')[0]
        };
    } else {
        // Trường hợp thêm mới
        this.sanPhamChiTietRequest = {
            id: '',
            ma: '',
            gia: '',
            soLuong: '',
            sanPham: { id: '', ten: '' },
            sizes: [], 
            mauSacs: [],
            trangThai: '',
            ngayTao: new Date().toISOString().split('T')[0],
            ngaySua: ''
        };
  
        if (this.selectedProduct) {
            this.sanPhamChiTietRequest.sanPham = { 
                id: this.selectedProduct.id, 
                ten: this.selectedProduct.ten 
            };
        }
    }
    // console.log("Dữ liệu sau khi map:", this.sanPhamChiTietRequest);
    this.showModalSanPhamChiTietThem = true;
  }

    /*Mở modal và tải ảnh theo id sản phẩm */
    openModalQuanLyAnh(idSanPham: number) {
      this.idSanPham = idSanPham;
      this.showModalQuanLyAnh = true;
      this.loadAnhCuaSanPham();
    }

    /* Đóng modal quản lý ảnh */
    closeQuanLyAnh() {
      this.showModalQuanLyAnh = false;
      this.selectedFiles = [];
    }

    /*Gọi API lấy ảnh theo sản phẩm */
    loadAnhCuaSanPham() {
      if (!this.idSanPham) return;
      this.sanphamService.getAllAnh(this.idSanPham).subscribe(response => {
        if (Array.isArray(response)) {
          this.anhHienCo = response.map(anh => ({
            ...anh,
            anhUrl: `http://localhost:8080${anh.anhUrl}`
          }));
        } else {
          this.anhHienCo = [];
        }
        this.cdRef.markForCheck();
      });
    }
    
    onFileSelected(event: any, fileInput: HTMLInputElement) {
      if (!event.target.files) return; // Kiểm tra nếu không có file nào được chọn
      let selectedFiles: File[] = Array.from(event.target.files); // Chuyển FileList thành mảng File[]
      // Kiểm tra tổng số ảnh không vượt quá 5
      if (this.anhHienCo.length + selectedFiles.length > 5) {
        alert('Mỗi sản phẩm chỉ có thể có tối đa 5 ảnh.');
        // Reset input file về trạng thái ban đầu (No file chosen)
        fileInput.value = '';
        return;
      }
      this.selectedFiles = selectedFiles; // Gán danh sách file đã chọn
    }

    /** Hiển thị ảnh mới */
    private filePreviewMap = new Map<File, string>();

    getImagePreview(file: File): string {
      if (!this.filePreviewMap.has(file)) {
        this.filePreviewMap.set(file, URL.createObjectURL(file));
      }
      return this.filePreviewMap.get(file)!;
    }

    /* Upload ảnh lên server */
    uploadAnh() {
      if (this.selectedFiles.length === 0) {
        alert('Vui lòng chọn ảnh trước khi lưu.');
        return;
      }
    // Kiểm tra lại tổng số ảnh trên frontend trước khi gửi lên server
    if (this.anhHienCo.length + this.selectedFiles.length > 5) {
      alert('Mỗi sản phẩm chỉ có thể có tối đa 5 ảnh.');
      return;
    }
    this.sanphamService.uploadAnh(this.idSanPham, this.selectedFiles)
      .subscribe(response => {
        alert(typeof response === 'string' ? response : response.message);
        this.loadAnhCuaSanPham(); // Tải lại danh sách ảnh
        this.selectedFiles = []; // Reset danh sách ảnh mới
      }, error => {
        console.error('Lỗi khi tải lên ảnh:', error);
      });
    }

    // xoá ảnh
    xoaAnh(idAnh: number) {
      if (confirm('Bạn có chắc muốn xóa ảnh này không?')) {
        this.sanphamService.xoaAnh(idAnh).subscribe(response => {
          alert(response.message);
          this.loadAnhCuaSanPham(); // Cập nhật lại danh sách ảnh
        }, error => {
          console.error('Lỗi khi xoá ảnh:', error);
        });
      }
    }

    /* Xóa ảnh đã chọn */
    xoaAnhDaChon(index: number, fileInput: any) {
      this.selectedFiles.splice(index, 1);
      // Nếu không còn file nào được chọn, reset input file
      if (this.selectedFiles.length === 0 && fileInput) {
        fileInput.value = "";
      }
    }
    // đóng modal thêm sửa sản phảm chi tiết
  closeModalSanPhamChiTietThem(){
    this.showModalSanPhamChiTietThem = false;
    this.validationErrors = {};
  }

  // đóng modal sản phẩm
  closeModalSanPham() {
    this.showModal = false;
    this.validationErrors = {}; 
  }

  //mở modal sản phẩm chi tiết
  openModalSanPhamChiTiet(idSanPham: number, page: number = 0, size: number = 5): void {
    this.sanPhamChiTiets = [];
    this.currentSanPhamId = idSanPham;
    // Gán selectedProduct
    this.selectedProduct = this.sanPhams.find(sp => sp.id === idSanPham);
    // console.log("Selected Product:", this.selectedProduct);
    this.sanphamService.getSanPhamChiTiet(idSanPham, page, size).subscribe(dataSanPhamChiTiet => {
      if (dataSanPhamChiTiet && Array.isArray(dataSanPhamChiTiet.content)) {
        this.sanPhamChiTiets = dataSanPhamChiTiet.content;
        this.totalPages = dataSanPhamChiTiet.totalPages;
        this.currentPage = page;
      } else {
        this.sanPhamChiTiets = [];
      }
      this.showModalSanPhamChiTiet = true;
    });
  }
      // mở modal thuộc tính
      openModalThuocTinh(){
        this.showModalThuocTinh = true;
      }

      // đóng modal thuộc tính
      closeModalThuocTinh(){
        this.showModalThuocTinh = false;
        this.validationErrors = {}; 
      }
  
    selectedProduct: any = {};
    
    // đóng modal sản phẩm chi tiết
    closeModalSanPhamChiTiet() {
      this.showModalSanPhamChiTiet = false;
    }

   //validateSanPham thêm
    validateSanPham(): Promise<boolean> {
      return new Promise((resolve) => {
        this.validationErrors = {}; 

        if (!this.sanPhamRequest.ten.trim()) {
          this.validationErrors["ten"] = "Tên sản phẩm không được để trống";
          resolve(false);
        } else if (this.sanPhamRequest.ten.length > 100) {
          this.validationErrors["ten"] = "Tên quá dài";
          resolve(false);
        } else {
          // Kiểm tra trùng tên
          this.sanphamService.existsTenSanPham(this.sanPhamRequest.ten).subscribe(
            (exists: boolean) => {
              if (exists) {
                this.validationErrors["ten"] = "Tên sản phẩm đã tồn tại";
                resolve(false);
              } else {
                resolve(true);
              }
            },
            (error) => {
              console.error("Lỗi kiểm tra trùng tên sản phẩm", error);
              resolve(false);
            }
          );
        }

        if (!this.sanPhamRequest.thuongHieu.id) {
          this.validationErrors["thuongHieu"] = "Hãy chọn thương hiệu";
        }
        if (!this.sanPhamRequest.xuatXu.id) {
          this.validationErrors["xuatXu"] = "Hãy chọn xuất xứ";
        }
        if (!this.sanPhamRequest.chatLieu.id) {
          this.validationErrors["chatLieu"] = "Hãy chọn chất liệu";
        }
        if (!this.sanPhamRequest.coAo.id) {
          this.validationErrors["coAo"] = "Hãy chọn cổ áo";
        }
        if (this.sanPhamRequest.trangThai === '') {
          this.validationErrors["trangThai"] = "Hãy chọn trạng thái";
        }
        // Nếu có lỗi khác, không cần tiếp tục kiểm tra tên
        if (Object.keys(this.validationErrors).length > 0) {
          resolve(false);
        }
      });
    }
    // validate sản phẩm sửa
    validateSanPhamUpdate(): Promise<boolean> {
      return new Promise((resolve) => {
        this.validationErrors = {}; // Reset lỗi trước khi kiểm tra
    
        if (!this.sanPhamRequest.ten.trim()) {
          this.validationErrors["ten"] = "Tên sản phẩm không được để trống";
        } else if (this.sanPhamRequest.ten.length > 100) {
          this.validationErrors["ten"] = "Tên quá dài";
        }
    
        if (!this.sanPhamRequest.thuongHieu.id) {
          this.validationErrors["thuongHieu"] = "Hãy chọn thương hiệu";
        }
        if (!this.sanPhamRequest.xuatXu.id) {
          this.validationErrors["xuatXu"] = "Hãy chọn xuất xứ";
        }
        if (!this.sanPhamRequest.chatLieu.id) {
          this.validationErrors["chatLieu"] = "Hãy chọn chất liệu";
        }
        if (!this.sanPhamRequest.coAo.id) {
          this.validationErrors["coAo"] = "Hãy chọn cổ áo";
        }
        if (this.sanPhamRequest.trangThai === '') {
          this.validationErrors["trangThai"] = "Hãy chọn trạng thái";
        }
        // Nếu có lỗi khác, không cần tiếp tục kiểm tra tên
        if (Object.keys(this.validationErrors).length > 0) {
          resolve(false);
        } else {
          resolve(true); // Chấp nhận nếu không có lỗi
        }
      });
    }    

    // thêm sản phẩm
    addSanPham(): void {
      this.validateSanPham().then((isValid) => {
        if (!isValid) {
          let errorMessages = Object.values(this.validationErrors).join('\n');
          return; // Dừng lại nếu có lỗi
        }
        // Nếu không có lỗi, thực hiện thêm sản phẩm
        this.sanPhamRequest.ngayTao = new Date().toISOString().split('T')[0];
        this.sanPhamRequest.ngaySua = new Date().toISOString().split('T')[0]; 
        console.log("SanPham Request:", this.sanPhamRequest);
      
        this.sanphamService.addSanPham(this.sanPhamRequest).subscribe({
          next: (response) => {
            console.log("Thêm sản phẩm thành công:", response);
            alert("Thêm sản phẩm thành công");
            this.closeModalSanPham();
            this.listSanPham(); // Reload danh sách sản phẩm
          },
          error: (error) => {
            console.error("Lỗi khi thêm sản phẩm:", error);
          }
        });
      });
    }
    // update sản phẩm
    updateSanPham(): void {
      this.validateSanPhamUpdate().then((isValid) => {
        if (!isValid) {
          let errorMessages = Object.values(this.validationErrors).join('\n');
          return; 
        }
        this.sanPhamRequest.ngaySua = new Date().toISOString().split('T')[0]; // Ngày sửa hiện tại
        console.log("Update SanPham Request:", this.sanPhamRequest);
        
        this.sanphamService.updateSanPham(this.sanPhamRequest).subscribe({
          next: (response) => {
            console.log("Cập nhật sản phẩm thành công:", response);
            alert("Cập nhật sản phẩm thành công");
            this.closeModalSanPham();
            this.listSanPham(); // Reload danh sách sản phẩm
          },
          error: (error) => {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
          }
        });
      });
    }
    
    // validate sản phẩm  chi tiết
    validateSanPhamChiTiet(): Promise<boolean> {
      return new Promise((resolve) => {
        this.validationErrors = {}; // Reset lỗi trước khi kiểm tra
        let hasErrors = false; // Biến kiểm tra có lỗi không
    
        // Kiểm tra các lỗi cơ bản trước
        if (!this.sanPhamChiTietRequest.gia || this.sanPhamChiTietRequest.gia.toString().trim() === "") {
          this.validationErrors["gia"] = "Giá không được để trống";
          hasErrors = true;
        } else if (this.sanPhamChiTietRequest.gia < 1) {
          this.validationErrors["gia"] = "Giá phải lớn hơn 0";
          hasErrors = true;
        }
        
        if (this.sanPhamChiTietRequest.gia > 20000000) {
          this.validationErrors["gia"] = "Giá tối đa là 20,000,000";
          hasErrors = true;
        }
        
        if (!this.sanPhamChiTietRequest.soLuong || this.sanPhamChiTietRequest.soLuong.toString().trim() === "") {
          this.validationErrors["soLuong"] = "Số lượng không được để trống";
          hasErrors = true;
        } else if (this.sanPhamChiTietRequest.soLuong < 1) {
          this.validationErrors["soLuong"] = "Số lượng phải lớn hơn 0";
          hasErrors = true;
        }
        
        if (this.sanPhamChiTietRequest.trangThai === '') {
          this.validationErrors["trangThai"] = "Hãy chọn trạng thái";
          hasErrors = true;
        }
    
        // Kiểm tra lỗi chọn size/màu (ưu tiên kiểm tra trước)
        if (this.sanPhamChiTietRequest.id) { // Chỉ kiểm tra khi sửa
          if (!this.sanPhamChiTietRequest.sizes || this.sanPhamChiTietRequest.sizes.length === 0) {
            this.validationErrors["sizes"] = "Hãy chọn 1 size";
            hasErrors = true;
          } else if (this.sanPhamChiTietRequest.sizes.length > 1) {
            this.validationErrors["sizes"] = "Chỉ được chọn 1 size khi sửa";
            hasErrors = true;
          }
          
          if (!this.sanPhamChiTietRequest.mauSacs || this.sanPhamChiTietRequest.mauSacs.length === 0) {
            this.validationErrors["mauSacs"] = "Hãy chọn 1 màu sắc";
            hasErrors = true;
          } else if (this.sanPhamChiTietRequest.mauSacs.length > 1) {
            this.validationErrors["mauSacs"] = "Chỉ được chọn 1 màu khi sửa";
            hasErrors = true;
          }
        } else { 
          // Kiểm tra khi thêm mới
          if (!this.sanPhamChiTietRequest.sizes || this.sanPhamChiTietRequest.sizes.length === 0) {
            this.validationErrors["sizes"] = "Hãy chọn ít nhất một size";
            hasErrors = true;
          }
          if (!this.sanPhamChiTietRequest.mauSacs || this.sanPhamChiTietRequest.mauSacs.length === 0) {
            this.validationErrors["mauSacs"] = "Hãy chọn ít nhất một màu sắc";
            hasErrors = true;
          }
        }
    
        // Chỉ kiểm tra trùng nếu không có lỗi nào ở trên
        if (!hasErrors) {
          // Chỉ kiểm tra trùng nếu đang thêm mới hoặc nếu có thay đổi size/màu
          if (!this.sanPhamChiTietRequest.id || this.isSanPhamChiTietThayDoi()) {
            if (this.isSanPhamChiTietTrung()) {
              // Nếu đang sửa và đã chọn đúng 1 màu + 1 size thì mới hiển thị lỗi trùng
              if (!this.sanPhamChiTietRequest.id || 
                  (this.sanPhamChiTietRequest.sizes.length === 1 && 
                   this.sanPhamChiTietRequest.mauSacs.length === 1)) {
                this.validationErrors["sanPhamChiTiet"] = "Sản phẩm chi tiết với màu sắc và size này đã tồn tại.";
                hasErrors = true;
              }
            }
          }
        }
    
        resolve(!hasErrors); // Trả về true nếu không có lỗi
      });
    }   
    
    // check trùng màu size
    isSanPhamChiTietTrung(): boolean {
      if (!this.sanPhamChiTiets || this.sanPhamChiTiets.length === 0) {
        return false;
      }
      return this.sanPhamChiTiets.some((sp) => {
        const isMauTrung = this.sanPhamChiTietRequest.mauSacs?.some((m: { id: number }) => m.id === sp.idMauSac);
        const isSizeTrung = this.sanPhamChiTietRequest.sizes?.some((s: { id: number }) => s.id === sp.idSize);  
        return isMauTrung && isSizeTrung;
      });
    }

    // check nếu sửa màu và size mới bắt lỗi
    isSanPhamChiTietThayDoi(): boolean {
      if (!this.sanPhamChiTietRequest.id) return true; // Nếu đang thêm mới thì luôn kiểm tra trùng
      const sanPhamGoc = this.sanPhamChiTiets.find(sp => sp.id === this.sanPhamChiTietRequest.id);
      if (!sanPhamGoc) return true;
      const danhSachSizeGoc: number[] = sanPhamGoc.idSize ? [sanPhamGoc.idSize] : [];
      const danhSachMauGoc: number[] = sanPhamGoc.idMauSac ? [sanPhamGoc.idMauSac] : [];
      const danhSachSizeMoi: number[] = this.sanPhamChiTietRequest.sizes.map((s: { id: number }) => s.id);
      const danhSachMauMoi: number[] = this.sanPhamChiTietRequest.mauSacs.map((m: { id: number }) => m.id);
      // Kiểm tra xem có sự khác biệt giữa danh sách cũ và mới hay không
      const sizeThayDoi = danhSachSizeMoi.length !== danhSachSizeGoc.length || 
                          danhSachSizeMoi.some(size => !danhSachSizeGoc.includes(size));
      const mauThayDoi = danhSachMauMoi.length !== danhSachMauGoc.length || 
                         danhSachMauMoi.some(mau => !danhSachMauGoc.includes(mau));
      return sizeThayDoi || mauThayDoi;
    }      

    // thêm sản phẩm chi tiết
    addSanPhamChiTiet(): void {
      // console.log("Hàm addSanPhamChiTiet() được gọi");
      this.validateSanPhamChiTiet().then((isValid) => {
        // console.log("Kết quả validate:", isValid);
        if (!isValid) {
          // console.log("Validate thất bại", this.validationErrors);
          return;
        }
        this.sanPhamChiTietRequest.sizes = this.sanPhamChiTietRequest.sizes.map((size: any) => size.id || size);
        this.sanPhamChiTietRequest.mauSacs = this.sanPhamChiTietRequest.mauSacs.map((mau: any) => mau.id || mau);
    
        this.sanPhamChiTietRequest.ngayTao = new Date().toISOString().split('T')[0];
        this.sanPhamChiTietRequest.ngaySua = new Date().toISOString().split('T')[0];
    
        this.sanphamService.addSanPhamChiTiet(this.sanPhamChiTietRequest).subscribe({
          next: (response) => {
            // console.log("Thêm sản phẩm chi tiết thành công:", response);
            alert("Thêm sản phẩm chi tiết thành công");
            this.closeModalSanPhamChiTietThem();
            this.openModalSanPhamChiTiet(this.selectedProduct.id);
            this.loadData();
          },
          error: (error) => {
            console.error("Lỗi khi thêm sản phẩm chi tiết:", error);
          }
        });
      });
    }
    
    compareFn(o1: any, o2: any): boolean {
      return o1 && o2 ? o1.id === o2.id : o1 === o2;
    }    
          
    onSizeChange(event: any) {
      this.sanPhamChiTietRequest.sizes = event; // Lưu danh sách các size được chọn
      // console.log("Cập nhật sizes:", this.sanPhamChiTietRequest.sizes);
    }
    
    onMauSacChange(event: any) {
      this.sanPhamChiTietRequest.mauSacs = event; // Lưu danh sách các màu sắc được chọn
      // console.log("Cập nhật màu sắc:", this.sanPhamChiTietRequest.mauSacs);
    }  
    
  xuatFileExcel(): void {
    const xacNhan = window.confirm("Bạn có muốn xuất file Excel không?");
    if (!xacNhan) {
      return; // Người dùng nhấn Cancel -> không làm gì cả
    }
    this.sanphamService.exportExcel().subscribe(response => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Tạo workbook từ buffer nhận được
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        // Lấy sheet đầu tiên
        const worksheet = workbook.worksheets[0];
        // Định dạng tiêu đề (dòng đầu tiên)
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.font = { bold: true, color: { argb: '000000' } }; // Chữ đen
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9EAD3' } // Màu xanh nhạt (mã ARGB)
          };
        });
        // Thêm border cho toàn bộ bảng (bao gồm cả dữ liệu)
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
        // Xuất file Excel
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, 'sanpham.xlsx');
          alert("Xuất file thành công");
        });
      };
      reader.readAsArrayBuffer(response);
    }, error => {
      console.error("Lỗi khi tải file Excel:", error);
      alert("Xuất file thất bại");
    });
  }
    
  xuatFileExcelSanPhamChiTiet(idSanPham: number): void {
    const xacNhan = window.confirm("Bạn có muốn xuất file Excel không?");
    if (!xacNhan) {
      return; // Người dùng nhấn Cancel -> không làm gì cả
    }
    this.sanphamService.exportExcelSanPhamChiTiet(idSanPham).subscribe(response => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Tạo workbook từ buffer nhận được
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        // Lấy sheet đầu tiên
        const worksheet = workbook.worksheets[0];
        // Định dạng tiêu đề (dòng đầu tiên)
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.font = { bold: true, color: { argb: '000000' } }; // Chữ đen
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9EAD3' }
          };
        });
        // Thêm border cho toàn bộ bảng
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
        // Xuất file Excel
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, `sanphamchitiet${idSanPham}.xlsx`);
          alert("Xuất file thành công");
        });
      };
      reader.readAsArrayBuffer(response);
    }, error => {
      console.error("Lỗi khi tải file Excel:", error);
      alert("Xuất file thất bại");
    });
  }
  // sửa sản phẩm chi tiết
  updateSanPhamChiTiet(): void {
    this.validateSanPhamChiTiet().then((isValid) => {
      if (!isValid) {
        let errorMessages = Object.values(this.validationErrors).join('\n');
        return;
      }
      // Chuyển đổi ngày sửa về định dạng YYYY-MM-DD
      this.sanPhamChiTietRequest.ngaySua = new Date().toISOString().split('T')[0];
      // Định nghĩa kiểu dữ liệu cho size và mau
      interface Size {
        id: number;
      }
      interface Mau {
        id: number;
      }
      // Chỉ lấy ID của sizes và mauSacs
      const requestData = {
        ...this.sanPhamChiTietRequest,
        sizes: this.sanPhamChiTietRequest.sizes.map((size: Size) => size.id),
        mauSacs: this.sanPhamChiTietRequest.mauSacs.map((mau: Mau) => mau.id),
      };
      // console.log("Dữ liệu size sau khi chọn:", this.sanPhamChiTietRequest.sizes);
      // console.log("Dữ liệu màu sau khi chọn:", this.sanPhamChiTietRequest.mauSacs);
      // console.log("Cập nhật sản phẩm chi tiết request:", requestData);
      this.sanphamService.updateSanPhamChiTiet(requestData).subscribe({
        next: (response) => {
          console.log("Cập nhật sản phẩm chi tiết thành công:", response);
          alert("Cập nhật sản phẩm chi tiết thành công");
          // Cập nhật dữ liệu trên table mà không cần load lại trang
          this.listSanPhamChiTiet();
          this.openModalSanPhamChiTiet(this.selectedProduct.id);
          this.closeModalSanPhamChiTietThem();
        },
        error: (error) => {
          console.error("Lỗi khi cập nhật sản phẩm chi tiết:", error);
        }
      });
    });
  }
  // chon tuộc tính
    getSelectedRequest() {
      switch (this.selectedThuocTinh) {
        case 'thuongHieu': return this.thuongHieuRequest;
        case 'chatLieu': return this.chatLieuRequest;
        case 'coAo': return this.coAoRequest;
        case 'mauSac': return this.mauSacRequest;
        case 'size': return this.sizeRequest;
        case 'xuatXu': return this.xuatXuRequest;
        default: return {};
      }
    } 
    // validate thuộc tính
    validateThuocTinh(): Promise<boolean> {
      return new Promise((resolve) => {
        this.validationErrors = {}; // Reset lỗi trước khi kiểm tra
        const request = this.getSelectedRequest();
        // Kiểm tra tên không được để trống
        if (!request.ten || request.ten.trim() === '') {
          this.validationErrors["ten"] = 'Tên thuộc tính không được để trống';
        }
        // Kiểm tra trạng thái phải được chọn
        if (request.trangThai === undefined || request.trangThai === null || request.trangThai === '') {
          this.validationErrors["trangThai"] = 'Hãy chọn trạng thái';
        }
        // Kiểm tra riêng cho từng thuộc tính
        if (this.selectedThuocTinh === 'size') {
          const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
          if (!validSizes.includes(request.ten.toUpperCase())) {
            this.validationErrors["ten"] = 'Size chỉ được nhập XS, S, M, L, XL, XXL, XXXL';
          }
        }
        // Kiểm tra tên có bị trùng không (gọi API để kiểm tra)
        this.sanphamService.checkTenExists(request.ten, this.selectedThuocTinh).subscribe((exists: boolean) => {
          if (exists) {
            this.validationErrors["ten"] = 'Tên thuộc tính đã tồn tại';
          }
          // Trả về kết quả kiểm tra
          resolve(Object.keys(this.validationErrors).length === 0);
        });
      });
    }
    // thêm thuộc tính
    addThuocTinh() {
      this.validateThuocTinh().then((isValid) => {
        if (!isValid) {
          let errorMessages = Object.values(this.validationErrors).join('\n');
          return; // Dừng lại nếu có lỗi
        }
        const ngayTao = new Date().toISOString().split('T')[0];
        const ngaySua = ngayTao;
        let request;
        let apiCall;
        switch (this.selectedThuocTinh) {
          case 'thuongHieu':
            this.thuongHieuRequest.ngayTao = ngayTao;
            this.thuongHieuRequest.ngaySua = ngaySua;
            request = this.thuongHieuRequest;
            apiCall = this.sanphamService.addThuongHieu(request);
            break;
    
          case 'chatLieu':
            this.chatLieuRequest.ngayTao = ngayTao;
            this.chatLieuRequest.ngaySua = ngaySua;
            request = this.chatLieuRequest;
            apiCall = this.sanphamService.addChatLieu(request);
            break;
    
          case 'coAo':
            this.coAoRequest.ngayTao = ngayTao;
            this.coAoRequest.ngaySua = ngaySua;
            request = this.coAoRequest;
            apiCall = this.sanphamService.addCoAo(request);
            break;
    
          case 'mauSac':
            this.mauSacRequest.ngayTao = ngayTao;
            this.mauSacRequest.ngaySua = ngaySua;
            request = this.mauSacRequest;
            apiCall = this.sanphamService.addMauSac(request);
            break;
    
          case 'size':
            this.sizeRequest.ngayTao = ngayTao;
            this.sizeRequest.ngaySua = ngaySua;
            request = this.sizeRequest;
            apiCall = this.sanphamService.addSize(request);
            break;
    
          case 'xuatXu':
            this.xuatXuRequest.ngayTao = ngayTao;
            this.xuatXuRequest.ngaySua = ngaySua;
            request = this.xuatXuRequest;
            apiCall = this.sanphamService.addXuatXu(request);
            break;
    
          default:
            alert('Vui lòng chọn thuộc tính cần thêm!');
            return;
        }
    
        apiCall.subscribe(response => {
          alert('Thêm thành công!');
          this.loadData(); // Load lại danh sách
          this.resetForm();
        }, error => {
          alert('Thêm thất bại! Vui lòng thử lại.');
        });
      });
    } 
    // load lại input khi thêm xong thuộc tính
    resetForm() {
      switch (this.selectedThuocTinh) {
        case 'thuongHieu':
          this.thuongHieuRequest = { ten: '', trangThai: 1 };
          break;
        case 'chatLieu':
          this.chatLieuRequest = { ten: '', trangThai: 1 };
          break;
        case 'coAo':
          this.coAoRequest = { ten: '', trangThai: 1 };
          break;
        case 'mauSac':
          this.mauSacRequest = { ten: '', trangThai: 1 };
          break;
        case 'size':
          this.sizeRequest = { ten: '', trangThai: 1 };
          break;
        case 'xuatXu':
          this.xuatXuRequest = { ten: '', trangThai: 1 };
          break;
      }
    }
    getSelectedList() {
      switch (this.selectedThuocTinh) {
        case 'thuongHieu': return this.thuongHieus;
        case 'chatLieu': return this.chatLieus;
        case 'coAo': return this.coAos;
        case 'mauSac': return this.mauSacs;
        case 'size': return this.sizes;
        case 'xuatXu': return this.xuatXus;
        default: return [];
      }
    }

    loadSelectedList() {
      switch (this.selectedThuocTinh) {
        case 'thuongHieu': this.listThuongHieu(); break;
        case 'chatLieu': this.listChatLieu(); break;
        case 'coAo': this.listCoAo(); break;
        case 'mauSac': this.listMauSac(); break;
        case 'size': this.listSize(); break;
        case 'xuatXu': this.listXuatXu(); break;
      }
    }
    

    confirmToggleTrangThai(item: any) {
      const newTrangThai = item.trangThai === 1 ? 0 : 1;
      const message = item.trangThai === 1
        ? 'Bạn chắc chắn muốn đổi trạng thái sang *Không hoạt động*?'
        : 'Bạn chắc chắn muốn đổi trạng thái sang *Hoạt động*?';
    
      if (!confirm(message)) {
        return; // người dùng không đồng ý => thoát
      }
    
      const request = {
        id: item.id,
        trangThai: newTrangThai,
      };
    
      let apiCall;
    
      switch (this.selectedThuocTinh) {
        case 'thuongHieu':
          apiCall = this.sanphamService.updateTrangThaiThuongHieu(request);
          break;
        case 'chatLieu':
          apiCall = this.sanphamService.updateTrangThaiChatLieu(request);
          break;
        case 'coAo':
          apiCall = this.sanphamService.updateTrangThaiCoAo(request);
          break;
        case 'mauSac':
          apiCall = this.sanphamService.updateTrangThaiMauSac(request);
          break;
        case 'size':
          apiCall = this.sanphamService.updateTrangThaiSize(request);
          break;
        case 'xuatXu':
          apiCall = this.sanphamService.updateTrangThaiXuatXu(request);
          break;
        default:
          console.error("Thuộc tính không hợp lệ");
          return;
      }
    
      apiCall.subscribe(
        () => {
          item.trangThai = newTrangThai;
          this.loadData();
          alert("Cập nhật trạng thái thành công!");
        },
        error => {
          console.error("Lỗi khi cập nhật trạng thái", error);
          alert("Lỗi khi cập nhật trạng thái!");
        }
      );
    }

    listSizeStatus() {
      this.sanphamService.getSize().subscribe(data => {
        this.sizes = data;
        this.activeSizes = this.sizes.filter(s => s.trangThai === 1);
      });
    }
    
    listMauSacStatus() {
      this.sanphamService.getMauSac().subscribe(data => {
        this.mauSacs = data;
        this.activeMauSacs = this.mauSacs.filter(m => m.trangThai === 1);
      });
    }
}
