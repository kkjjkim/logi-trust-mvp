import { User, Role, Place, Constraint, ConstraintStatus, EditRequest, RequestStatus, Review, PlaceVersion, Notification, Announcement } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', role: Role.DRIVER, name: '김기사' },
  { id: 'u2', role: Role.DRIVER, name: '박화물' },
  { id: 'u3', role: Role.DISPATCH, name: '이배차' },
  { id: 'ops1', role: Role.OPS, name: '최운영' },
];

export const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", 
  "https://images.unsplash.com/photo-1595246140625-573b715e11d3?w=800&q=80", 
  "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?w=800&q=80", 
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80", 
  "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80", 
  "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800&q=80", 
  "https://images.unsplash.com/photo-1494412574643-35d324698420?w=800&q=80", 
  "https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&q=80", 
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80", 
  "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800&q=80"
];

const placeTypes = ['WAREHOUSE', 'FACTORY', 'STORE', 'PORT'] as const;
const fieldKeys = [
  { key: 'height', label: '진입 제한 높이', unit: 'm' },
  { key: 'dock', label: '도크 정보', unit: '' },
  { key: 'forklift', label: '지게차 지원', unit: '' },
  { key: 'wait', label: '대기 장소', unit: '' },
  { key: 'time', label: '작업 가능 시간', unit: '' },
];

export const MOCK_PLACES: Place[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `p${i + 1}`,
  name: `물류센터 ${String.fromCharCode(65 + i)}동`,
  address: `경기도 광주시 초월읍 무들로 ${100 + i * 50}`,
  placeType: placeTypes[i % 4],
  lat: 37.4 + (Math.random() * 0.1),
  lng: 127.2 + (Math.random() * 0.1),
}));

export const MOCK_CONSTRAINTS: Constraint[] = [];
MOCK_PLACES.forEach(place => {
  fieldKeys.forEach((field, i) => {
    // Randomly add constraints
    if (Math.random() > 0.3) {
      MOCK_CONSTRAINTS.push({
        id: `c_${place.id}_${field.key}`,
        placeId: place.id,
        fieldKey: field.key,
        label: field.label,
        value: i === 0 ? (3.5 + Math.random()).toFixed(1) : '정보 있음',
        unit: field.unit,
        status: ConstraintStatus.CONFIRMED, // Default confirmed for base data
        updatedAt: '2023-10-01',
      });
    }
  });
});

export const MOCK_REVIEWS: Review[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `r${i + 1}`,
  placeId: `p${(i % 10) + 1}`,
  userId: i % 2 === 0 ? 'u1' : 'u2',
  userName: i % 2 === 0 ? '김기사' : '박화물',
  rating: Math.floor(Math.random() * 3) + 3, // 3 to 5
  tipText: `진입로가 ${i % 2 === 0 ? '넓습니다' : '좁으니 주의하세요'}. 직원분들은 친절합니다.`,
  tags: i % 2 === 0 ? ['직원친절', '빠른하차'] : ['대기시간김', '진입로좁음'],
  createdAt: '2023-10-15',
}));

export const MOCK_REQUESTS: EditRequest[] = [
  // 4 Normal Pending
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `req_p${i + 1}`,
    placeId: `p${i + 1}`,
    constraintId: `c_p${i + 1}_height`,
    fieldKey: 'height',
    fieldLabel: '진입 제한 높이',
    currentValue: '3.8',
    requestedValue: '4.2',
    requestedBy: 'u1',
    requestedByName: '김기사',
    requestedByRole: Role.DRIVER,
    status: RequestStatus.PENDING,
    note: '최근 공사로 높이 제한이 변경되었습니다.',
    evidenceFiles: [MOCK_IMAGES[i % MOCK_IMAGES.length]],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  })),
  // 2 DISPUTED Simulation
  {
    id: 'req_dispute_1', placeId: 'p5', constraintId: 'c_p5_dock', fieldKey: 'dock', fieldLabel: '도크 정보',
    currentValue: '2개', requestedValue: '도크 4개', requestedBy: 'u1', requestedByName: '김기사', requestedByRole: Role.DRIVER,
    status: RequestStatus.PENDING, note: '도크 확장됨', createdAt: new Date().toISOString()
  },
  {
    id: 'req_dispute_2', placeId: 'p5', constraintId: 'c_p5_dock', fieldKey: 'dock', fieldLabel: '도크 정보',
    currentValue: '2개', requestedValue: '도크 3개 (1개 수리중)', requestedBy: 'u2', requestedByName: '박화물', requestedByRole: Role.DRIVER,
    status: RequestStatus.PENDING, note: '수리중이라 3개만 사용가능', evidenceFiles: [MOCK_IMAGES[2]], createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'req_a1', placeId: 'p1', constraintId: 'c_p1_dock', fieldKey: 'dock', fieldLabel: '도크 정보',
    currentValue: '없음', requestedValue: '도크 3개 증설', requestedBy: 'u3', requestedByName: '이배차', requestedByRole: Role.DISPATCH,
    status: RequestStatus.APPROVED, reviewerId: 'ops1', reviewerNote: '현장 확인 완료', createdAt: '2023-10-01', decidedAt: '2023-10-02'
  },
  {
    id: 'req_a2', placeId: 'p2', constraintId: 'c_p2_wait', fieldKey: 'wait', fieldLabel: '대기 장소',
    currentValue: '도로변', requestedValue: '내부 주차장', requestedBy: 'u1', requestedByName: '김기사', requestedByRole: Role.DRIVER,
    status: RequestStatus.APPROVED, reviewerId: 'ops1', reviewerNote: '확인됨', createdAt: '2023-10-03', decidedAt: '2023-10-04'
  },
  {
    id: 'req_r1', placeId: 'p3', constraintId: 'c_p3_height', fieldKey: 'height', fieldLabel: '진입 제한 높이',
    currentValue: '4.0', requestedValue: '5.0', requestedBy: 'u2', requestedByName: '박화물', requestedByRole: Role.DRIVER,
    status: RequestStatus.REJECTED, reviewerId: 'ops1', reviewerNote: '해당 높이 진입 불가함 (로드뷰 확인)', createdAt: '2023-10-05', decidedAt: '2023-10-06'
  },
  {
    id: 'req_r2', placeId: 'p3', constraintId: 'c_p3_time', fieldKey: 'time', fieldLabel: '작업 가능 시간',
    currentValue: '09:00-18:00', requestedValue: '24시간', requestedBy: 'u2', requestedByName: '박화물', requestedByRole: Role.DRIVER,
    status: RequestStatus.REJECTED, reviewerId: 'ops1', reviewerNote: '야간 작업 불가 사업장', createdAt: '2023-10-07', decidedAt: '2023-10-08'
  },
];

export const MOCK_VERSIONS: PlaceVersion[] = [
  {
    id: 'v1', placeId: 'p1', sourceRequestId: 'req_a1', fieldKey: 'dock', label: '도크 정보',
    oldValue: '없음', newValue: '도크 3개 증설', approvedBy: 'ops1', createdAt: '2023-10-02'
  },
  {
    id: 'v2', placeId: 'p2', sourceRequestId: 'req_a2', fieldKey: 'wait', label: '대기 장소',
    oldValue: '도로변', newValue: '내부 주차장', approvedBy: 'ops1', createdAt: '2023-10-04'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1', placeId: 'p1', title: '연말 물량 증가로 인한 대기 안내', 
    content: '연말 물량 증가로 인해 평균 대기시간이 1시간 이상 소요되고 있습니다. 3번 게이트 대기소를 이용해주세요.',
    createdBy: 'u3', createdAt: '2023-11-01', isActive: true
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [];