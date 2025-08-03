# TinyMCE Setup Guide

## Overview
The meeting details page now includes a TinyMCE rich text editor for adding and editing meeting minutes.

## Setup Instructions

### 1. Get a Free TinyMCE API Key
1. Go to [TinyMCE Cloud](https://www.tiny.cloud/auth/signup/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure the API Key

#### Option A: Environment Variable (Recommended)
Create a `.env` file in the root directory and add:
```
REACT_APP_TINYMCE_API_KEY=your-actual-api-key-here
```

#### Option B: Direct Configuration
Edit `src/config/tinymce.ts` and replace:
```typescript
export const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY || 'your-actual-api-key-here';
```

### 3. Features Added

#### Meeting Minutes Tab
- Rich text editor with formatting options
- Save functionality that calls `/api/Meeting/{meetingId}/minutes`
- Loads existing minutes when available
- Auto-saves content to state

#### API Integration
The save button calls the API with the following payload:
```json
{
  "meetingId": 0,
  "meetingMinutes": "string"
}
```

#### Editor Features
- Text formatting (bold, italic, etc.)
- Lists (bulleted and numbered)
- Text alignment
- Color options
- Full-screen mode
- Word count
- Undo/redo functionality

### 4. Usage
1. Navigate to a meeting details page
2. Click on the "Meeting Minutes" tab
3. Use the rich text editor to write meeting minutes
4. Click "Save Meeting Minutes" to save

### 5. File Structure
- `src/components/meetings/MeetingDetailsPage.tsx` - Main component with editor
- `src/config/tinymce.ts` - Configuration file
- `TINYMCE_SETUP.md` - This setup guide

### 6. Dependencies
The following package has been added:
- `@tinymce/tinymce-react` - React wrapper for TinyMCE

### 7. Notes
- The editor is only available to users with admin privileges (Secretary, President, Treasurer)
- Minutes are saved per meeting
- The editor loads existing minutes if available
- All changes are saved to the backend via the API 