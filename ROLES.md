# User Roles and Permissions

This document describes the different user roles in the Phoenix Sangam application and their respective permissions.

## Role Types

### 1. Secretary
- **Full administrative access**
- Can manage members (add, edit, delete)
- Can manage meetings (create, edit, delete)
- Can manage loans (create, edit, delete, process repayments)
- Can review and approve/reject loan requests
- Can view all dashboard data and reports

### 2. President
- **Full administrative access** (same as Secretary)
- Can manage members (add, edit, delete)
- Can manage meetings (create, edit, delete)
- Can manage loans (create, edit, delete, process repayments)
- Can review and approve/reject loan requests
- Can view all dashboard data and reports

### 3. Treasurer
- **Full administrative access** (same as Secretary)
- Can manage members (add, edit, delete)
- Can manage meetings (create, edit, delete)
- Can manage loans (create, edit, delete, process repayments)
- Can review and approve/reject loan requests
- Can view all dashboard data and reports

### 4. Member
- **Limited access**
- Can view dashboard with their own data
- Can request loans
- Can view their own loan history
- Cannot access member management
- Cannot access meeting management
- Cannot approve/reject loan requests

## Role-Based Access Control

The application uses role-based access control (RBAC) to ensure users only have access to features appropriate for their role:

- **Admin Routes**: Secretary, President, and Treasurer have access to member and meeting management pages
- **Loan Management**: All admin roles can manage loans and process repayments
- **Dashboard**: All users can access the dashboard, but content varies based on role
- **Loan Requests**: Only admin roles can approve/reject loan requests

## Implementation Details

The role system is implemented using:
- Type definitions in `src/types/common.ts` and `src/types/auth.ts`
- Helper functions in `src/utils/helpers.ts` for role checking
- Role-based routing in `src/components/auth/RoleBasedRoute.tsx`
- Conditional rendering in components based on user role

### Helper Functions

```typescript
// Check if user has administrative privileges
hasAdminPrivileges(role: string): boolean

// Check specific roles
isSecretary(role: string): boolean
isPresident(role: string): boolean
isTreasurer(role: string): boolean
isMember(role: string): boolean
```

## Security Notes

- Role checks are performed on both client and server side
- Authentication is required for all protected routes
- Role information is included in the user's authentication token
- All role-based decisions are made using the helper functions for consistency 