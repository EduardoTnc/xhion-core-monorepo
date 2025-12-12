// ==================== QUERIES ====================

// Users
export {
    useUsers,
    useUser,
    useUserProfile,
    usePrefetchUser,
    usePrefetchUserProfile,
} from './useUsers';

// Roles
export {
    useRoles,
    useRolesWithDetails,
    useRole,
    usePermissions,
    useUsersForRoles,
} from './useRoles';

// Projects
export {
    useProjects,
    useProject,
    useProjectMembers,
    useProjectStages,
    useProjectFilters,
    usePrefetchProject,
} from './useProjects';

// Tasks
export {
    useTasks,
    useTask,
    useMyTasks,
    useTaskComments,
    useTaskAttachments,
    useTaskActivity,
    useTaskFilters,
    usePrefetchTask,
} from './useTasks';

// Dashboard
export {
    useDashboardStats,
    useTodayTasks,
    useActiveProjects,
    useTeamLoad,
    useRiskAlerts,
    useCommunicationTimeline,
    usePriorityMatrix,
    useDashboardData,
    useRefreshDashboard,
} from './useDashboard';

// Departments
export {
    useDepartments,
    useDepartment,
    useDepartmentStats,
    usePrefetchDepartment,
} from './useDepartments';


// Ideas
export {
    useIdeas,
    useIdea,
    useIdeaComments,
    useIdeaVoters,
    useIdeasStats,
    useIdeaFilters,
} from './useIdeas';

// Notifications
export {
    useMyNotifications,
    useUserNotifications,
    useNotification,
    useUnreadNotificationsCount,
} from './useNotifications';

// Events
export {
    useEvents,
    useEvent,
    useUserEvents,
    useProjectEvents,
    useUpcomingEvents,
    useCalendarEvents,
} from './useEvents';

// Audit
export {
    useAuditLogs,
    useInfiniteAuditLogs,
    useAuditStats,
    useActiveUsers,
    useAuditFilters,
} from './useAudit';

// System Settings
export {
    useSystemSettings,
    usePrefetchSystemSettings,
} from './useSystemSettings';

// Timeline
export {
    useTimeline,
    useTimelineProject,
    useMyDay,
    useTeamLoad as useTimelineTeamLoad,
    useAISuggestions,
    useProjectDependencies,
} from './useTimeline';

// Job Positions
export {
    useProjectJobPositions,
    useDepartmentJobPositions,
} from './useJobPositions';

// User Settings
export {
    useUserSessions,
    useProfessionalProfile,
    useUserContacts,
    useUserProfessionalLinks,
} from './useUserSettings';

// ==================== MUTATIONS ====================

// Users
export {
    useChangeUserRole,
    useUpdateUserStatus,
    useDeleteUser,
} from '../mutations/useUserMutations';

// User Settings Mutations
export {
    useUpdateProfile,
    useChangePassword,
    useUploadAvatar,
    useUploadCv,
    useTerminateSession,
    useUpdateProfessionalProfile,
    useUpdateNotificationSettings,
    useDownloadUserData,
    useDeleteAccount,
    useAddContact,
    useDeleteContact,
    useAddProfessionalLink,
    useDeleteProfessionalLink,
} from '../mutations/useUserSettingsMutations';

// Roles
export {
    useCreateRole,
    useUpdateRole,
    useUpdateRolePermissions,
    useDeleteRole,
} from '../mutations/useRoleMutations';

// Projects
export {
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
    useAddProjectMember,
    useRemoveProjectMember,
    useCreateProjectStage,
    useUpdateProjectStage,
    useDeleteProjectStage,
    useReorderProjectStages,
} from '../mutations/useProjectMutations';

// Tasks
export {
    useCreateTask,
    useUpdateTask,
    useMoveTask,
    useDeleteTask,
    useAddTaskComment,
    useDeleteTaskComment,
    useUploadTaskAttachment,
    useDeleteTaskAttachment,
} from '../mutations/useTaskMutations';

// Departments
export {
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment,
    useRestoreDepartment,
} from '../mutations/useDepartmentMutations';


// Ideas
export {
    useCreateIdea,
    useUpdateIdea,
    useDeleteIdea,
    useVoteIdea,
    useAddIdeaComment,
    useDeleteIdeaComment,
} from '../mutations/useIdeaMutations';

// Notifications
export {
    useCreateNotification,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
    useDeleteReadNotifications,
} from '../mutations/useNotificationMutations';

// Events
export {
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    useMoveEvent,
    useAddEventParticipant,
    useRemoveEventParticipant,
    useConfirmEventAttendance,
} from '../mutations/useEventMutations';

// System Settings
export {
    useUpdateSystemSettings,
    useUploadFile,
} from '../mutations/useSystemSettingsMutations';

// Timeline
export {
    useUpdateProjectDates,
    useApplyAISuggestion,
    useDismissAISuggestion,
    useMarkAlertViewed,
    useResolveAlert,
} from './useTimeline';

// Job Positions
export {
    useCreateJobPosition,
    useUpdateJobPosition,
    useDeleteJobPosition,
    useAssignEmployeeToPosition,
    useUnassignEmployeeFromPosition,
} from './useJobPositions';
