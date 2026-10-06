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

export const MOCK_CORPORATE_FAKES = [
  'Cấu hình lại CORS policy và SSL certificate cho API Gateway v2.4',
  'Tối ưu hóa truy vấn SQL index cho bảng audit_activity_logs trong MySQL cluster',
  'Cập nhật tài liệu kỹ thuật OpenAPI 3.0 cho team Frontend và Mobile',
  'Kiểm thử kịch bản load testing cho microservice xử lý giao dịch thanh toán',
  'Khắc phục lỗi nợ kỹ thuật (technical debt) trong module authentication OAuth2',
  'Tự động hóa pipeline CI/CD GitHub Actions cho staging environment',
  'Kiểm tra tính tuân thủ quy chuẩn mã nguồn ESLint và SonarQube score',
  'Đồng bộ hóa dữ liệu từ Redis Cache về PostgreSQL master node',
  'Viết unit test cho service tính toán doanh thu và chi phí vận hành',
  'Rà soát lỗ hổng bảo mậtOWASP Top 10 trong phiên bản phát hành sprint 42',
  'Cấu hình Prometheus metrics và Grafana dashboard giám sát CPU load',
  'Triển khai bản vá bảo mật khẩn cấp cho Kubernetes worker node cluster',
  'Tạo script backup tự động cơ sở dữ liệu s3 daily snapshot',
  'Xử lý phản hồi của khách hàng về hiệu năng màn hình xuất báo cáo PDF',
  'Họp thống nhất thiết kế kiến trúc hệ thống pub/sub Kafka tin nhắn'
];

export function generateInitialRows(count = 60, storyChunks = [], isPanic = false) {
  const rows = [];
  const fakeTasksCount = MOCK_CORPORATE_FAKES.length;

  for (let i = 0; i < count; i++) {
    const prjIndex = i % MOCK_PROJECT_IDS.length;
    const empIndex = i % MOCK_EMP_IDS.length;
    const statusIndex = i % MOCK_STATUSES.length;
    const priorityIndex = i % MOCK_PRIORITIES.length;
    const ownerIndex = i % MOCK_OWNERS.length;
    const budget = `$${((i + 1) * 340 + 1250).toLocaleString('en-US')}.00`;
    const date = `2026-10-0${(i % 6) + 1}`;

    // Column C Content Logic:
    let taskDescription = '';
    if (isPanic) {
      taskDescription = MOCK_CORPORATE_FAKES[i % fakeTasksCount];
    } else if (storyChunks && storyChunks.length > 0) {
      if (i < storyChunks.length) {
        taskDescription = storyChunks[i];
      } else {
        // Filler if story ends
        taskDescription = MOCK_CORPORATE_FAKES[i % fakeTasksCount];
      }
    } else {
      // Default initial mock if no story loaded yet
      taskDescription = MOCK_CORPORATE_FAKES[i % fakeTasksCount];
    }

    rows.push({
      id: i + 1,
      colA: MOCK_PROJECT_IDS[prjIndex],
      colB: MOCK_EMP_IDS[empIndex],
      colC: taskDescription,
      colD: MOCK_STATUSES[statusIndex],
      colE: MOCK_PRIORITIES[priorityIndex],
      colF: budget,
      colG: MOCK_OWNERS[ownerIndex],
      colH: date
    });
  }
  return rows;
}
