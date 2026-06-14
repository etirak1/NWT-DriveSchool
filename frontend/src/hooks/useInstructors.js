import { useQuery } from '@tanstack/react-query';
import { userApi, instructorApi } from '../services/api';

/**
 * Shared hook for fetching instructors.
 * Used by both InstructorPage and CandidateManagement so they always
 * see the same list (shared React Query cache via the same queryKey).
 */
export function useInstructors() {
    return useQuery({
        queryKey: ['instructors-combined'],
        retry: 1,
        queryFn: async () => {
            const [resUsers, resInstructors] = await Promise.all([
                userApi.getActiveInstructors(),
                instructorApi.getAll(),
            ]);
            const usersList = resUsers.data.content || resUsers.data || [];
            const resourceList = resInstructors.data.content || resInstructors.data || [];
            return resourceList.map((instructor) => {
                const userIdFromResource = instructor.user?.userId || instructor.userId;
                const userMatch = usersList.find(u => String(u.userId) === String(userIdFromResource));
                return {
                    ...instructor,
                    firstName: userMatch?.firstName || instructor.user?.firstName || 'Nije pronađeno ime',
                    lastName: userMatch?.lastName || instructor.user?.lastName || 'Nije pronađeno prezime',
                    email: userMatch?.email || instructor.user?.email || 'Nema emaila',
                };
            });
        },
    });
}
