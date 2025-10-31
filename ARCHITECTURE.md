# MedScan Africa - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Application                        │
│                     (React Native + Expo)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Home   │  │   Scan   │  │ Donation │  │ Clinics  │       │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AI Model     │  │  Storage     │  │   Hedera     │         │
│  │ Service      │  │  Service     │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   TensorFlow     │  │    Supabase      │  │     Hedera       │
│   Lite Models    │  │   (Database +    │  │   Hashgraph      │
│                  │  │    Storage)      │  │   (Blockchain)   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Component Architecture

### 1. Frontend Layer (React Native + Expo)

#### Navigation Structure
```
app/
├── index.tsx                    # Entry point, auth check
├── (auth)/                      # Auth group
│   ├── login.tsx               # Login screen
│   └── signup.tsx              # Registration screen
├── (tabs)/                      # Main app tabs
│   ├── _layout.tsx             # Tab navigator
│   ├── index.tsx               # Home/Dashboard
│   ├── scan.tsx                # Scan upload
│   ├── scan-result.tsx         # AI results
│   ├── donations.tsx           # Donation feed
│   ├── clinics.tsx             # Clinic directory
│   └── profile.tsx             # User profile
├── create-donation.tsx         # Modal: Create request
└── admin.tsx                   # Admin dashboard
```

#### Component Hierarchy
```
RootLayout (AuthProvider)
├── Stack Navigator
│   ├── (auth) - Auth Group
│   │   ├── Login Screen
│   │   └── Signup Screen
│   └── (tabs) - Main App
│       ├── Tab Navigator
│       │   ├── Home Tab
│       │   ├── Scan Tab
│       │   ├── Donations Tab
│       │   ├── Clinics Tab
│       │   └── Profile Tab
│       ├── Scan Result (Modal)
│       ├── Create Donation (Modal)
│       └── Admin Dashboard (Modal)
```

### 2. Context Layer

#### AuthContext
```typescript
AuthProvider
├── State
│   ├── user: User | null
│   ├── profile: Profile | null
│   ├── session: Session | null
│   └── loading: boolean
├── Actions
│   ├── signUp(email, password, name, country)
│   ├── signIn(email, password)
│   ├── signOut()
│   └── refreshProfile()
└── Listeners
    └── onAuthStateChange
```

### 3. Service Layer

#### AI Model Service
```typescript
AIModelService
├── Models
│   ├── brainModel: TFLiteModel
│   ├── heartModel: TFLiteModel
│   └── eyeModel: TFLiteModel
├── Methods
│   ├── loadModels()
│   ├── analyzeScan(type, imageUri)
│   ├── preprocessImage(uri)
│   ├── generateHeatmap(type, imageUri)
│   └── processPrediction(result)
└── Output
    ├── confidence: number
    ├── condition: string
    ├── riskLevel: RiskLevel
    └── recommendation: string
```

#### Storage Service
```typescript
StorageService
├── Buckets
│   ├── medical-scans
│   └── documents
├── Methods
│   ├── uploadScanImage(userId, type, uri)
│   ├── uploadDocument(userId, type, uri)
│   └── getPublicUrl(path)
└── Processing
    ├── Base64 encoding
    ├── Content type detection
    └── File compression
```

#### Hedera Service
```typescript
HederaService
├── Client
│   └── Hedera Client (testnet/mainnet)
├── Methods
│   ├── initialize()
│   ├── sendDonation(recipient, amount, currency)
│   ├── verifyTransaction(txId)
│   └── getAccountBalance(address)
└── Smart Contracts
    ├── DonationEscrow
    ├── createRequest()
    ├── donate()
    ├── verifyRequest()
    └── releaseFunds()
```

### 4. Database Layer (Supabase PostgreSQL)

#### Table Relationships
```
┌─────────────┐
│  profiles   │
└──────┬──────┘
       │ 1:N
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌─────────────────┐
│medical_scans │  │donation_requests│
└──────────────┘  └────────┬────────┘
                           │ 1:N
                           ▼
                    ┌──────────┐
                    │donations │
                    └──────────┘

┌─────────┐
│ clinics │
└────┬────┘
     │ 1:N
     ▼
┌─────────┐
│ doctors │
└────┬────┘
     │ 1:N
     ▼
┌──────────────┐
│consultations │
└──────────────┘
```

#### Row Level Security Policies

**Profiles Table:**
- Users can SELECT/UPDATE own profile
- Admins can SELECT all profiles

**Medical Scans Table:**
- Users can SELECT/INSERT/DELETE own scans
- Doctors can SELECT patient scans (with consent)

**Donation Requests Table:**
- Users can SELECT/INSERT/UPDATE own requests
- Anyone can SELECT verified requests
- Admins can UPDATE verification status

**Donations Table:**
- Anyone can SELECT (transparency)
- Authenticated users can INSERT donations

**Clinics/Doctors Tables:**
- Anyone can SELECT verified clinics/doctors
- Admins can INSERT/UPDATE/DELETE

## Data Flow

### Scan Analysis Flow
```
User uploads image
       │
       ▼
Storage Service saves to Supabase Storage
       │
       ▼
AI Model Service processes image
       │
       ├─→ Preprocess (resize, normalize)
       ├─→ Run inference (TFLite)
       ├─→ Generate heatmap (Grad-CAM)
       └─→ Process prediction
       │
       ▼
Save results to medical_scans table
       │
       ▼
Display results to user
       │
       ▼
Offer clinic consultation if high risk
```

### Donation Flow
```
User creates donation request
       │
       ▼
Upload supporting documents
       │
       ▼
Save to donation_requests (status: pending)
       │
       ▼
Admin/Verifier reviews request
       │
       ├─→ Approve → verification_status: verified
       └─→ Reject → verification_status: rejected
       │
       ▼
Verified request appears in feed
       │
       ▼
Donors contribute via Hedera
       │
       ├─→ Create Hedera transaction
       ├─→ Save to donations table
       └─→ Update amount_raised
       │
       ▼
Funds released to beneficiary wallet
```

### Authentication Flow
```
User enters credentials
       │
       ▼
Supabase Auth validates
       │
       ├─→ Success
       │   ├─→ Create/fetch profile
       │   ├─→ Set session
       │   └─→ Navigate to app
       │
       └─→ Failure
           └─→ Display error
```

## Security Architecture

### Authentication
- JWT-based session management
- Secure token storage
- Automatic token refresh
- Session persistence across app restarts

### Authorization
- Row Level Security (RLS) on all tables
- Policy-based access control
- Role-based permissions (user, admin, verifier)
- Attribute-based access (user_id matching)

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS/TLS)
- Secure environment variables
- No sensitive data in client code

### API Security
- Rate limiting (Supabase)
- Input validation
- SQL injection prevention (parameterized queries)
- XSS protection

## Scalability Considerations

### Performance Optimization
- Image compression before upload
- Lazy loading for lists
- Caching with React Query (future)
- Pagination for large datasets
- Optimized database queries with indexes

### Horizontal Scaling
- Stateless services
- Database connection pooling
- CDN for static assets
- Load balancing (Supabase handles)

### Model Optimization
- TensorFlow Lite for mobile
- Model quantization (float16)
- On-device inference (no server calls)
- Batch processing for multiple scans

## Monitoring & Analytics

### Application Metrics
- User registrations
- Scan uploads
- Donation amounts
- Clinic consultations
- Error rates

### Performance Metrics
- API response times
- Model inference time
- App load time
- Crash rates

### Business Metrics
- Active users (DAU/MAU)
- Scan completion rate
- Donation conversion rate
- Clinic referral rate

## Deployment Architecture

### Development
```
Local Development
├── Expo Dev Server (port 8081)
├── Supabase Project (development)
└── Mock services (AI, Hedera)
```

### Staging
```
Expo Preview
├── Supabase Project (staging)
├── Hedera Testnet
└── Test AI models
```

### Production
```
App Stores (iOS/Android)
├── Supabase Project (production)
├── Hedera Mainnet
├── Production AI models
└── CDN (assets)
```

## Integration Points

### External Services
1. **Supabase**
   - Database (PostgreSQL)
   - Authentication
   - Storage
   - Real-time subscriptions

2. **Hedera Hashgraph**
   - Transaction execution
   - Smart contracts
   - Wallet integration
   - Mirror node queries

3. **TensorFlow Lite**
   - On-device ML inference
   - Model loading
   - Tensor operations

### Future Integrations
- Push notifications (Expo Notifications)
- Email service (SendGrid/Postmark)
- SMS notifications (Twilio)
- Payment gateway (Stripe/Paystack)
- Analytics (Mixpanel/Amplitude)
- Error tracking (Sentry)

## Development Best Practices

### Code Organization
- Feature-based structure
- Separation of concerns
- Single responsibility principle
- DRY (Don't Repeat Yourself)

### Type Safety
- TypeScript for all code
- Strict type checking
- Interface definitions
- Type guards

### Testing Strategy
- Unit tests for services
- Integration tests for API calls
- E2E tests for critical flows
- Mock data for development

### Documentation
- Code comments for complex logic
- README for setup
- API documentation
- Architecture diagrams

## Disaster Recovery

### Data Backup
- Supabase automatic backups
- Point-in-time recovery
- Database replication

### Incident Response
1. Monitor error rates
2. Identify root cause
3. Deploy hotfix
4. Post-mortem analysis

### Business Continuity
- Graceful degradation
- Offline mode (future)
- Service failover
- Communication plan
