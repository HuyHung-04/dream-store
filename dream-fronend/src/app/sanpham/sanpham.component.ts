import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanphamService } from './sanpham.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sanpham',
  standalone: true,
  imports: [CommonModule ,FormsModule],
  templateUrl: './sanpham.component.html',
  styleUrls: ['./sanpham.component.css']
})
export class SanphamComponent implements OnInit {
  newSanPham: any = {};
  sanPhams: any[] = [];
  sanPhamChiTiets: any[] = [];
  thuongHieus: any[] = [];
  chatLieus: any[] = [];
  coAos: any[] = [];
  xuatXus: any[] = [];
  sizes: any[] = [];
  mauSacs: any[] = [];
  showModal: boolean = false;
  showModalSanPhamChiTiet: boolean = false;
  showModalThuocTinh: boolean = false;
  validationErrors: { [key: string]: string } = {};

  sanPhamChiTietRequest: any = {
    id: '',              
    ma: '',             
    gia: '',            
    soLuong: '',         
    sanPham: {          
      id: '',         
      ten: ''          
    },
    size: {            
      id: ''           
    },
    mauSac: {            
      id: ''           
    },
    trangThai: 1,        
    ngayTao: '',         
    ngaySua: ''          
  };
  showModalSanPhamChiTietThem: boolean = false;   // Trạng thái để kiểm tra modal hiển thị hay không

  searchFilter: any = {
    thuongHieu: { id: '' },
    xuatXu: { id: '' },
    chatLieu: { id: '' },
    coAo: { id: '' },
    trangThai: ''
  };

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

  editSanPham(sanPham: any): void {
    this.sanPhamRequest = { 
      id: sanPham.id, // Thêm ID vào đây
      ma: sanPham.ma,
      ten: sanPham.ten,
      thuongHieu: { id: sanPham.idThuongHieu },
      xuatXu: { id: sanPham.idXuatXu },
      chatLieu: { id: sanPham.idChatLieu },
      coAo: { id: sanPham.idCoAo },
      trangThai: sanPham.trangThai,
      ngayTao: sanPham.ngayTao,
      ngaySua: new Date().toISOString().split('T')[0], // Ngày sửa là ngày hiện tại
    };
    this.showModal = true; // Mở modal
}

editSanPhamChiTiet(sanPhamChiTiet: any): void {
  console.log("Dữ liệu đầu vào sanPhamChiTiet:", sanPhamChiTiet); // Log để kiểm tra dữ liệu đầu vào

  this.sanPhamChiTietRequest = { 
    id: sanPhamChiTiet.id,
    ma: sanPhamChiTiet.ma,
    gia: sanPhamChiTiet.gia,
    soLuong: sanPhamChiTiet.soLuong,

    // Gán đúng dữ liệu sản phẩm
    sanPham: {
      id: sanPhamChiTiet.idSanPham || '', 
      ten: sanPhamChiTiet.tenSanPham || ''
    },

    // Gán đúng dữ liệu size
    size: {
      id: sanPhamChiTiet.idSize || '', 
      ten: sanPhamChiTiet.tenSize || ''
    },

    // Gán đúng dữ liệu màu sắc
    mauSac: {
      id: sanPhamChiTiet.idMauSac || '', 
      ten: sanPhamChiTiet.tenMauSac || ''
    },

    trangThai: sanPhamChiTiet.trangThai ?? 1, // Nếu `trangThai` bị `null` hoặc `undefined`, gán mặc định là 1
    ngayTao: sanPhamChiTiet.ngayTao || '',
    ngaySua: new Date().toISOString().split('T')[0], // Cập nhật ngày sửa
  };

  console.log("Dữ liệu sản phẩm chi tiết khi sửa:", this.sanPhamChiTietRequest); // Kiểm tra dữ liệu sau khi gán

  this.showModalSanPhamChiTietThem = true; // Mở modal sửa
  }

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

  constructor(private sanphamService: SanphamService) {}

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
  }

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

  
  currentSanPhamId: number = 0; // ID sản phẩm đang xem chi tiết
  currentPage: number = 0; // Trang hiện tại
  pageSize: number = 5; // Số sản phẩm chi tiết mỗi trang
  totalPages: number = 0; // Tổng số trang

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.listSanPhamChiTiet(); // Gọi lại API để lấy dữ liệu mới
    }
  }   
  
  listSanPhamChiTiet(): void {
    if (!this.currentSanPhamId) {
      console.warn("Không có sản phẩm nào được chọn để hiển thị chi tiết.");
      return;
    }
  
    this.sanphamService.getSanPhamChiTiet(this.currentSanPhamId, this.currentPage, this.pageSize)
      .subscribe(dataSanPhamChiTiet => {
        console.log("Dữ liệu sản phẩm chi tiết:", dataSanPhamChiTiet);
        this.sanPhamChiTiets = dataSanPhamChiTiet.content || [];
        this.totalPages = dataSanPhamChiTiet.totalPages;
      });
  }

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
  // Hàm mở modal sản phẩm
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

  openModalSanPhamChiTietThem(): void {
    this.sanPhamChiTietRequest = {
      ma: '',
      gia: '',
      soLuong: '',
      sanPham: {
        id: '',
        ten: ''
      },
      size: {
        id: ''
      },
      mauSac: {
        id: ''
      },
      trangThai: '',
      ngayTao: new Date().toISOString().split('T')[0], // Ngày tạo là hôm nay
      ngaySua: ''
    };
  
    // Gán tên sản phẩm từ sản phẩm đã chọn
    if (this.selectedProduct) {
      this.sanPhamChiTietRequest.sanPham.id = this.selectedProduct.id;
      this.sanPhamChiTietRequest.sanPham.ten = this.selectedProduct.ten;
    }
    this.showModalSanPhamChiTietThem = true;
  }
  
  

  closeModalSanPhamChiTietThem(){
    this.showModalSanPhamChiTietThem = false;
  }

  // Hàm đóng modal sản phẩm
  closeModalSanPham() {
    this.showModal = false;
    this.validationErrors = {}; 
  }

  // Hàm mở modal sản phẩm chi tiết
  openModalSanPhamChiTiet(idSanPham: number, page: number = 0, size: number = 5): void {
    this.sanPhamChiTiets = [];
    this.currentSanPhamId = idSanPham;
    
    // Gán selectedProduct
    this.selectedProduct = this.sanPhams.find(sp => sp.id === idSanPham);
    
    console.log("Selected Product:", this.selectedProduct); // Kiểm tra xem sản phẩm có được gán hay không
    
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
  
  
      // thuộc tính
      openModalThuocTinh(){
        this.showModalThuocTinh = true;
      }
  
      closeModalThuocTinh(){
        this.showModalThuocTinh = false;
        this.validationErrors = {}; 
      }
  
  selectedProduct: any = {};
    
    // Hàm đóng modal sản phẩm chi tiết
    closeModalSanPhamChiTiet() {
      this.showModalSanPhamChiTiet = false;
    }

   // Sửa validateSanPham để trả về Promise
    validateSanPham(): Promise<boolean> {
      return new Promise((resolve) => {
        this.validationErrors = {}; // Reset lỗi trước khi kiểm tra

        if (!this.sanPhamRequest.ten.trim()) {
          this.validationErrors["ten"] = "Tên sản phẩm không được để trống";
          resolve(false);
        } else if (this.sanPhamRequest.ten.length > 100) {
          this.validationErrors["ten"] = "Tên quá dài";
          resolve(false);
        } else {
          // Kiểm tra trùng tên bằng API
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

    // Sửa addSanPham để chờ validateSanPham
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

    // sửa sản phẩm
    updateSanPham(): void {
      if (!this.validateSanPham()) {
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
          alert("Cập nhật sản phẩm thất bại");
        }
      });
    }

    addSanPhamChiTiet(): void {
      this.sanPhamChiTietRequest.ngayTao = new Date().toISOString().split('T')[0];
      this.sanPhamChiTietRequest.ngaySua = new Date().toISOString().split('T')[0];
    
      console.log("Sản phẩm chi tiết request:", this.sanPhamChiTietRequest); // Kiểm tra log
    
      this.sanphamService.addSanPhamChiTiet(this.sanPhamChiTietRequest).subscribe({
        next: (response) => {
          console.log("Thêm sản phẩm chi tiết thành công:", response);
          alert("Thêm sản phẩm chi tiết thành công");
          this.closeModalSanPhamChiTietThem();
          this.openModalSanPhamChiTiet(this.selectedProduct.id);
        },
        error: (error) => {
          console.error("Lỗi khi thêm sản phẩm chi tiết:", error);
          alert("Thêm sản phẩm chi tiết thất bại");
        }
      });
    }
    

    xuatFileExcel(): void {
      this.sanphamService.exportExcel().subscribe(response => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sanpham.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Xuất file thành công");
      }, error => {
        console.error("Lỗi khi xuất file Excel:", error);
        alert("Xuất file thất bại");
      });
    }

    xuatFileExcelSanPhamChiTiet(idSanPham: number): void {
      this.sanphamService.exportExcelSanPhamChiTiet(idSanPham).subscribe(response => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sanphamchitiet${idSanPham}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Xuất file thành công");
      }, error => {
        console.error("Lỗi khi xuất file Excel:", error);
        alert("Xuất file thất bại");
      });
    }
    
    
    updateSanPhamChiTiet() {
      if (!this.sanPhamChiTietRequest.id) {
        alert("Không tìm thấy sản phẩm chi tiết cần cập nhật!");
        return;
      }
    
      this.sanphamService.updateSanPhamChiTiet(this.sanPhamChiTietRequest).subscribe({
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
          alert("Cập nhật sản phẩm chi tiết thất bại");
        }
      });
    }

    
    validateThuocTinh(): boolean {
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
      });
    
      return Object.keys(this.validationErrors).length === 0;
    }
    

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

    addThuocTinh() {
      if (!this.validateThuocTinh()) {
        return;
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
        this.showModalThuocTinh = false; // Đóng modal sau khi thêm
      }, error => {
        alert('Thêm thất bại! Vui lòng thử lại.');
      });
    }
    
    
}
