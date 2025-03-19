import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { ThongKeService, ThongKeResponse, ThongKeThangResponse, ThongKeThangNayResponse ,
  ThongKeHomNayResponse, TopSanPhamResponse} from './thongke.service';

@Component({
  selector: 'app-thongke',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './thongke.component.html',
  styleUrls: ['./thongke.component.css'],
})
export class ThongkeComponent implements OnInit {
  thongKeData: ThongKeResponse | null = null;
  selectedType: string = 'Năm nay';
  chart: any;
  pieChart: any;
  topSanPhamData: TopSanPhamResponse[] = [];
  page: number = 0;
  size: number = 3;

  constructor(private thongKeService: ThongKeService) {}

  ngOnInit(): void {
    this.loadThongKe(this.selectedType);
    this.loadTopSanPhamNamNay();
  }

  loadThongKe(type: string): void {
    this.selectedType = type;
    this.thongKeData = null;
    
    // Xóa biểu đồ cũ trước khi tải dữ liệu mới
    this.destroyChart();
  
    this.thongKeService.thongKeTongQuan(type).subscribe(
      (data) => {
        this.thongKeData = data || { soHoaDon: 0, tongDoanhThu: 0, soKhachHang: 0 };
  
        // Hiển thị biểu đồ phù hợp với loại thống kê
        if (type === 'Tất cả') {
          this.loadBieuDoNam();
        } else if (type === 'Năm nay') {
          this.loadBieuDoThang();
        } else if (type === 'Tháng này') {
          this.loadBieuDoNgayTrongThang();
        } else {
          this.loadBieuDoHomNay();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu tổng quan:', error);
        this.thongKeData = { soHoaDon: 0, tongDoanhThu: 0, soKhachHang: 0 };
      }
    );
  }
  
// Biểu đồ doanh thu từng ngày trong tháng
loadBieuDoNgayTrongThang(): void {
  // Kiểm tra nếu đang ở chế độ "Hôm nay" thì không vẽ biểu đồ tháng
  if (this.selectedType === 'Hôm nay') {
    console.log('Đang ở chế độ Hôm nay, không hiển thị dữ liệu tháng.');
    this.destroyChart();
    return;
  }

  this.thongKeService.thongKeTungNgayTrongThang().subscribe(
    (data: ThongKeThangNayResponse[]) => {
      if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
        console.log('Không có dữ liệu doanh thu theo ngày trong tháng.');
        this.destroyChart();
        return;
      }
      const labels = data.map((item) => `Ngày ${item.ngay}`);
      const values = data.map((item) => item.tongDoanhThu);

      this.renderChart(labels, values, 'Doanh thu từng ngày trong tháng');
    },
    (error) => {
      console.error('Lỗi khi lấy dữ liệu doanh thu ngày trong tháng:', error);
    }
  );
}

// Biểu đồ doanh thu hôm nay
loadBieuDoHomNay(): void {
  this.thongKeService.thongKeHomNay().subscribe(
    (data: ThongKeHomNayResponse) => {
      // Kiểm tra nếu dữ liệu rỗng hoặc doanh thu là 0 thì ẩn biểu đồ
      if (!data || data.tongDoanhThu === 0) {
        console.log('Không có doanh thu hôm nay, xóa biểu đồ.');
        this.destroyChart();
        return;
      }

      const labels = ['Ngày hôm nay'];
      const values = [data.tongDoanhThu];

      this.renderChart(labels, values, 'Doanh thu hôm nay');
    },
    (error) => {
      console.error('Lỗi khi lấy dữ liệu doanh thu hôm nay:', error);
    }
  );
}


// Biểu đồ doanh thu từng tháng
loadBieuDoThang(): void {
  this.thongKeService.thongKeTungThangNam().subscribe(
    (data: ThongKeThangResponse[]) => {
      if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
        console.log('Không có dữ liệu doanh thu theo tháng.');
        this.destroyChart();
        return;
      }
      const labels: string[] = [];
      const values: number[] = new Array(12).fill(0); // Mặc định 12 tháng có giá trị 0

      data.forEach((item) => {
        values[item.thang - 1] = item.tongDoanhThu; // Gán doanh thu vào đúng tháng
      });

      for (let i = 1; i <= 12; i++) {
        labels.push(`Tháng ${i}`);
      }

      this.renderChart(labels, values, 'Doanh thu từng tháng');
    },
    (error) => {
      console.error('Lỗi khi lấy dữ liệu từng tháng:', error);
    }
  );
}

// Biểu đồ doanh thu theo năm
loadBieuDoNam(): void {
  this.thongKeService.thongKeTungNam().subscribe(
    (data: ThongKeThangResponse[]) => {
      if (!data || data.length === 0 || !data.some(item => item.tongDoanhThu > 0)) {
        console.log('Không có dữ liệu doanh thu theo năm.');
        this.destroyChart();
        return;
      }

      const labels = data.map((item) => `Năm ${item.thang}`);
      const values = data.map((item) => item.tongDoanhThu);

      this.renderChart(labels, values, 'Doanh thu từng năm');
    },
    (error) => {
      console.error('Lỗi khi lấy dữ liệu từng năm:', error);
    }
  );
}

  // Vẽ biểu đồ cột
renderChart(labels: string[], data: number[], label: string): void {
  this.destroyChart();

  // Kiểm tra nếu tất cả giá trị trong `data` đều là 0 thì không vẽ biểu đồ
  if (!data.some(value => value > 0)) {
    console.log('Không có dữ liệu hợp lệ để hiển thị biểu đồ.');
    return;
  }

  const ctx = document.getElementById('chart') as HTMLCanvasElement;
  if (!ctx) {
    console.warn('Không tìm thấy phần tử canvas cho biểu đồ.');
    return;
  }

  this.chart = new Chart(ctx, {
    type: 'bar', // Biểu đồ cột
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // Màu xanh dương
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true, // Luôn bắt đầu từ 0
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

  // Xóa biểu đồ cũ trước khi vẽ mới
  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
   // Tải danh sách top sản phẩm bán chạy hôm nay
   loadTopSanPhamHomNay(): void {
    this.thongKeService.topSanPhamHomNay(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm hôm nay:', error);
      }
    );
  }
  // Tải danh sách top sản phẩm bán chạy trong tháng này
  loadTopSanPhamThangNay(): void {
    this.thongKeService.topSanPhamThangNay(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm tháng này:', error);
      }
    );
  }

  // Tải danh sách top sản phẩm bán chạy trong năm nay
  loadTopSanPhamNamNay(): void {
    this.thongKeService.topSanPhamNamNay(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm năm nay:', error);
      }
    );
  }

  // Tải danh sách top sản phẩm bán chạy tất cả thời gian
  loadTopSanPhamTatCa(): void {
    this.thongKeService.topSanPhamTatCa(this.page, this.size).subscribe(
      (data: TopSanPhamResponse[]) => {
        this.topSanPhamData = data;
        this.renderPieChart();
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách top sản phẩm tất cả thời gian:', error);
      }
    );
  }
  renderPieChart(): void {
    if (typeof document === 'undefined') {
      console.warn('Không thể vẽ biểu đồ vì document không tồn tại.');
      return;
    }
  
    const topProducts = this.topSanPhamData.slice(0, 5); // Lấy 5 sản phẩm đầu tiên
    const otherProducts = this.topSanPhamData.slice(5);  // Tất cả sản phẩm còn lại
  
    const labels = topProducts.map(product => product.tenSanPham);
    const data = topProducts.map(product => product.tongSoLuong);
  
    // Kiểm tra nếu có sản phẩm còn lại thì mới thêm vào biểu đồ
    if (otherProducts.length > 0) {
      labels.push('Các sản phẩm khác');
      data.push(otherProducts.reduce((sum, product) => sum + product.tongSoLuong, 0));
    }
    
  
    // Kiểm tra canvas tồn tại
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Không tìm thấy phần tử canvas cho biểu đồ tròn.');
      return;
    }
  
    // Xóa biểu đồ cũ trước khi vẽ mới
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  
    // Vẽ biểu đồ tròn
    this.pieChart = new Chart(canvas.getContext('2d')!, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Top sản phẩm bán chạy',
            data: data,
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFD733', '#33FFF5'],
            borderColor: ['#C70039', '#28A745', '#1F3C88', '#C71585', '#E6B800', '#00CED1'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw;
                return `${label}: ${value} sản phẩm`;
              },
            },
          },
        },
      },
    });
  }
}
