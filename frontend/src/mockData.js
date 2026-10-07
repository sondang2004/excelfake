// Realistic corporate mock data generator for spreadsheet background columns

export const MOCK_PROJECT_IDS = [
  'PRJ-9041', 'PRJ-8812', 'PRJ-7650', 'PRJ-9123', 'PRJ-6540',
  'PRJ-4321', 'PRJ-5678', 'PRJ-1092', 'PRJ-3344', 'PRJ-8899',
  'PRJ-7711', 'PRJ-2233', 'PRJ-5566', 'PRJ-9900', 'PRJ-4411'
];

export const MOCK_EMP_IDS = [
  'DEV-1029', 'DEV-1082', 'DEV-2041', 'QA-5012', 'PM-8820',
  'DEV-3019', 'UX-4011', 'DEV-1102', 'SA-9012', 'OPS-7721'
];

export const MOCK_STATUSES = [
  'Đã hoàn thành', 'Đang xử lý', 'Chờ duyệt', 'Đã hủy', 'Đang review'
];

export const MOCK_PRIORITIES = [
  'Cao', 'Trung bình', 'Thấp', 'Khẩn cấp'
];

export const MOCK_OWNERS = [
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Nam', 'Phạm Minh Châu',
  'Đỗ Quang Vinh', 'Hoàng Thanh Hương', 'Vũ Đức Thắng', 'Bùi Ngọc Lan'
];

export const DEFAULT_CORPORATE_FAKES = [
  'Cấu hình lại CORS policy và SSL certificate cho API Gateway v2.4',
  'Tối ưu hóa truy vấn SQL index cho bảng audit_activity_logs trong MySQL cluster',
  'Cập nhật tài liệu kỹ thuật OpenAPI 3.0 cho team Frontend và Mobile',
  'Kiểm thử kịch bản load testing cho microservice xử lý giao dịch thanh toán',
  'Khắc phục lỗi nợ kỹ thuật (technical debt) trong module authentication OAuth2',
  'Tự động hóa pipeline CI/CD GitHub Actions cho staging environment',
  'Kiểm tra tính tuân thủ quy chuẩn mã nguồn ESLint và SonarQube score',
  'Đồng bộ hóa dữ liệu từ Redis Cache về PostgreSQL master node',
  'Viết unit test cho service tính toán doanh thu và chi phí vận hành',
  'Rà soát lỗ hổng bảo mật OWASP Top 10 trong phiên bản phát hành sprint 42',
  'Cấu hình Prometheus metrics và Grafana dashboard giám sát CPU load',
  'Triển khai bản vá bảo mật khẩn cấp cho Kubernetes worker node cluster',
  'Tạo script backup tự động cơ sở dữ liệu s3 daily snapshot',
  'Xử lý phản hồi của khách hàng về hiệu năng màn hình xuất báo cáo PDF',
  'Họp thống nhất thiết kế kiến trúc hệ thống pub/sub Kafka tin nhắn'
];

export const MOCK_CORPORATE_FAKES = DEFAULT_CORPORATE_FAKES;

export const PRESET_PANIC_PROFILES = {
  it_dev: [
    'Tối ưu hóa truy vấn SQL index cho bảng audit_activity_logs',
    'Cấu hình CORS policy & SSL Certificate cho API Gateway',
    'Sửa lỗi nợ kỹ thuật module Authentication OAuth2 / JWT',
    'Cập nhật tài liệu OpenAPI 3.0 cho team Frontend & Mobile',
    'Tự động hóa pipeline CI/CD GitHub Actions trên Staging',
    'Viết Unit Test cho Service tính toán doanh thu vận hành',
    'Rà soát lỗ hổng bảo mật OWASP Top 10 trong Sprint 42',
    'Cấu hình Prometheus metrics và Grafana dashboard CPU',
    'Triển khai bản vá Kubernetes worker node cluster khẩn cấp'
  ],
  accounting: [
    'Đối chiếu số dư tài khoản ngân hàng Vietcombank tháng 09/2026',
    'Kiểm tra chứng từ hóa đơn GTGT đầu vào dự án Khách sạn Sunrise',
    'Lập bảng phân bổ chi phí trả trước ngắn hạn Q3/2026',
    'Rà soát báo cáo thuế TNCN và BHXH cho phòng Nhân sự',
    'Tổng hợp số liệu doanh thu bán hàng chi nhánh Miền Nam',
    'Quyết toán tạm ứng chi phí công tác phí dự án Hải Phòng',
    'Kiểm kê quỹ tiền mặt và tài sản cố định cuối quý 3',
    'Lập dự toán ngân sách chi phí vận hành phòng CNTT Q4/2026'
  ],
  marketing_hr: [
    'Duyệt kế hoạch chạy campaign Facebook Ads sản phẩm mới',
    'Đánh giá chỉ số KPI và OKR phòng Kinh doanh tháng 09',
    'Thiết kế banner quảng cáo chương trình Khuyến mãi mùa Thu',
    'Soạn thảo hợp đồng thử việc cho vị trí Senior Developer',
    'Lập danh sách nhân sự tham gia khóa đào tạo kỹ năng mềm',
    'Tổng hợp kết quả khảo sát mức độ hài lòng của nhân viên',
    'Gửi newsletter thông báo lịch nghỉ lễ Quốc Khánh cho toàn công ty'
  ]
};

export function generateInitialRows(
  count = 60,
  storyChunks = [],
  isPanic = false,
  customOverrides = {},
  customPanicLogs = []
) {
  const rows = [];
  const panicLogs = customPanicLogs && customPanicLogs.length > 0
    ? customPanicLogs
    : DEFAULT_CORPORATE_FAKES;
  const panicCount = panicLogs.length;

  for (let i = 0; i < count; i++) {
    const prjIndex = i % MOCK_PROJECT_IDS.length;
    const empIndex = i % MOCK_EMP_IDS.length;
    const statusIndex = i % MOCK_STATUSES.length;
    const priorityIndex = i % MOCK_PRIORITIES.length;
    const ownerIndex = i % MOCK_OWNERS.length;
    const defaultBudget = `$${((i + 1) * 340 + 1250).toLocaleString('en-US')}.00`;
    const defaultDate = `2026-10-0${(i % 6) + 1}`;

    // Default base values
    let colA = MOCK_PROJECT_IDS[prjIndex];
    let colB = MOCK_EMP_IDS[empIndex];
    let colC = '';
    let colD = MOCK_STATUSES[statusIndex];
    let colE = MOCK_PRIORITIES[priorityIndex];
    let colF = defaultBudget;
    let colG = MOCK_OWNERS[ownerIndex];
    let colH = defaultDate;

    // Column C Content Logic:
    if (isPanic) {
      colC = panicLogs[i % panicCount];
    } else if (storyChunks && storyChunks.length > 0) {
      if (i < storyChunks.length) {
        colC = storyChunks[i];
      } else {
        colC = panicLogs[i % panicCount];
      }
    } else {
      colC = panicLogs[i % panicCount];
    }

    // Apply manual cell overrides if any
    if (customOverrides[`${i}_A`] !== undefined) colA = customOverrides[`${i}_A`];
    if (customOverrides[`${i}_B`] !== undefined) colB = customOverrides[`${i}_B`];
    if (customOverrides[`${i}_C`] !== undefined && !isPanic) colC = customOverrides[`${i}_C`];
    if (customOverrides[`${i}_D`] !== undefined) colD = customOverrides[`${i}_D`];
    if (customOverrides[`${i}_E`] !== undefined) colE = customOverrides[`${i}_E`];
    if (customOverrides[`${i}_F`] !== undefined) colF = customOverrides[`${i}_F`];
    if (customOverrides[`${i}_G`] !== undefined) colG = customOverrides[`${i}_G`];
    if (customOverrides[`${i}_H`] !== undefined) colH = customOverrides[`${i}_H`];

    rows.push({
      id: i + 1,
      colA,
      colB,
      colC,
      colD,
      colE,
      colF,
      colG,
      colH
    });
  }
  return rows;
}

