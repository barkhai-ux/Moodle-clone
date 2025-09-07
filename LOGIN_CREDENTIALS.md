# Login Credentials

## Test Accounts

The following hardcoded credentials are available for testing and deployment:

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** ADMIN
- **Access:** Full administrative access to all features

### Teacher Account
- **Email:** `teacher@example.com`
- **Password:** `password123`
- **Role:** TEACHER
- **Access:** Course management, grading, announcements

### Student Account
- **Email:** `student@example.com`
- **Password:** `password123`
- **Role:** STUDENT
- **Access:** Course enrollment, assignments, grades, chat

## How It Works

1. **Primary Authentication:** The system first tries to authenticate against the database
2. **Fallback Authentication:** If database authentication fails (e.g., during deployment), it falls back to hardcoded credentials
3. **Database Seeding:** The `postbuild` script automatically seeds the database with test data during deployment

## Security Note

These are test credentials for development and deployment purposes. In a production environment, you should:
- Remove hardcoded credentials
- Use proper authentication providers (OAuth, etc.)
- Implement proper password policies
- Use environment variables for sensitive data
