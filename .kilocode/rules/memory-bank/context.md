# Active Context: LabHouse Equipment Management App

## Current State

**Application Status**: ✅ LabHouse Equipment Management System

The application is now a full-featured equipment management system with authentication, device tracking, calibration management, incident reporting, and more.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **LabHouse Equipment source code integrated** from https://github.com/Labnotes123/LabHouse_Equipment
- [x] **Training Module implementation** - Complete 3-tab layout (Lên kế hoạch, Kho tài liệu, Chốt kết quả)
  - Add TrainingPlan, TrainingDocument, TrainingResult, TrainingTrainee types
  - Add users field to Device interface for tracking trained users
  - Complete rewrite of TrainingModal with plan creation, document management, result recording
  - Automation: auto-grant device permission to passed trainees
  - Automation: auto-change device status from 'Chờ vận hành' to 'Đang vận hành'
  - Fix TypeScript errors in multiple components
- [x] **Notification & Email System** - Complete notification infrastructure with email support
  - Add SystemNotification type with recipientId, priority, relatedType
  - Create /api/notifications route with CRUD operations
  - Create NotificationContext for state management
  - Add NotificationUI component with bell icon and dropdown
  - Update NotificationService with templates for approval requests/results
  - Integrate notifications into NewDeviceTab approval workflow
  - Update user emails: admin = levancong.hmtu@gmail.com, director = cong.le@gmail.com
  - Add nodemailer for real email sending
  - Add email-service.ts with HTML templates for all notification types
  - Add /api/emails route for manual email sending
  - Auto-send emails when notifications are created (if SMTP configured)
  - Add .env.example with SMTP configuration (gitignored)
- [x] **Email Fix** - Fixed notification email sending issue
  - Add recipientEmail field to SystemNotification interface
  - Add email field to ProposalApprover interface
  - Add email to MOCK_USERS_LIST with proper emails for director (cong.le@roche.com)
  - Update NewDeviceTab to send notifications via API (which triggers email sending)
  - Update approve/reject handlers to also send notifications via API
- [x] **History Tab Fix** - Fixed to load data from API properly with fallback to mock data
- [x] **Admin Tab Enhancements** - Fixed history config save to localStorage, backup now includes all data types (users, branches, positions, suppliers), restore loads from localStorage on app mount
- [x] **History Logging** - Added addHistory calls to NewDeviceTab and DashboardTab to automatically log user actions (send proposal, approve, reject) to the history system

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with auth | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/api/` | API routes | ✅ Ready |
| `src/components/` | UI components | ✅ Ready |
| `src/contexts/` | Auth/Data/Toast contexts | ✅ Ready |
| `src/lib/` | Utilities and mock data | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## LabHouse Equipment Features

The application now includes:
- **Authentication** - Login/logout with role-based access
- **Device Management** - Full CRUD for lab equipment
- **Training Module** - Training plans, documents, and results with 3-tab layout
- **Calibration Tracking** - Calibration requests and results
- **Incident Reporting** - Report and track incidents
- **User Management** - Admin user management
- **Branches/Positions** - Organizational structure
- **Suppliers** - Supplier management
- **Proposals** - Equipment proposals workflow
- **Notification System** - Bell icon, dropdown notifications, approval workflow notifications
- **Email Integration** - User emails configured for admin and director
- **Schedules** - Scheduling system
- **History** - Activity tracking

## Quick Start Guide

### To run the development server:
```bash
bun dev
```

### To build for production:
```bash
bun build
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Consider adding real database (currently uses mock data)
- [ ] Add testing setup
- [ ] Deploy to production

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| Now | LabHouse Equipment Management integrated |
| Recent | Database Backup & Restore feature implemented with JSON export/import, auto backup config, backup history, and 2FA-style restore confirmation |
| Today | Training Module implemented with 3-tab layout, automation for device permissions and status changes |
