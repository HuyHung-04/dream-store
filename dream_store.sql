CREATE DATABASE dream_store
GO
USE dream_store
GO

CREATE TABLE mau_sac (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO 

CREATE TABLE size (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

CREATE TABLE thuong_hieu (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE xuat_xu (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE chat_lieu (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE co_ao (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE san_pham (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_thuong_hieu INT,
	id_xuat_xu INT,
	id_chat_lieu INT,
	id_co_ao INT,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	FOREIGN KEY (id_thuong_hieu) REFERENCES thuong_hieu(id),
	FOREIGN KEY (id_xuat_xu) REFERENCES xuat_xu(id),
	FOREIGN KEY (id_chat_lieu) REFERENCES chat_lieu(id),
	FOREIGN KEY (id_co_ao) REFERENCES co_ao(id)
)

GO

CREATE TABLE anh (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_san_pham INT,
	anh_url NVARCHAR(255) DEFAULT'',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	FOREIGN KEY (id_san_pham) REFERENCES san_pham(id)
)
GO

CREATE TABLE khuyen_mai (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	gia_tri_giam FLOAT DEFAULT '',
	ngay_bat_dau DATETIME,
	ngay_ket_thuc DATETIME,
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

GO
CREATE TABLE san_pham_chi_tiet (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_san_pham INT,
	id_khuyen_mai INT,
	id_mau_sac INT,
	id_size INT,
	ma VARCHAR(10) NOT NULL,
	gia FLOAT DEFAULT '',
	so_luong INT DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
	FOREIGN KEY (id_khuyen_mai) REFERENCES khuyen_mai(id),
	FOREIGN KEY (id_mau_sac) REFERENCES mau_sac(id),
	FOREIGN KEY (id_size) REFERENCES size(id)
)

GO 


CREATE TABLE voucher (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	so_luong INT,
	hinh_thuc_giam BIT DEFAULT 1,
	gia_tri_giam FLOAT DEFAULT '',
	don_toi_thieu FLOAT DEFAULT '',
	giam_toi_da FLOAT DEFAULT '',
	ngay_bat_dau DATETIME,
	ngay_ket_thuc DATETIME,
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
)

CREATE TABLE vai_tro (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ten NVARCHAR(250) DEFAULT '',
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE nhan_vien (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_vai_tro INT,
	ma VARCHAR(10) NOT NULL,
	ten NVARCHAR(30) DEFAULT '',
	gioi_tinh BIT DEFAULT 1,
	ngay_sinh DATE,
	email NVARCHAR(50),
	so_dien_thoai VARCHAR(15),
	tai_khoan VARCHAR(30),
	mat_khau VARCHAR(100),
	anh VARCHAR(50),
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
	FOREIGN KEY (id_vai_tro) REFERENCES vai_tro(id)
)

GO

CREATE TABLE khach_hang(
	id INT IDENTITY(1,1) PRIMARY KEY,
	ma AS ('KH' + RIGHT('0000' + CAST(ID AS VARCHAR(4)), 4)) PERSISTED,
	ten NVARCHAR(30) DEFAULT '',
	gioi_tinh BIT DEFAULT 1,
	email VARCHAR(255),
	so_dien_thoai VARCHAR(15),
	mat_khau VARCHAR(30),
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	otp_hash TEXT NULL,
	trang_thai_otp INT NULL
)

GO

CREATE TABLE dia_chi_khach_hang (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_khach_hang INT,
	ten_nguoi_nhan NVARCHAR(50) DEFAULT '',
	sdt_nguoi_nhan VARCHAR(15) DEFAULT'',
	dia_chi_cu_the VARCHAR(20) DEFAULT '',
	phuong_xa NVARCHAR(20) DEFAULT '',
	quan_huyen NVARCHAR(20) DEFAULT '',
	tinh_thanh_pho NVARCHAR(20) DEFAULT'',
	mo_ta NVARCHAR(255) DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1
	FOREIGN KEY (id_khach_hang) REFERENCES khach_hang(id)
)

GO

CREATE TABLE gio_hang_chi_tiet (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_khach_hang INT,
	id_san_pham_chi_tiet INT,
	so_luong INT DEFAULT '',
	don_gia FLOAT DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	FOREIGN KEY (id_khach_hang) REFERENCES khach_hang(id),
	FOREIGN KEY (id_san_pham_chi_tiet) REFERENCES san_pham_chi_tiet(id)
)

GO

CREATE TABLE phuong_thuc_thanh_toan (
	id INT IDENTITY(1,1) PRIMARY KEY,
	ten NVARCHAR(30),
	trang_thai INT DEFAULT 1
)

GO

CREATE TABLE hoa_don (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_khach_hang INT,
	id_nhan_vien INT,
	id_voucher INT,
	id_phuong_thuc_thanh_toan INT,
	ma VARCHAR(50) NOT NULL,
	ten_nguoi_nhan NVARCHAR(50) DEFAULT '',
	sdt_nguoi_nhan VARCHAR(15) DEFAULT'',
	dia_chi_nhan_hang NVARCHAR(255) DEFAULT'',
	phi_van_chuyen FLOAT DEFAULT'',
	tong_tien_truoc_voucher FLOAT DEFAULT'',
	tong_tien_thanh_toan FLOAT DEFAULT'',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	ghi_chu NVARCHAR(255),
	FOREIGN KEY (id_khach_hang) REFERENCES khach_hang(id),
	FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id),
	FOREIGN KEY (id_voucher) REFERENCES voucher(id),
	FOREIGN KEY (id_phuong_thuc_thanh_toan) REFERENCES phuong_thuc_thanh_toan(id)
)

GO

CREATE TABLE hoa_don_chi_tiet (
	id INT IDENTITY(1,1) PRIMARY KEY,
	id_hoa_don INT,
	id_san_pham_chi_tiet INT,
	ma VARCHAR(50) NOT NULL,
	so_luong INT DEFAULT '',
	don_gia FLOAT DEFAULT '',
	ngay_sua DATETIME,
	ngay_tao DATETIME,
	trang_thai INT DEFAULT 1,
	FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id),
	FOREIGN KEY (id_san_pham_chi_tiet) REFERENCES san_pham_chi_tiet(id)
)


