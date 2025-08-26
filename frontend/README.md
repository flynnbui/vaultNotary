# VaultNotary Frontend

A modern, responsive web application for notary document management built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Auth0 for secure user management
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with React Query
- **UI Components**: Radix UI primitives + custom components
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Internationalization**: i18next

## 🏗️ Architecture

The frontend follows a modular architecture with clear separation of concerns:

```
VaultNotary.Frontend/
├── project/
│   ├── app/                          # Next.js App Router
│   │   ├── customers/               # Customer management pages
│   │   ├── documents/               # Document management pages
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Homepage
│   │
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── forms/              # Form components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── providers/          # Context providers
│   │   │   └── ui/                 # shadcn/ui components
│   │   │
│   │   ├── config/                 # Configuration files
│   │   │   ├── api.tsx             # API configuration
│   │   │   └── fileValidation.ts   # File validation rules
│   │   │
│   │   ├── features/               # Feature-based modules
│   │   │   ├── auth/               # Authentication services
│   │   │   ├── customers/          # Customer management
│   │   │   └── documents/          # Document management
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utility libraries
│   │   ├── shared/                 # Shared components/utils
│   │   └── types/                  # TypeScript type definitions
│   │
│   ├── public/                     # Static assets
│   ├── middleware.ts               # Next.js middleware
│   ├── next.config.js              # Next.js configuration
│   └── tailwind.config.ts          # Tailwind configuration
│
└── Dockerfile                      # Docker configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Backend API running (see backend README)

### Installation

1. **Clone and navigate to frontend:**
   ```bash
   git clone <repository-url>
   cd vaultNotary/frontend/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

### Required Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10

# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_SCOPE=openid profile email read:documents write:documents

# Session Configuration
AUTH0_SESSION_ROLLING_DURATION=86400
AUTH0_SESSION_ABSOLUTE_DURATION=604800
```

### Development vs Production

#### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
AUTH0_BASE_URL=http://localhost:3000
```

#### Production (.env.production.local)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
AUTH0_BASE_URL=https://yourdomain.com
```

## 🎨 UI Components & Design System

### Component Library

Built on top of [shadcn/ui](https://ui.shadcn.com/) with custom enhancements:

- **Form Components**: Advanced form handling with validation
- **Data Tables**: Sortable, filterable, and paginated tables
- **File Upload**: Drag-and-drop file upload with progress
- **Search & Filters**: Advanced search and filtering components
- **Customer Management**: Comprehensive customer CRUD operations
- **Document Management**: Document creation and management tools

### Color Scheme

```css
/* Primary Brand Color */
--primary: #800020; /* Burgundy - represents trust and professionalism */

/* Supporting Colors */
--secondary: #64748b; /* Slate gray for secondary actions */
--accent: #059669; /* Green for success states */
--warning: #d97706; /* Orange for warnings */
--destructive: #dc2626; /* Red for destructive actions */
```

### Typography

- **Headings**: Inter font family for clarity
- **Body**: System font stack for optimal readability
- **Code**: Monospace for code and ID displays

## 🔐 Authentication & Security

### Auth0 Integration

```typescript
// User profile access
const { user, isLoading } = useUser();

// Protected routes
<ProtectedRoute>
  <CustomerManagement />
</ProtectedRoute>

// API calls with authentication
const { data } = await authenticatedApiCall('/customers');
```

### Permission-Based Access Control

```typescript
// Check user permissions
const hasWriteAccess = user?.permissions?.includes('write:documents');

// Conditional rendering
{hasWriteAccess && (
  <Button onClick={handleCreate}>Create Document</Button>
)}
```

### Security Features

- **JWT Token Management**: Automatic token refresh and validation
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Content sanitization and CSP headers
- **Secure Headers**: Security headers via Next.js middleware
- **Input Validation**: Client-side and server-side validation

## 📱 Features

### Customer Management
- **CRUD Operations**: Create, read, update, delete customers
- **Advanced Search**: Search by ID, name, phone, email
- **ID Validation**: CMND/CCCD and Passport validation
- **Duplicate Detection**: Prevent duplicate customer entries
- **Bulk Operations**: Bulk delete and export
- **Responsive Design**: Mobile-first responsive interface

### Document Management
- **Document Creation**: Create and manage notary documents
- **File Upload**: Secure file upload with progress tracking
- **Party Management**: Link customers to documents as parties
- **Document Status**: Track document status and workflow
- **File Organization**: Organize and categorize documents

### User Experience
- **Dark/Light Mode**: System preference and manual toggle
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Graceful error handling with user feedback
- **Offline Support**: Basic offline functionality
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Testing

### Test Setup

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

### Testing Libraries

- **Vitest**: Fast unit testing framework
- **Playwright**: End-to-end testing
- **Testing Library**: React component testing utilities

### Test Structure

```
tests/
├── __mocks__/              # Mock implementations
├── components/             # Component tests
├── features/               # Feature tests
├── hooks/                  # Custom hook tests
├── pages/                  # Page tests
└── utils/                  # Utility function tests
```

## 🏗️ Build & Deployment

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Docker Deployment

```bash
# Build Docker image
docker build -t vaultnotary-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
  -e AUTH0_SECRET=your-secret \
  vaultnotary-frontend
```

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

## 🎯 Performance Optimization

### Next.js Optimizations

- **App Router**: Latest Next.js routing system
- **Server Components**: Optimal rendering strategy
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Bundle Analysis**: Bundle size monitoring

### Performance Monitoring

```bash
# Analyze bundle size
npm run analyze

# Performance audit
npm run lighthouse
```

### Best Practices

- **Lazy Loading**: Components and images lazy loaded
- **Caching**: API response caching with React Query
- **Prefetching**: Link prefetching for faster navigation
- **Compression**: Gzip/Brotli compression enabled
- **CDN**: Static assets served via CDN

## 🔄 State Management

### Zustand Store Structure

```typescript
// Global state management
interface AppState {
  // User state
  user: User | null;
  setUser: (user: User) => void;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  
  // Customer state
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
}
```

### Local State with React Query

```typescript
// Server state management
const { data: customers, isLoading, error } = useQuery({
  queryKey: ['customers'],
  queryFn: fetchCustomers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 🌐 API Integration

### API Service Structure

```typescript
// Customer service
class CustomerApiService {
  async getCustomers(params: CustomerParams): Promise<PagedResult<Customer>> {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  }
  
  async createCustomer(customer: CreateCustomerType): Promise<string> {
    const response = await apiClient.post('/customers', customer);
    return response.data.id;
  }
}
```

### Error Handling

```typescript
// Global error handler
class ErrorHandler {
  static handleApiError(error: ApiError, context: string) {
    if (error.response?.status === 401) {
      // Handle authentication errors
      redirectToLogin();
    } else if (error.response?.status === 403) {
      // Handle authorization errors
      showPermissionError();
    } else {
      // Handle general errors
      showErrorToast(error.message);
    }
  }
}
```

## 🎨 Custom Components

### Form Components

```typescript
// Customer form with validation
<CustomerForm
  initialData={customer}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  validationSchema={customerSchema}
/>
```

### Data Display

```typescript
// Customer table with actions
<CustomerTable
  customers={customers}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBulkDelete={handleBulkDelete}
  loading={isLoading}
/>
```

## 📱 Mobile Responsiveness

### Breakpoint Strategy

```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
  
  @media (min-width: 640px) {
    /* Tablet styles */
  }
  
  @media (min-width: 1024px) {
    /* Desktop styles */
  }
}
```

### Touch-Friendly Design

- Minimum 44px touch targets
- Swipe gestures for mobile navigation
- Optimized form inputs for mobile devices
- Responsive typography scaling

## 🌍 Internationalization

### i18next Configuration

```typescript
// Language configuration
const resources = {
  vi: {
    common: {
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
    },
  },
};
```

### Usage

```typescript
// In components
const { t } = useTranslation('common');

return (
  <Button>{t('save')}</Button>
);
```

## 🔧 Development Tools

### VS Code Extensions

- ESLint
- Prettier
- TypeScript Hero
- Auto Import - ES6, TS, JSX, TSX
- Tailwind CSS IntelliSense

### Code Quality

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

## 📊 Analytics & Monitoring

### Error Tracking

```typescript
// Error boundary with logging
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logger.error('Component Error:', error, errorInfo);
  }
}
```

### Performance Monitoring

- Core Web Vitals tracking
- User interaction analytics
- Page load performance metrics
- API response time monitoring
---

**Built with ❤️ using Next.js 15 and modern React patterns**
