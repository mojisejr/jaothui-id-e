# API Documentation
## Jaothui ID-Trace System

### Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [User Management](#user-management)
   - [Farm Management](#farm-management)
   - [Animal Management](#animal-management)
   - [Activity Management](#activity-management)
   - [Notification Management](#notification-management)
7. [Rate Limiting](#rate-limiting)
8. [Security](#security)
9. [Examples](#examples)

### Overview

The Jaothui ID-Trace API provides RESTful endpoints for managing buffalo farm operations, including user authentication, farm management, animal tracking, and activity logging. All endpoints require appropriate authentication and follow RESTful conventions.

### Authentication

#### Authentication Methods
1. **LINE OAuth**: For farm owners
2. **Username/Password**: For farm staff

#### Session Management
- Sessions are managed via HTTP-only secure cookies
- Session tokens include user ID, role, and farm membership information
- Automatic session expiration after 7 days of inactivity

#### Authorization Headers
```http
Authorization: Bearer <session-token>
Cookie: session=<session-id>
```

### Base URL

```
Production: https://jaothui-id-trace.vercel.app/api
Development: http://localhost:3000/api
```

### Response Format

All API responses follow a consistent JSON format:

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-11-12T07:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-11-12T07:30:00.000Z"
}
```

### Error Handling

#### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

#### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context (optional)"
  },
  "requestId": "uuid-for-tracking"
}
```

### API Endpoints

#### Authentication Endpoints

##### POST /auth/[...betterAuth]
Handles all authentication routes via `better-auth`, including:
- `/api/auth/signin/line`
- `/api/auth/callback/line`
- `/api/auth/signin/credentials`
- `/api/auth/signout`
- `/api/auth/session`

Refer to `better-auth` documentation for detailed request and response formats. The system uses LINE (OIDC) and Credentials providers.

##### GET /auth/me
Get current user information and permissions.

**Headers:**
```http
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "staff_username",
      "firstName": "มานี",
      "lastName": "รักษา",
      "role": "STAFF"
    },
    "farms": [
      {
        "id": "farm-uuid",
        "name": "ฟาร์มสมศรี",
        "role": "MEMBER",
        "permissions": ["animal:read", "activity:create", "activity:update"]
      }
    ]
  }
}
```

#### Farm Management

##### GET /api/farm
Retrieve the authenticated user's farm information.

**Headers:**
```http
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "farm": {
    "id": "farm-uuid",
    "name": "ฟาร์มของฉัน",
    "province": "นนทบุรี",
    "ownerId": "user-uuid",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-11-10T14:20:00.000Z"
  }
}
```

##### POST /api/farm
Ensures a farm exists for the authenticated user. If not, it creates one with default values.

**Headers:**
```http
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "farm": {
    "id": "new-farm-uuid",
    "name": "ฟาร์มของฉัน",
    "province": "ไม่ระบุ",
    "ownerId": "user-uuid",
    "createdAt": "2025-11-12T07:30:00.000Z",
    "updatedAt": "2025-11-12T07:30:00.000Z"
  }
}
```

##### PUT /api/farm
Updates the authenticated user's farm information.

**Headers:**
```http
Authorization: Bearer <session-token>
```

**Request Body:**
```json
{
  "name": "ฟาร์มใหม่",
  "province": "ขอนแก่น"
}
```

**Response:**
```json
{
  "farm": {
    "id": "farm-uuid",
    "name": "ฟาร์มใหม่",
    "province": "ขอนแก่น",
    "ownerId": "user-uuid",
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-11-12T07:30:00.000Z"
  }
}
```

#### Animal Management

##### GET /api/animals
List animals with cursor-based pagination.

**Query Parameters:**
- `cursor` (string, optional): ISO timestamp for pagination.
- `search` (string, optional): Search by tag ID or name.
- `status` (string, optional): Filter by status (ACTIVE, TRANSFERRED, DECEASED, SOLD).

**Response:**
```json
{
  "animals": [
    {
      "id": "animal-uuid",
      "tagId": "001",
      "name": "นาเดีย",
      "type": "WATER_BUFFALO",
      "gender": "FEMALE",
      "status": "ACTIVE",
      "birthDate": "2019-03-15T00:00:00.000Z",
      "color": "ดำ",
      "weightKg": 450.5,
      "heightCm": 145,
      "motherTag": "M001",
      "fatherTag": "F001",
      "imageUrl": "https://storage.supabase.co/...",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "notificationCount": 2
    }
  ],
  "nextCursor": "2025-01-14T10:00:00.000Z",
  "hasMore": true,
  "pendingActivitiesCount": 5
}
```

##### POST /api/animals
Create a new animal record. The `farmId` is automatically inferred from the user's session.

**Request Body (application/json):**
```json
{
  "tagId": "002",
  "type": "WATER_BUFFALO",
  "name": "ทองดี",
  "gender": "MALE",
  "birthDate": "2023-05-20T00:00:00.000Z",
  "color": "น้ำตาล",
  "weightKg": 520,
  "heightCm": 150,
  "motherTag": "M001",
  "fatherTag": "F002",
  "genome": "optional-genome-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "new-animal-uuid",
      "tagId": "002",
      "name": "ทองดี",
      "type": "WATER_BUFFALO",
      "gender": "MALE",
      "status": "ACTIVE",
      "birthDate": "2023-05-20T00:00:00.000Z",
      "color": "น้ำตาล",
      "weightKg": 520,
      "heightCm": 150,
      "motherTag": "M001",
      "fatherTag": "F002",
      "genome": "optional-genome-data",
      "imageUrl": null,
      "farmId": "farm-uuid",
      "createdAt": "2025-11-12T07:30:00.000Z"
    }
  },
  "message": "เพิ่มกระบือสำเร็จแล้ว"
}
```

##### GET /api/animals/{animalId}
Get detailed animal information.

**Path Parameters:**
- `animalId` (string, required): Animal UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "animal-uuid",
      "tagId": "001",
      "name": "นาเดีย",
      "type": "WATER_BUFFALO",
      "gender": "FEMALE",
      "status": "ACTIVE",
      "birthDate": "2022-03-15T00:00:00.000Z",
      "color": "ดำ",
      "weightKg": 450.5,
      "heightCm": 145,
      "motherTag": "M001",
      "fatherTag": "F001",
      "genome": null,
      "imageUrl": null,
      "farmId": "farm-uuid",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-11-10T14:20:00.000Z",
      "farm": {
        "id": "farm-uuid",
        "name": "ฟาร์มของฉัน",
        "ownerId": "user-uuid"
      }
    }
  }
}
```

##### PUT /api/animals/{animalId}
Update animal information.

**Path Parameters:**
- `animalId` (string, required): Animal UUID

**Request Body (application/json):**
```json
{
  "name": "นาเดียทองคำ",
  "color": "ดำเข้ม",
  "weightKg": 465,
  "heightCm": 147,
  "motherTag": "M002",
  "fatherTag": "F001",
  "genome": "updated-genome-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "animal-uuid",
      "tagId": "001",
      "name": "นาเดียทองคำ",
      "color": "ดำเข้ม",
      "weightKg": 465,
      "heightCm": 147,
      "motherTag": "M002",
      "fatherTag": "F001",
      "genome": "updated-genome-data",
      "updatedAt": "2025-11-12T07:30:00.000Z"
    }
  },
  "message": "อัปเดตข้อมูลกระบือสำเร็จแล้ว"
}
```

##### DELETE /api/animals/{animalId}
Soft delete an animal by changing its status.

**Path Parameters:**
- `animalId` (string, required): Animal UUID

**Request Body (application/json):**
```json
{
  "status": "TRANSFERRED",
  "reason": "ขายย้ายฟาร์ม"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "animal": {
      "id": "animal-uuid",
      "status": "TRANSFERRED",
      "updatedAt": "2025-11-12T07:30:00.000Z"
    }
  },
  "message": "เปลี่ยนสถานะกระบือเป็น TRANSFERRED สำเร็จแล้ว"
}
```

#### Activity Management

##### GET /api/activities
List activities with filtering and pagination. `farmId` is automatically determined from the authenticated user's session.

**Query Parameters:**
- `animalId` (string, optional): Filter by a specific animal's UUID.
- `status` (string, optional): Filter by status. Can be a single status or a comma-separated list (e.g., `PENDING,OVERDUE`). Valid statuses: `PENDING`, `COMPLETED`, `CANCELLED`, `OVERDUE`.
- `startDate` (string, optional): Start date for filtering (ISO 8601 format, e.g., `2025-01-01`).
- `endDate` (string, optional): End date for filtering (ISO 8601 format, e.g., `2025-12-31`).
- `page` (integer, optional): Page number for pagination (default: 1).
- `limit` (integer, optional): Items per page (default: 20).

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity-uuid",
        "farmId": "farm-uuid",
        "animalId": "animal-uuid",
        "title": "ให้อาหาร",
        "description": "อาหารเม็ด 2 กก.",
        "activityDate": "2025-11-12T00:00:00.000Z",
        "dueDate": null,
        "status": "PENDING",
        "statusReason": null,
        "createdBy": "user-uuid",
        "completedBy": null,
        "completedAt": null,
        "createdAt": "2025-11-12T07:30:00.000Z",
        "updatedAt": "2025-11-12T07:30:00.000Z",
        "animal": {
          "id": "animal-uuid",
          "tagId": "001",
          "name": "นาเดีย"
        },
        "creator": {
          "id": "user-uuid",
          "firstName": "สมชาย",
          "lastName": "ใจดี"
        },
        "completer": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "timestamp": "2025-11-12T08:00:00.000Z"
}
```

##### POST /api/activities
Create a new activity. `farmId` and `createdBy` are automatically set from the user's session.

**Request Body (application/json):**
```json
{
  "animalId": "animal-uuid",
  "title": "ตรวจสุขภาพ",
  "description": "ตรวจสุขภาพทั่วไป วัดอุณหภูมิ",
  "activityDate": "2025-11-15T00:00:00.000Z",
  "dueDate": "2025-11-15T00:00:00.000Z",
  "status": "PENDING"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "new-activity-uuid",
      "farmId": "farm-uuid",
      "animalId": "animal-uuid",
      "title": "ตรวจสุขภาพ",
      "description": "ตรวจสุขภาพทั่วไป วัดอุณหภูมิ",
      "activityDate": "2025-11-15T00:00:00.000Z",
      "dueDate": "2025-11-15T00:00:00.000Z",
      "status": "PENDING",
      "createdBy": "user-uuid",
      "createdAt": "2025-11-12T07:30:00.000Z",
      // ... other fields
    }
  },
  "message": "สร้างกิจกรรมสำเร็จแล้ว"
}
```

##### GET /api/activities/{activityId}
Get detailed information for a single activity.

**Path Parameters:**
- `activityId` (string, required): Activity UUID.

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "activity-uuid",
      "title": "ตรวจสุขภาพ",
      "description": "ตรวจสุขภาพทั่วไป วัดอุณหภูมิ",
      "activityDate": "2025-11-15T00:00:00.000Z",
      "status": "COMPLETED",
      "completedAt": "2025-11-15T14:00:00.000Z",
      "animal": {
        "id": "animal-uuid",
        "tagId": "001",
        "name": "นาเดีย"
      },
      "creator": {
        "id": "user-uuid",
        "firstName": "สมชาย",
        "lastName": "ใจดี"
      },
      "completer": {
        "id": "staff-uuid",
        "firstName": "มานี",
        "lastName": "มีนา"
      }
      // ... other fields
    }
  },
  "timestamp": "2025-11-12T08:30:00.000Z"
}
```

##### PUT /api/activities/{activityId}
Update an activity's status or details. When `status` is updated to `COMPLETED`, the `completedBy` and `completedAt` fields are automatically set.

**Path Parameters:**
- `activityId` (string, required): Activity UUID.

**Request Body (application/json):**
```json
{
  "title": "อัปเดต: ตรวจสุขภาพ",
  "description": "ตรวจสุขภาพทั่วไป วัดอุณหภูมิ (ปกติ)",
  "status": "COMPLETED",
  "statusReason": "ดำเนินการเรียบร้อย"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "activity-uuid",
      "title": "อัปเดต: ตรวจสุขภาพ",
      "status": "COMPLETED",
      "completedBy": "user-uuid",
      "completedAt": "2025-11-12T15:45:00.000Z",
      "updatedAt": "2025-11-12T15:45:00.000Z"
      // ... other fields
    }
  },
  "message": "อัปเดตกิจกรรมสำเร็จแล้ว"
}
```

#### Notification Management

##### GET /api/notifications/badge
Get notification badge count. This endpoint returns the count of all `PENDING` and `OVERDUE` activities for the user's farm, which can be used to display a notification badge in the UI.

**Query Parameters:**
- `farmId` (string, optional): This parameter is available but not required, as the farm is automatically determined from the user's session.

**Response:**
```json
{
  "success": true,
  "data": {
    "badgeCount": 3,
    "breakdown": {
      "pending": 2,
      "overdue": 1
    },
    "farmCounts": [
      {
        "farmId": "farm-uuid",
        "farmName": "ฟาร์มของฉัน",
        "count": 3
      }
    ]
  },
  "timestamp": "2025-11-12T09:00:00.000Z"
}
```

### Rate Limiting

#### Rate Limit Rules
- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user

#### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1636702800
```

#### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

### Security

#### Authentication Security
- All endpoints except `/auth/line/login` and `/auth/staff/login` require authentication
- Session tokens are JWT-based with 7-day expiration
- Passwords are hashed using Argon2 or Bcrypt

#### Data Validation
- All input data is validated using Zod schemas
- SQL injection protection via parameterized queries (Prisma)
- XSS protection with proper output encoding

#### Permission Model
- Zero-trust permission validation on all operations
- Farm membership verification for all farm-related operations
- Role-based access control (OWNER vs. MEMBER permissions)

#### HTTPS Requirements
- All API requests must use HTTPS in production
- HSTS headers enforce secure connections

### Examples

#### JavaScript/TypeScript Example

```typescript
// API Client Setup
const API_BASE_URL = 'https://jaothui-id-trace.vercel.app/api';

class JaothuiAPI {
  private sessionToken: string | null = null;

  setSession(token: string) {
    this.sessionToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.sessionToken && { Authorization: `Bearer ${this.sessionToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }

  // Staff Login
  async staffLogin(username: string, password: string) {
    return this.request('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Get Animals
  async getAnimals(farmId: string, options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams({ farmId, ...options });
    return this.request(`/animals?${params}`);
  }

  // Create Activity
  async createActivity(activityData: {
    animalId: string;
    title: string;
    description?: string;
    activityDate: string;
    dueDate?: string;
    status?: string;
  }) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Upload Animal Image
  async uploadAnimalImage(animalId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.request(`/animals/${animalId}/image`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Usage Example
const api = new JaothuiAPI();

// Login
const loginResult = await api.staffLogin('staff_username', 'password');
api.setSession(loginResult.data.sessionToken);

// Get animals
const animals = await api.getAnimals('farm-uuid', {
  status: 'ACTIVE',
  search: '001',
  page: 1,
  limit: 20
});

// Create activity
const activity = await api.createActivity({
  animalId: 'animal-uuid',
  title: 'ให้อนม',
  description: 'นมวัวนมโค 2 ลิตร',
  activityDate: '2568-11-12',
  dueDate: '2568-11-12',
  status: 'PENDING'
});
```

#### cURL Examples

```bash
# Staff Login
curl -X POST https://jaothui-id-trace.vercel.app/api/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff_username",
    "password": "secure_password"
  }'

# Get Animals
curl -X GET "https://jaothui-id-trace.vercel.app/api/animals?farmId=farm-uuid&status=ACTIVE" \
  -H "Authorization: Bearer your-session-token"

# Create Animal
curl -X POST https://jaothui-id-trace.vercel.app/api/animals \
  -H "Authorization: Bearer your-session-token" \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm-uuid",
    "tagId": "003",
    "type": "กระบือ",
    "name": "สมศรี",
    "gender": "เมีย",
    "birthDate": "2564-06-15",
    "color": "น้ำตาล"
  }'

# Upload Animal Image
curl -X POST https://jaothui-id-trace.vercel.app/api/animals/animal-uuid/image \
  -H "Authorization: Bearer your-session-token" \
  -F "image=@/path/to/buffalo-photo.jpg"

# Complete Activity
curl -X PUT https://jaothui-id-trace.vercel.app/api/activities/activity-uuid \
  -H "Authorization: Bearer your-session-token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "statusReason": "ดำเนินการสำเร็จ"
  }'
```

---

**Document Version**: 1.0
**Last Updated**: November 12, 2025
**API Version**: v1