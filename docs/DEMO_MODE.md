# Demo Mode

This document explains the environment-based demo mode feature for the Portfolio admin dashboard.

## Overview

Demo mode allows visitors to explore the admin dashboard functionality without requiring real authentication. When enabled, users can select from pre-configured demo accounts to experience different access levels.

## Environment Variable

Demo mode is controlled by the `VITE_DEMO_MODE` environment variable:

```bash
# Enable demo mode
VITE_DEMO_MODE=true

# Disable demo mode (default)
VITE_DEMO_MODE=false
```

## How It Works

### When Demo Mode is Enabled (`VITE_DEMO_MODE=true`)

1. **Login Page**: Instead of showing a traditional login form, the login page displays a demo account selector
2. **Demo Accounts**: Two pre-configured demo users are available:
   - **Admin Demo**: Full access to all dashboard features
   - **Viewer Demo**: Read-only access with restricted features
3. **Session Persistence**: Demo user selection is stored in sessionStorage for the current browser session
4. **Clear Indication**: A "Demo Mode" badge is visible throughout the admin dashboard

### When Demo Mode is Disabled (`VITE_DEMO_MODE=false`)

1. **Login Page**: Shows a standard email/password login form
2. **Real Authentication**: Integrates with your authentication provider (Firebase, Auth0, etc.)
3. **Protected Routes**: Admin routes require actual authentication

## Architecture

### Files

- `/src/context/auth-context.tsx` - Authentication context with demo mode support
- `/src/pages/Login.tsx` - Login page with demo/real auth switching
- `/src/pages/Admin.tsx` - Admin dashboard
- `/src/components/auth/ProtectedRoute.tsx` - Route protection component

### Demo Users

```typescript
const DEMO_USERS = [
  {
    id: 'demo-admin',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    role: 'admin',
  },
  {
    id: 'demo-viewer',
    name: 'Viewer Demo',
    email: 'viewer@demo.com',
    role: 'viewer',
  },
]
```

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | Login/demo selector page | No |
| `/admin` | Admin dashboard | Yes |
| `/` | Public portfolio (unchanged) | No |

## Usage

### Local Development

Create a `.env.local` file:

```bash
VITE_DEMO_MODE=true
```

### Production (Render)

The `render.yaml` is configured to enable demo mode by default:

```yaml
envVars:
  - key: VITE_DEMO_MODE
    value: "true"
```

To disable demo mode in production, update the environment variable in the Render dashboard or modify `render.yaml`:

```yaml
envVars:
  - key: VITE_DEMO_MODE
    value: "false"
```

## Security Considerations

1. **Demo mode is for showcasing only**: No real data is modified
2. **Session-based**: Demo sessions are not persisted across browser restarts
3. **Clear visual indicators**: Users always know they're in demo mode
4. **No sensitive operations**: Demo accounts cannot perform destructive actions

## Extending Demo Mode

### Adding New Demo Users

Edit `/src/context/auth-context.tsx`:

```typescript
const DEMO_USERS = [
  // ... existing users
  {
    id: 'demo-editor',
    name: 'Editor Demo',
    email: 'editor@demo.com',
    role: 'editor',
  },
]
```

### Adding Role Checks

Use the `useAuth` hook in components:

```typescript
import { useAuth } from '@/context/auth-context'

function MyComponent() {
  const { user, isDemoMode } = useAuth()

  if (user?.role !== 'admin') {
    return <p>Admin access required</p>
  }

  return <AdminFeature />
}
```

## Testing

1. Set `VITE_DEMO_MODE=true` in your environment
2. Navigate to `/login`
3. Select a demo account
4. Explore the admin dashboard
5. Verify role-based access restrictions work correctly
