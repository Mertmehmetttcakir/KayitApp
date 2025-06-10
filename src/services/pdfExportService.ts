import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CustomerReport,
  FinancialReport,
  ServiceReport,
  TechnicianReport
} from '../types/reports';

export class PDFExportService {
  private static setupTurkishFont(doc: jsPDF) {
    // Türkçe karakterler için Times font kullanıyoruz - bu font Türkçe karakterleri destekler
    doc.setFont('times', 'normal');
  }

  private static addHeader(doc: jsPDF, title: string) {
    // Türkçe font desteği ekle
    this.setupTurkishFont(doc);
    
    // Logo alanı (varsa)
    doc.setFontSize(20);
    doc.setFont('times', 'bold');
    doc.text('ServiceTracker Plus', 20, 25);
    
    // Başlık
    doc.setFontSize(16);
    doc.setFont('times', 'normal');
    doc.text(title, 20, 40);
    
    // Tarih
    doc.setFontSize(10);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 50);
    
    // Çizgi
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    return 65; // Content start position
  }

  private static addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.setFont('times', 'normal');
    
    // Sayfa numarası için getCurrentPageInfo yerine alternatif
    const currentPage = doc.internal.pages.length - 1;
    doc.text(`Sayfa ${currentPage}`, 20, pageHeight - 20);
    
    doc.text(
      'ServiceTracker Plus - Otomotiv Servis Yönetim Sistemi',
      105,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  static async exportFinancialReport(report: FinancialReport): Promise<void> {
    const doc = new jsPDF();
    this.setupTurkishFont(doc);
    let yPosition = this.addHeader(doc, 'Finansal Rapor');

    // Özet bilgiler
    const summaryData = [
      ['Toplam Gelir', `₺${report.totalRevenue.toLocaleString('tr-TR')}`],
      ['Toplam Gider', `₺${report.totalExpenses.toLocaleString('tr-TR')}`],
      ['Net Kâr', `₺${report.netProfit.toLocaleString('tr-TR')}`],
      ['Bekleyen Ödemeler', `₺${report.pendingAmount.toLocaleString('tr-TR')}`],
      ['Ödenmiş Tutar', `₺${report.paidAmount.toLocaleString('tr-TR')}`],
      ['İade Tutarı', `₺${report.refundAmount.toLocaleString('tr-TR')}`],
      ['Kâr Marjı', `%${report.profitMargin.toFixed(2)}`],
      ['Gelir Artışı', `%${report.revenueGrowth.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    this.addFooter(doc);
    doc.save(`finansal-rapor-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportCustomerReport(report: CustomerReport): Promise<void> {
    const doc = new jsPDF();
    this.setupTurkishFont(doc);
    let yPosition = this.addHeader(doc, 'Müşteri Raporu');

    // Özet bilgiler
    const summaryData = [
      ['Toplam Müşteri', report.totalCustomers.toString()],
      ['Yeni Müşteri', report.newCustomers.toString()],
      ['Geri Dönen Müşteri', report.returningCustomers.toString()],
      ['Müşteri Tutma Oranı', `%${report.customerRetentionRate.toFixed(2)}`],
      ['Ortalama Müşteri Değeri', `₺${report.averageCustomerValue.toLocaleString('tr-TR')}`],
      ['Müşteri Artışı', `%${report.customerGrowth.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // En iyi müşteriler
    if (report.topCustomers && report.topCustomers.length > 0) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('En İyi Müşteriler', 20, yPosition);
      yPosition += 10;

      const topCustomersData = report.topCustomers.map(customer => [
        customer.name,
        customer.jobCount.toString(),
        `₺${customer.totalSpent.toLocaleString('tr-TR')}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Müşteri Adı', 'İş Sayısı', 'Toplam Harcama']],
        body: topCustomersData,
        styles: { 
          fontSize: 9,
          font: 'times',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'times',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`musteri-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportServiceReport(report: ServiceReport): Promise<void> {
    const doc = new jsPDF();
    this.setupTurkishFont(doc);
    let yPosition = this.addHeader(doc, 'Servis Raporu');

    // Özet bilgiler
    const summaryData = [
      ['Toplam İş', report.totalJobs.toString()],
      ['Tamamlanan İş', report.completedJobs.toString()],
      ['Bekleyen İş', report.pendingJobs.toString()],
      ['İptal Edilen İş', report.cancelledJobs.toString()],
      ['Ortalama İş Değeri', `₺${report.averageJobValue.toLocaleString('tr-TR')}`],
      ['Ortalama Tamamlanma Süresi', `${report.averageCompletionTime.toFixed(1)} gün`],
      ['İş Artışı', `%${report.jobGrowth.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Popüler servisler
    if (report.popularServices && report.popularServices.length > 0) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('Popüler Servisler', 20, yPosition);
      yPosition += 10;

      const servicesData = report.popularServices.map(service => [
        service.service,
        service.count.toString(),
        `₺${service.revenue.toLocaleString('tr-TR')}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Servis Adı', 'Adet', 'Toplam Gelir']],
        body: servicesData,
        styles: { 
          fontSize: 9,
          font: 'times',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'times',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`servis-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportTechnicianReport(report: TechnicianReport): Promise<void> {
    const doc = new jsPDF();
    this.setupTurkishFont(doc);
    let yPosition = this.addHeader(doc, 'Teknisyen Raporu');

    // Özet bilgiler
    const summaryData = [
      ['Toplam Teknisyen', report.totalTechnicians.toString()],
      ['Aktif Teknisyen', report.activeTechnicians.toString()],
      ['Ortalama İş/Gün', report.productivity.averageJobsPerDay.toFixed(1)],
      ['Ortalama Gelir/Teknisyen', `₺${report.productivity.averageRevenuePerTechnician.toLocaleString('tr-TR')}`],
      ['Toplam Çalışma Saati', `${report.productivity.totalWorkHours.toFixed(1)} saat`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: summaryData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Teknisyen performansı
    if (report.workload && report.workload.length > 0) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('Teknisyen Performansı', 20, yPosition);
      yPosition += 10;

      const performanceData = report.workload.map(tech => [
        tech.name,
        tech.completedJobs.toString(),
        `₺${tech.totalRevenue.toLocaleString('tr-TR')}`,
        `${tech.averageRating.toFixed(1)}/5`,
        `%${tech.efficiency.toFixed(1)}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Teknisyen', 'İş Sayısı', 'Toplam Gelir', 'Ortalama Puan', 'Verimlilik']],
        body: performanceData,
        styles: { 
          fontSize: 9,
          font: 'times',
          fontStyle: 'normal'
        },
        headStyles: { 
          fillColor: [49, 130, 206],
          font: 'times',
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
      });
    }

    this.addFooter(doc);
    doc.save(`teknisyen-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportCombinedReport(
    financial: FinancialReport,
    customer: CustomerReport,
    service: ServiceReport,
    technician: TechnicianReport
  ): Promise<void> {
    const doc = new jsPDF();
    this.setupTurkishFont(doc);
    let yPosition = this.addHeader(doc, 'Kapsamlı İşletme Raporu');

    // Finansal özet
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('Finansal Özet', 20, yPosition);
    yPosition += 10;

    const financialData = [
      ['Net Kâr', `₺${financial.netProfit.toLocaleString('tr-TR')}`],
      ['Toplam Gelir', `₺${financial.totalRevenue.toLocaleString('tr-TR')}`],
      ['Bekleyen Ödemeler', `₺${financial.pendingAmount.toLocaleString('tr-TR')}`],
      ['Kâr Marjı', `%${financial.profitMargin.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: financialData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Müşteri özeti
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('Müşteri Özeti', 20, yPosition);
    yPosition += 10;

    const customerData = [
      ['Toplam Müşteri', customer.totalCustomers.toString()],
      ['Yeni Müşteri', customer.newCustomers.toString()],
      ['Müşteri Tutma Oranı', `%${customer.customerRetentionRate.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: customerData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Servis özeti
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('Servis Özeti', 20, yPosition);
    yPosition += 10;

    const serviceData = [
      ['Toplam İş', service.totalJobs.toString()],
      ['Tamamlanan İş', service.completedJobs.toString()],
      ['İş Artışı', `%${service.jobGrowth.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metrik', 'Değer']],
      body: serviceData,
      styles: { 
        fontSize: 10,
        font: 'times',
        fontStyle: 'normal'
      },
      headStyles: { 
        fillColor: [49, 130, 206],
        font: 'times',
        fontStyle: 'bold'
      },
      margin: { left: 20, right: 20 },
    });

    this.addFooter(doc);
    doc.save(`kapsamli-rapor-${new Date().toISOString().split('T')[0]}.pdf`);
  }
} 