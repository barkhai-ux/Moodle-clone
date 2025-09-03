# Avatar Selection Feature

## Overview
Students can now customize their profile by selecting an avatar from predefined options or uploading their own image. This feature is available in the student dashboard and profile pages.

## Features

### Avatar Selection Options
1. **Predefined Avatars**: 12 different avatar options generated using DiceBear API
2. **Custom Image Upload**: Students can upload their own profile picture
3. **Real-time Preview**: See how the avatar looks before saving
4. **Easy Access**: Avatar selector is available in multiple locations

### Where to Find the Avatar Selector
- **Student Dashboard**: Profile tab and Portfolio tab
- **Profile Page**: Main profile page (`/profile`)
- **Visual Indicator**: Small camera icon button positioned over the avatar

### How to Use

1. **Access the Avatar Selector**:
   - Navigate to the student dashboard or profile page
   - Look for the camera icon button on your current avatar
   - Click the "Change Avatar" button

2. **Choose a Predefined Avatar**:
   - Browse through the 12 predefined avatar options
   - Click on any avatar to select it
   - The selected avatar will be highlighted with a blue border

3. **Upload a Custom Image**:
   - Click "Choose Image" in the upload section
   - Select an image file from your device
   - The image will be previewed immediately
   - Click the X button to remove the uploaded image if needed

4. **Save Your Selection**:
   - Review your selection in the preview area
   - Click "Save Avatar" to apply the changes
   - A success toast notification will appear
   - The dialog will close automatically

### Technical Implementation

#### Components
- `AvatarSelector`: Main component for avatar selection
- `Avatar`: UI component for displaying avatars
- `Dialog`: Modal dialog for the selection interface

#### API Endpoints
- `PUT /api/user/profile`: Updates user avatar
- `GET /api/user/profile`: Retrieves user profile data

#### Data Flow
1. User selects/uploads avatar
2. Avatar URL is sent to the API
3. Database is updated with new avatar URL
4. User context is refreshed with new data
5. UI updates to show new avatar

### File Structure
```
components/ui/avatar-selector.tsx    # Main avatar selector component
app/api/user/profile/route.ts        # Profile update API
contexts/AuthContext.tsx             # Updated with avatar functionality
lib/data-service.ts                  # Added profile update methods
```

### Dependencies
- DiceBear API for predefined avatars
- File upload handling for custom images
- Toast notifications for user feedback
- Prisma for database operations

### Error Handling
- Invalid file type validation
- Network error handling
- Database update error handling
- User feedback through toast notifications

### Future Enhancements
- Avatar cropping functionality
- More predefined avatar options
- Avatar categories (professional, casual, etc.)
- Avatar history/undo functionality
