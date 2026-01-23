import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Place, Constraint, Review, EditRequest, Role, RequestStatus, ConstraintStatus, Score, RiskGrade, TrustLabel, PlaceVersion, Notification, Announcement } from '../types';
import { MOCK_USERS, MOCK_PLACES, MOCK_CONSTRAINTS, MOCK_REVIEWS, MOCK_REQUESTS, MOCK_VERSIONS, MOCK_NOTIFICATIONS, MOCK_ANNOUNCEMENTS } from './mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  places: Place[];
  constraints: Constraint[];
  reviews: Review[];
  requests: EditRequest[];
  placeVersions: PlaceVersion[];
  notifications: Notification[];
  announcements: Announcement[];
  
  // Actions
  login: (role: Role) => void;
  logout: () => void;
  addPlace: (place: Place) => void;
  submitEditRequest: (req: Omit<EditRequest, 'id' | 'status' | 'createdAt' | 'requestedByName' | 'requestedByRole' | 'reviewerId' | 'reviewerNote' | 'decidedAt'>) => void;
  processRequest: (reqId: string, status: RequestStatus, note: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'userName'>) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt' | 'isActive'>) => void;
  markNotificationRead: (id: string) => void;
  generateCsvReport: (days: number) => string;
  
  // Helpers
  getPlaceScore: (placeId: string) => Score;
  getPlaceConstraints: (placeId: string) => Constraint[];
  getPlaceVersions: (placeId: string) => PlaceVersion[];
  getConstraintStatus: (placeId: string, fieldKey: string) => ConstraintStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [constraints, setConstraints] = useState<Constraint[]>(MOCK_CONSTRAINTS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [requests, setRequests] = useState<EditRequest[]>(MOCK_REQUESTS);
  const [placeVersions, setPlaceVersions] = useState<PlaceVersion[]>(MOCK_VERSIONS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
       const roleEnum = savedRole as Role;
       let user = MOCK_USERS.find(u => u.role === roleEnum);
       if (!user) user = { id: `demo-${roleEnum}`, role: roleEnum, name: `Demo ${roleEnum}` };
       setCurrentUser(user);
    }
  }, []);

  const login = (role: Role) => {
    let user = MOCK_USERS.find(u => u.role === role);
    if (!user) user = { id: `demo-${role}`, role, name: `Demo ${role}` };
    setCurrentUser(user);
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('role');
  };

  const addPlace = (place: Place) => setPlaces(prev => [...prev, place]);

  const submitEditRequest = (reqData: Omit<EditRequest, 'id' | 'status' | 'createdAt' | 'requestedByName' | 'requestedByRole'>) => {
    if (!currentUser) return;
    const newReq: EditRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      requestedByName: currentUser.name,
      requestedByRole: currentUser.role,
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const processRequest = (reqId: string, status: RequestStatus, note: string) => {
    if (!currentUser || currentUser.role !== Role.OPS) return;

    const req = requests.find(r => r.id === reqId);
    if (!req) return;

    const decidedAt = new Date().toISOString();
    
    setRequests(prev => prev.map(r => r.id === reqId ? { 
        ...r, 
        status, 
        reviewerNote: note, 
        reviewerId: currentUser.id,
        decidedAt 
    } : r));

    const notificationType = status === RequestStatus.APPROVED ? 'REQUEST_APPROVED' : status === RequestStatus.REJECTED ? 'REQUEST_REJECTED' : 'REQUEST_HOLD';
    const notificationMsg = status === RequestStatus.APPROVED 
        ? `'${req.fieldLabel}' 수정 요청이 승인되었습니다.`
        : `'${req.fieldLabel}' 수정 요청이 반려/보류되었습니다: ${note}`;
        
    const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: req.requestedBy,
        type: notificationType,
        message: notificationMsg,
        link: `/driver/places/${req.placeId}`,
        isRead: false,
        createdAt: decidedAt
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (status === RequestStatus.APPROVED) {
        setConstraints(prev => {
          const existingIdx = prev.findIndex(c => c.placeId === req.placeId && c.fieldKey === req.fieldKey);
          const oldValue = existingIdx >= 0 ? prev[existingIdx].value : '(없음)';
          const newConstraint: Constraint = {
            id: req.constraintId || `c-${Date.now()}`,
            placeId: req.placeId,
            fieldKey: req.fieldKey,
            label: req.fieldLabel,
            value: req.requestedValue,
            status: ConstraintStatus.CONFIRMED,
            updatedAt: decidedAt
          };

          const newVersion: PlaceVersion = {
              id: `ver-${Date.now()}`,
              placeId: req.placeId,
              sourceRequestId: req.id,
              fieldKey: req.fieldKey,
              label: req.fieldLabel,
              oldValue,
              newValue: req.requestedValue,
              approvedBy: currentUser.id,
              createdAt: decidedAt
          };
          setPlaceVersions(prevV => [newVersion, ...prevV]);

          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = { ...updated[existingIdx], ...newConstraint };
            return updated;
          } else {
            return [...prev, newConstraint];
          }
        });
    }
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'userName'>) => {
    if (!currentUser) return;
    const newReview: Review = {
      ...reviewData,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userName: currentUser.name,
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt' | 'isActive'>) => {
      const newAnn: Announcement = {
          ...annData,
          id: `ann-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isActive: true
      };
      setAnnouncements(prev => [newAnn, ...prev]);
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getConstraintStatus = (placeId: string, fieldKey: string): ConstraintStatus => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pendingRequests = requests.filter(r => 
        r.placeId === placeId && 
        r.fieldKey === fieldKey && 
        r.status === RequestStatus.PENDING &&
        new Date(r.createdAt) > thirtyDaysAgo
    );

    if (pendingRequests.length >= 2) {
        const firstVal = pendingRequests[0].requestedValue;
        const hasConflict = pendingRequests.some(r => r.requestedValue !== firstVal);
        if (hasConflict) return ConstraintStatus.DISPUTED;
    }

    if (pendingRequests.length > 0) return ConstraintStatus.PENDING;

    const constraint = constraints.find(c => c.placeId === placeId && c.fieldKey === fieldKey);
    return constraint ? constraint.status : ConstraintStatus.PENDING; 
  };

  const getPlaceScore = (placeId: string): Score => {
    const placeReviews = reviews.filter(r => r.placeId === placeId);
    let riskGrade = RiskGrade.C; 
    if (placeReviews.length > 0) {
      const avg = placeReviews.reduce((acc, r) => acc + r.rating, 0) / placeReviews.length;
      if (avg >= 4.5) riskGrade = RiskGrade.A;
      else if (avg >= 4.0) riskGrade = RiskGrade.B;
      else if (avg >= 3.5) riskGrade = RiskGrade.C;
      else riskGrade = RiskGrade.D;
    }

    const placeConstraints = constraints.filter(c => c.placeId === placeId);
    let confirmedCount = 0;
    let pendingCount = 0;
    let disputedCount = 0;
    let hasRecentUpdate = false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allKeys = new Set([
        ...placeConstraints.map(c => c.fieldKey),
        ...requests.filter(r => r.placeId === placeId && r.status === RequestStatus.PENDING).map(r => r.fieldKey)
    ]);

    allKeys.forEach(key => {
        const status = getConstraintStatus(placeId, key);
        if (status === ConstraintStatus.CONFIRMED) confirmedCount++;
        else if (status === ConstraintStatus.PENDING) pendingCount++;
        else if (status === ConstraintStatus.DISPUTED) disputedCount++;

        const constr = placeConstraints.find(c => c.fieldKey === key);
        if (constr && new Date(constr.updatedAt) > thirtyDaysAgo) {
            hasRecentUpdate = true;
        }
    });

    const totalFields = allKeys.size || 1; 
    const confirmedRatioScore = Math.round((confirmedCount / totalFields) * 60);
    const recencyBonus = hasRecentUpdate ? 20 : 0;
    const pendingPenalty = pendingCount * 5;
    const disputedPenalty = disputedCount * 15;

    let totalScore = 20 + confirmedRatioScore + recencyBonus - pendingPenalty - disputedPenalty;
    totalScore = Math.max(0, Math.min(100, totalScore));

    let trustLabel = TrustLabel.LOW;
    if (totalScore >= 80) trustLabel = TrustLabel.HIGH;
    else if (totalScore >= 50) trustLabel = TrustLabel.MEDIUM;

    return { 
        riskGrade, 
        trustDetails: {
            totalScore,
            confirmedRatioScore,
            recencyBonus,
            pendingPenalty,
            disputedPenalty,
            label: trustLabel
        }
    };
  };

  const generateCsvReport = (days: number): string => {
     const startDate = new Date();
     startDate.setDate(startDate.getDate() - days);

     const reportData = [
         ['Report Type', 'Ops Monthly Summary'],
         ['Generated At', new Date().toISOString()],
         ['Period', `${days} days`],
         [],
         ['--- Requests Summary ---'],
         ['ID', 'Date', 'Place', 'Field', 'Status', 'Requested By', 'Reviewer'],
         ...requests
           .filter(r => new Date(r.createdAt) >= startDate)
           .map(r => [
               r.id, 
               r.createdAt, 
               r.placeId, 
               r.fieldKey, 
               r.status, 
               r.requestedByName, 
               r.reviewerId || '-'
           ]),
         [],
         ['--- Disputed Places ---'],
         ['Place Name', 'Disputed Fields Count'],
         ...places.map(p => {
             const score = getPlaceScore(p.id);
             const conflictCount = score.trustDetails.disputedPenalty / 15; 
             return conflictCount > 0 ? [p.name, conflictCount] : null;
         }).filter(Boolean) as any[][]
     ];

     return reportData.map(row => row.join(',')).join('\n');
  };

  const getPlaceConstraints = (placeId: string) => constraints.filter(c => c.placeId === placeId);
  const getPlaceVersions = (placeId: string) => placeVersions.filter(v => v.placeId === placeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const value = {
    currentUser,
    users: MOCK_USERS,
    places,
    constraints,
    reviews,
    requests,
    placeVersions,
    notifications,
    announcements,
    login,
    logout,
    addPlace,
    submitEditRequest,
    processRequest,
    addReview,
    addAnnouncement,
    markNotificationRead,
    generateCsvReport,
    getPlaceScore,
    getPlaceConstraints,
    getPlaceVersions,
    getConstraintStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};