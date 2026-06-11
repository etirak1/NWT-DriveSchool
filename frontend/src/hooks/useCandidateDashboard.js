import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCandidateProgress } from './useCandidateProgress';
import { useFinance } from './useFinance';
import { useLessons } from './useLessons';
import { useAnnouncements } from './useAnnouncements';
import { TOTAL_THEORY_LESSONS, TOTAL_DRIVING_LESSONS } from '../constants';

export function useCandidateDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { userId, email, role } = user;

    
    const [showFeedback,     setShowFeedback]     = useState(false);
    const [activeSection,    setActiveSection]    = useState('overview');
    const [rescheduleLesson, setRescheduleLesson] = useState(null);

   
    const {
        candidate, phases, timeline, theoryEligibility,
        alreadyRated, setAlreadyRated,
        theoryCompleted, drivingCompleted,
        loading,
    } = useCandidateProgress(userId);

    const { financeStatus, payments } = useFinance(candidate?.candidateId);
    const { pageData, pendingLessons, fetchLessons, respondToLesson } = useLessons();
    const { announcements } = useAnnouncements();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    
    const rule                      = candidate?.rule;
    const theoryTotal               = rule?.minTheoryLessons    ?? TOTAL_THEORY_LESSONS;
    const drivingTotal              = rule?.minPracticalLessons ?? TOTAL_DRIVING_LESSONS;
    const theoryPct                 = theoryTotal > 0 ? Math.round((theoryCompleted / theoryTotal) * 100) : 0;
    const theoryExamPhase           = timeline.find(p => p.key === 'TEORIJSKI_ISPIT');
    const practicalExamPhase        = timeline.find(p => p.key === 'PRAKTICNI_ISPIT');
    const theoryPassed              = theoryExamPhase?.examStatus?.toUpperCase()    === 'POLOŽENO';
    const drivingExamPassed         = practicalExamPhase?.examStatus?.toUpperCase() === 'POLOŽENO';
    const effectiveDrivingCompleted = drivingExamPassed ? drivingTotal : drivingCompleted;
    const drivingPct                = drivingTotal > 0 ? Math.round((effectiveDrivingCompleted / drivingTotal) * 100) : 0;
    const allDone                   = theoryPassed && drivingExamPassed;

    const totalAmount    = Number(financeStatus?.totalAmount   ?? 0);
    const amountPaid     = Number(financeStatus?.paidAmount    ?? 0);
    const remainingDebt  = Number(financeStatus?.remainingDebt ?? 0);
    const paymentPct     = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
    const enrollmentPaid = financeStatus?.enrollmentEligible ?? false;
    const examEligible   = financeStatus?.examEligible ?? false;
    const obligations    = financeStatus?.obligations ?? [];

    return {
        email, role,
        candidate, payments, financeStatus, announcements,
        pageData, loading, alreadyRated, showFeedback, setShowFeedback,
        activeSection, setActiveSection,
        drivingCompleted, theoryCompleted,
        rescheduleLesson, setRescheduleLesson,
        timeline, pendingLessons, theoryEligibility,
        fetchLessons, handleLogout, respondToLesson, setAlreadyRated,
        theoryTotal, drivingTotal, theoryPct, drivingPct,
        theoryPassed, drivingExamPassed, effectiveDrivingCompleted,
        allDone,
        totalAmount, amountPaid, remainingDebt, paymentPct,
        enrollmentPaid, examEligible, obligations,
    };
}
