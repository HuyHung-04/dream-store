import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SanphamService {
  // đường dẫn api
  private apiUrl = 'http://localhost:8080/api'; // URL backend

  constructor(private http: HttpClient) {}
  // Lấy danh sách sản phẩm từ backend
  // hàm sản phẩm
  getSanPham(page: number, size: number): Observable<ApiResponseSanPham> {
    return this.http.get<ApiResponseSanPham>(`${this.apiUrl}/san-pham/hien-thi?page=${page}&size=${size}`);
  }  

  searchSanPham(thuongHieuId: number, xuatXuId: number, chatLieuId: number, coAoId: number, trangThai: any, ten: string, page: number, size: number) {
    let params: any = { page, size };
    if (thuongHieuId) params.thuongHieuId = thuongHieuId;
    if (xuatXuId) params.xuatXuId = xuatXuId;
    if (chatLieuId) params.chatLieuId = chatLieuId;
    if (coAoId) params.coAoId = coAoId;
    if (trangThai != null && trangThai !== '') params.trangThai = trangThai;
    if (ten && ten.trim() !== '') params.ten = ten;  // Thêm tìm kiếm theo tên
  
    return this.http.get<any>(this.apiUrl + '/san-pham/tim-kiem', { params });
  }

  getSanPhamChiTiet(idSanPham: number, page: number, size: number): Observable<ApiResponseSanPhamChiTiet> {
    return this.http.get<ApiResponseSanPhamChiTiet>(
      `${this.apiUrl}/san-pham-chi-tiet/hien-thi?idSanPham=${idSanPham}&page=${page}&size=${size}`
    );
  }

  searchSanPhamChiTiet(idSanPham: number, gia?: number, soLuong?: number, idSize?: number, idMauSac?: number, trangThai?: number, page: number = 0, size: number = 5) {
    let params: any = { idSanPham, page, size };
    if (gia !== undefined) params.gia = gia;
    if (soLuong !== undefined) params.soLuong = soLuong;
    if (idSize !== undefined) params.idSize = idSize;
    if (idMauSac !== undefined) params.idMauSac = idMauSac;
    if (trangThai !== undefined) params.trangThai = trangThai;
    return this.http.get<any>(this.apiUrl + '/san-pham-chi-tiet/tim-kiem', { params });
  }

  checkTenExists(ten: string, loai: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/size/check-ten-exists?ten=${ten}&loai=${loai}`);
  }

  existsTenSanPham(ten: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/san-pham/exists-by-ten`, { params: { ten } });
  }
  
  getThuongHieu(): Observable<ThuongHieu[]> {
    return this.http.get<ThuongHieu[]>(this.apiUrl + '/thuong-hieu/hien-thi').pipe();
  }
  
  getChatLieu(): Observable<ChatLieu[]> {
    return this.http.get<ChatLieu[]>(this.apiUrl + '/chat-lieu/hien-thi').pipe();
  }
  
  getCoAo(): Observable<CoAo[]> {
    return this.http.get<CoAo[]>(this.apiUrl + '/co-ao/hien-thi').pipe();
  }
  
  getSize(): Observable<Size[]> {
    return this.http.get<Size[]>(this.apiUrl + '/size/hien-thi').pipe();
  }

  getMauSac(): Observable<MauSac[]> {
    return this.http.get<MauSac[]>(this.apiUrl + '/mau-sac/hien-thi').pipe();
  }

  getXuatXu(): Observable<XuatXu[]> {
    return this.http.get<XuatXu[]>(this.apiUrl + '/xuat-xu/hien-thi').pipe();
  }

  addSanPham(sanPhamRequest: any): Observable<any> {
    return this.http.post(this.apiUrl + '/san-pham/add', sanPhamRequest);
  }

  updateSanPham(sanPhamRequest: any): Observable<any> {
    return this.http.put(this.apiUrl + '/san-pham/update', sanPhamRequest);
  }

  addSanPhamChiTiet(sanPhamChiTietRequest: any): Observable<any> {
    return this.http.post(this.apiUrl + '/san-pham-chi-tiet/add', sanPhamChiTietRequest);
  }

  updateSanPhamChiTiet(sanPhamChiTietRequest: any): Observable<any> {
    return this.http.put(this.apiUrl + '/san-pham-chi-tiet/update', sanPhamChiTietRequest);
  }  

  exportExcel(): Observable<Blob> {
    return this.http.get(this.apiUrl + '/san-pham/xuat-excel', { responseType: 'blob' });
  }

  exportExcelSanPhamChiTiet(idSanPham: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/san-pham-chi-tiet/xuat-excel?idSanPham=${idSanPham}`, {
      responseType: 'blob'
    });
  }

  addThuongHieu(thuongHieu: ThuongHieu): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/thuong-hieu/add', thuongHieu);
  }
  
  addChatLieu(chatLieu: ChatLieu): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/chat-lieu/add', chatLieu);
  }
  
  addXuatXu(xuatXu: XuatXu): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/xuat-xu/add', xuatXu);
  }
  
  addCoAo(coAo: CoAo): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/co-ao/add', coAo);
  }
  
  addSize(size: Size): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/size/add', size);
  }
  
  addMauSac(mauSac: MauSac): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/mau-sac/add', mauSac);
  }

  getAllAnh(idSanPham: number): Observable<Anh[]> {
    return this.http.get<Anh[]>(`${this.apiUrl}/anh/hien-thi?idSanPham=${idSanPham}`);
  }  
  
  uploadAnh(idSanPham: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('anhUrl', file));
    formData.append('idSanPham', idSanPham.toString());
  
    return this.http.post(`${this.apiUrl}/anh/add`, formData);
  }
  
  xoaAnh(idAnh: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/anh/delete/${idAnh}`);
  }
  
  searchSanPhamKhuyenMai(ten: string) {
    const params: any = {};  // Không có phân trang
    if (ten && ten.trim() !== '') {
      params.ten = ten;  // Chỉ gửi tên
    }
    return this.http.get<any>(this.apiUrl + '/san-pham/tim-kiem', { params });
  }
  
  
  
}
export interface SanPham {
  id: number;
  ma: string;
  ten: string;
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
  idChatLieu: number;
  tenChatLieu: string;
  idThuongHieu: number;
  tenThuongHieu: string;
  idCoAo: number;
  tenCoAo: string;
  idXuatXu: number;
  tenXuatXu: string;
}


export interface ApiResponseSanPham {
  content: SanPham[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
// Interface cho SanPhamChiTiet
export interface SanPhamChiTiet {
  id: number;
  ma: string;
  gia: number;
  soLuong: number;
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
  idSanPham: number;
  tenSanPham: string;
  idSize: number;
  tenSize: string;
  idMauSac: number;
  tenMauSac: string;
  tenKhuyenMai: string;
  giaSauGiam: number;
}

// Interface cho ApiResponse của SanPhamChiTiet
export interface ApiResponseSanPhamChiTiet {
  content: SanPhamChiTiet[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// thuộc tính
export interface ThuongHieu {
  id: number;
  ma: string;
  ten: string;
}

export interface ChatLieu {
  id: number;
  ma: string;
  ten: string;
}

export interface CoAo {
  id: number;
  ma: string;
  ten: string;
}

export interface XuatXu {
  id: number;
  ma: string;
  ten: string;
}

export interface Size {
  id: number;
  ma: string;
  ten: string;
}

export interface MauSac {
  id: number;
  ma: string;
  ten: string;
}

export interface Anh {
  id: number;
  anhUrl: string;
  idSanPham: number;
}

export interface ApiResponse<T> {
  content: T[];
}



