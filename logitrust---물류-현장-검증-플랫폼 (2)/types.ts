export enum Role {
  DISPATCH = 'dispatch', // Was MANAGER
  DRIVER = 'driver',
  OPS = 'ops'
}

export enum RiskGrade {
  A = 'A', // >= 4.5
  B = 'B', // 4.0 - 4.49
  C = 'C', // 3.5 - 3.99
  D = 'D'  // < 3.5
}

export enum TrustLabel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ConstraintStatus {
  CONFIRMED = 'CONFIRMED', // Approved by Ops
  DISPUTED = 'DISPUTED',   // Flagged by Driver or detected conflict
  PENDING = 'PENDING'      // Initial input (or active pending request exists)
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HOLD = 'HOLD'
}

export interface User {
  id: string;
  role: Role;
  name: string;
}

export interface Announcement {
  id: string;
  placeId: string;
  title: string;
  content: string;
  createdBy: string; // User ID
  createdAt: string;
  isActive: boolean;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  placeType: 'WAREHOUSE' | 'FACTORY' | 'STORE' | 'PORT';
  // Map Related (Optional for MVP)
  lat?: number;
  lng?: number;
  formatted_address?: string;
  map_provider_pref?: 'NAVER' | 'GOOGLE';
}

export interface Constraint {
  id: string;
  placeId: string;
  fieldKey: string; // e.g., 'maxHeight', 'dockType'
  label: string; // Display name
  value: string;
  unit?: string;
  status: ConstraintStatus;
  updatedAt: string;
}

export interface EditRequest {
  id: string;
  placeId: string;
  constraintId?: string; // If editing existing
  fieldKey: string;
  fieldLabel: string;
  currentValue?: string;
  requestedValue: string;
  requestedBy: string; // User ID
  requestedByName: string;
  requestedByRole: Role;
  status: RequestStatus;
  evidenceFiles?: string[]; // Array of image URLs
  note?: string; // Request note by driver
  reviewerId?: string;
  reviewerNote?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  rating: number;
  tipText: string;
  tags: string[];
  createdAt: string;
}

export interface TrustScoreDetails {
  totalScore: number;
  confirmedRatioScore: number; // Max 60
  recencyBonus: number; // Max 20
  pendingPenalty: number;
  disputedPenalty: number;
  label: TrustLabel;
}

export interface Score {
  riskGrade: RiskGrade;
  trustDetails: TrustScoreDetails;
}

export interface PlaceVersion {
  id: string;
  placeId: string;
  sourceRequestId: string;
  fieldKey: string;
  label: string;
  oldValue: string;
  newValue: string;
  approvedBy: string; // ops user id
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'REQUEST_HOLD' | 'ANNOUNCEMENT';
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}