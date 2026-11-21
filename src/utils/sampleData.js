import { getDateWithDayOffset } from './dateUtils';
import { calculateRemaining, getPaymentStatus } from './calculations';

export function createInitialSampleCustomers() {
  const rawList = [
    {
      id: 'cust-101',
      name: 'Rajesh Sharma',
      phone: '+91 98201 44521',
      insuranceCompany: 'HDFC ERGO General Insurance',
      carrierCode: 'HDFC',
      carrierColor: '#D32F2F',
      insuranceType: 'Motor Insurance',
      totalAmount: 48000,
      partialAmount: 20000,
      policyStartDate: getDateWithDayOffset(-362),
      policyEndDate: getDateWithDayOffset(3), // Expiring in 3 days (24 Nov 2026)
      pdfFileName: 'Rajesh_Sharma_Motor_Policy.pdf',
      pdfFileSize: 24576,
      createdAt: new Date(Date.now() - 362 * 86400000).toISOString()
    },
    {
      id: 'cust-102',
      name: 'Priya Patel',
      phone: '+91 97412 88390',
      insuranceCompany: 'ICICI Lombard General Insurance',
      carrierCode: 'ICICI',
      carrierColor: '#B91C1C',
      insuranceType: 'Accidental Insurance',
      totalAmount: 24500,
      partialAmount: 24500, // Fully paid
      policyStartDate: getDateWithDayOffset(-359),
      policyEndDate: getDateWithDayOffset(6), // 6 days left
      pdfFileName: 'Priya_Patel_Accidental_Cert.pdf',
      pdfFileSize: 22100,
      createdAt: new Date(Date.now() - 359 * 86400000).toISOString()
    },
    {
      id: 'cust-103',
      name: 'Amit Verma',
      phone: '+91 94150 23119',
      insuranceCompany: 'Tata AIG General Insurance',
      carrierCode: 'TATA',
      carrierColor: '#1D4ED8',
      insuranceType: 'Motor Insurance',
      totalAmount: 36000,
      partialAmount: 0, // Pending
      policyStartDate: getDateWithDayOffset(-354),
      policyEndDate: getDateWithDayOffset(11), // 11 days left
      pdfFileName: 'Amit_Verma_TataAIG_Vehicle.pdf',
      pdfFileSize: 28900,
      createdAt: new Date(Date.now() - 354 * 86400000).toISOString()
    },
    {
      id: 'cust-104',
      name: 'Sunita Rao',
      phone: '+91 98480 77123',
      insuranceCompany: 'Bajaj Allianz General Insurance',
      carrierCode: 'BAJAJ',
      carrierColor: '#0369A1',
      insuranceType: 'Accidental Insurance',
      totalAmount: 22000,
      partialAmount: 12000, // Partial
      policyStartDate: getDateWithDayOffset(-351),
      policyEndDate: getDateWithDayOffset(14), // 14 days left
      pdfFileName: 'Sunita_Rao_Bajaj_Allianz.pdf',
      pdfFileSize: 21500,
      createdAt: new Date(Date.now() - 351 * 86400000).toISOString()
    },
    {
      id: 'cust-105',
      name: 'Vikram Malhotra',
      phone: '+91 99304 55102',
      insuranceCompany: 'New India Assurance',
      carrierCode: 'NIA',
      carrierColor: '#B45309',
      insuranceType: 'Motor Insurance',
      totalAmount: 55000,
      partialAmount: 55000, // Fully paid
      policyStartDate: getDateWithDayOffset(-344),
      policyEndDate: getDateWithDayOffset(21), // 21 days left
      pdfFileName: 'Vikram_Malhotra_Comprehensive_Motor.pdf',
      pdfFileSize: 31200,
      createdAt: new Date(Date.now() - 344 * 86400000).toISOString()
    },
    {
      id: 'cust-106',
      name: 'Ananya Iyer',
      phone: '+91 98840 19284',
      insuranceCompany: 'Star Health & Allied Insurance',
      carrierCode: 'STAR',
      carrierColor: '#047857',
      insuranceType: 'Accidental Insurance',
      totalAmount: 28000,
      partialAmount: 14000, // Partial
      policyStartDate: getDateWithDayOffset(-337),
      policyEndDate: getDateWithDayOffset(28), // 28 days left
      pdfFileName: 'Ananya_Iyer_StarHealth_Accident.pdf',
      pdfFileSize: 19800,
      createdAt: new Date(Date.now() - 337 * 86400000).toISOString()
    },
    {
      id: 'cust-107',
      name: 'Rahul Deshmukh',
      phone: '+91 98220 63481',
      insuranceCompany: 'SBI General Insurance',
      carrierCode: 'SBI',
      carrierColor: '#1E40AF',
      insuranceType: 'Motor Insurance',
      totalAmount: 32500,
      partialAmount: 0, // Pending
      policyStartDate: getDateWithDayOffset(-370),
      policyEndDate: getDateWithDayOffset(-5), // Expired 5 days ago
      pdfFileName: 'Rahul_Deshmukh_SBI_Car.pdf',
      pdfFileSize: 25400,
      createdAt: new Date(Date.now() - 370 * 86400000).toISOString()
    },
    {
      id: 'cust-108',
      name: 'Pooja Gupta',
      phone: '+91 97110 34912',
      insuranceCompany: 'Reliance General Insurance',
      carrierCode: 'REL',
      carrierColor: '#4338CA',
      insuranceType: 'Motor Insurance',
      totalAmount: 45000,
      partialAmount: 45000, // Fully paid
      policyStartDate: getDateWithDayOffset(-380),
      policyEndDate: getDateWithDayOffset(-15), // Expired 15 days ago
      pdfFileName: 'Pooja_Gupta_Reliance_Motor.pdf',
      pdfFileSize: 26100,
      createdAt: new Date(Date.now() - 380 * 86400000).toISOString()
    },
    {
      id: 'cust-109',
      name: 'Sneha Reddy',
      phone: '+91 94401 82736',
      insuranceCompany: 'HDFC ERGO General Insurance',
      carrierCode: 'HDFC',
      carrierColor: '#D32F2F',
      insuranceType: 'Accidental Insurance',
      totalAmount: 22000,
      partialAmount: 15000, // Partial
      policyStartDate: getDateWithDayOffset(-280),
      policyEndDate: getDateWithDayOffset(85), // Future
      pdfFileName: 'Sneha_Reddy_Personal_Accident.pdf',
      pdfFileSize: 21900,
      createdAt: new Date(Date.now() - 280 * 86400000).toISOString()
    },
    {
      id: 'cust-110',
      name: 'Karthik Nair',
      phone: '+91 98470 91029',
      insuranceCompany: 'ICICI Lombard General Insurance',
      carrierCode: 'ICICI',
      carrierColor: '#B91C1C',
      insuranceType: 'Motor Insurance',
      totalAmount: 55000,
      partialAmount: 28000, // Partial
      policyStartDate: getDateWithDayOffset(-210),
      policyEndDate: getDateWithDayOffset(120), // Future
      pdfFileName: 'Karthik_Nair_SUV_Policy.pdf',
      pdfFileSize: 33400,
      createdAt: new Date(Date.now() - 210 * 86400000).toISOString()
    }
  ];

  return rawList.map(item => {
    const remaining = calculateRemaining(item.totalAmount, item.partialAmount);
    const status = getPaymentStatus(item.totalAmount, item.partialAmount);
    return {
      ...item,
      remainingAmount: remaining,
      paymentStatus: status,
      hasPdf: true
    };
  });
}
