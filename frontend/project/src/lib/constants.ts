export const FILE_TYPES = [
  {
    value: 'hop-dong',
    label: 'Hợp đồng giao dịch',
    attachments: [
      { name: 'Hồ sơ công chứng', required: true },
      { name: 'Hợp đồng giao dịch', required: true },
      { name: 'Giấy tờ tùy thân 2 bên', required: true },
      { name: 'Giấy tờ tài sản', required: true },
      { name: 'Giấy tờ chứng minh quyền sở hữu', required: true }
    ]
  },
  {
    value: 'thua-ke',
    label: 'Thừa kế',
    attachments: [
      { name: 'Giấy chứng tử người để lại tài sản', required: true, hasQuantity: true },
      { name: 'Tờ tường trình quan hệ nhân thân', required: true },
      { name: 'Giấy chủ quyền tài sản', required: true, hasQuantity: true },
      { name: 'Giấy khai sinh người chết', required: false, hasQuantity: true },
      { name: 'Giấy tờ chứng minh quan hệ với người để lại tài sản', required: true, hasQuantity: true },
      { name: 'Giấy tờ tùy thân người được thừa kế', required: true, hasQuantity: true },
      { name: 'Chứng tử của người được thừa kế', required: false, hasQuantity: true }
    ]
  },
  {
    value: 'mua-ban-xe',
    label: 'Mua bán xe',
    attachments: [
      { name: 'Hồ sơ công chứng', required: true },
      { name: 'Hợp đồng mua bán xe', required: true },
      { name: 'Giấy tờ tùy thân 2 bên', required: true },
      { name: 'Giấy đăng ký xe', required: true },
      { name: 'Giấy kiểm định xe', required: true }
    ]
  },
  {
    value: 'thue-nha',
    label: 'Thuê nhà',
    attachments: [
      { name: 'Hồ sơ công chứng', required: true },
      { name: 'Hợp đồng thuê nhà', required: true },
      { name: 'Giấy tờ tùy thân 2 bên', required: true },
      { name: 'Giấy chủ quyền nhà', required: true }
    ]
  },
  {
    value: 'the-chap',
    label: 'Thế chấp',
    attachments: [
      { name: 'Hồ sơ công chứng', required: true },
      { name: 'Hợp đồng thế chấp', required: true },
      { name: 'Giấy tờ tùy thân 2 bên', required: true },
      { name: 'Giấy tờ tài sản thế chấp', required: true }
    ]
  },
  {
    value: 'gop-von',
    label: 'Góp vốn',
    attachments: [
      { name: 'Hồ sơ công chứng', required: true },
      { name: 'Hợp đồng góp vốn', required: true },
      { name: 'Giấy tờ tùy thân các bên', required: true },
      { name: 'Giấy phép kinh doanh', required: true }
    ]
  }
];

export const CLERKS = [
  { value: 'nguyen-van-a', label: 'Nguyễn Văn A' },
  { value: 'tran-thi-b', label: 'Trần Thị B' },
  { value: 'le-van-c', label: 'Lê Văn C' }
];

export const NOTARIES = [
  { value: 'pham-thi-d', label: 'Phạm Thị D' },
  { value: 'hoang-van-e', label: 'Hoàng Văn E' },
  { value: 'nguyen-thi-f', label: 'Nguyễn Thị F' }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};