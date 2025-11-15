# Sankalp's Compliance Middleware Integration

## Overview
This document describes the integration of Sankalp Rishab's Compliance middleware + consent tracking system into the Complete Infiverse project.

## Integration Details

### Components Added

1. **Models**
   - `Consent.js` - MongoDB model for storing user consent preferences
   - `ComplianceAuditLog.js` - Immutable audit logging with hash chaining

2. **Services**
   - `consentManager.js` - Consent management operations
   - `complianceAuditLogger.js` - Immutable audit logging service

3. **Middleware**
   - `complianceAuth.js` - API key authentication and access logging

4. **Routes**
   - `compliance.js` - RESTful API endpoints for compliance operations

### API Endpoints

Base path: `/api/compliance`

#### Authentication
- Header: `X-API-Key: uniguru-dev-key-2025`
- Optional: `X-User-ID` for user attribution

#### Endpoints

**Set Consent**
```
POST /api/compliance/consent
Content-Type: application/json
X-API-Key: uniguru-dev-key-2025

{
  "employee_id": "emp123",
  "monitoring_enabled": true,
  "retention_days": 90,
  "data_categories": ["analytics", "security"]
}
```

**Get Consent**
```
GET /api/compliance/consent/{employee_id}
X-API-Key: uniguru-dev-key-2025
```

**List All Consents**
```
GET /api/compliance/consent?active_only=true
X-API-Key: uniguru-dev-key-2025
```

**Query Audit Logs**
```
POST /api/compliance/audit-logs
Content-Type: application/json
X-API-Key: uniguru-dev-key-2025

{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "user_id": "emp123",
  "action": "set_consent",
  "limit": 100
}
```

**Apply Retention Policy**
```
POST /api/compliance/apply-retention
X-API-Key: uniguru-dev-key-2025
```

**EMS Event Forwarding**
```
POST /api/compliance/ems-forward
Content-Type: application/json
X-API-Key: uniguru-dev-key-2025

{
  "actor": "service-a",
  "action": "read",
  "resource": "employee/emp123",
  "status": "success",
  "reason": "monitoring",
  "purpose": "security",
  "ems_trace_id": "trace-xyz",
  "ems_source": "ems-system",
  "details": {"extra": "context"}
}
```

**Health Check**
```
GET /api/compliance/health
```

### Environment Variables

```env
# Compliance & Consent Tracking
COMPLIANCE_API_KEY=uniguru-dev-key-2025
AUDIT_LOG_RETENTION_DAYS=90
```

### Features

1. **Consent Management**
   - Set/get/list user consent preferences
   - Automatic expiration based on retention days
   - Data category-specific consent
   - Monitoring permission checks

2. **Immutable Audit Logging**
   - Hash-chained audit logs for tamper detection
   - Comprehensive event logging
   - Structured log querying
   - Automatic retention policy enforcement

3. **API Security**
   - API key authentication
   - Request/response logging
   - IP address and user agent tracking
   - Unauthorized access attempt logging

4. **Integration Points**
   - EMS event forwarding for external system integration
   - Retention policy automation
   - Health monitoring
   - Compliance reporting

### Usage in Infiverse

The compliance system can be integrated with existing Infiverse features:

1. **Employee Monitoring**
   - Check consent before capturing screens
   - Log all monitoring activities
   - Respect data retention preferences

2. **Attendance Tracking**
   - Audit attendance modifications
   - Track location data access
   - Log biometric data processing

3. **Task Management**
   - Audit task assignments and completions
   - Track productivity data access
   - Log performance analytics

### Example Integration

```javascript
// Check consent before monitoring
const consentManager = require('./services/consentManager');

async function captureScreen(employeeId) {
  const isAllowed = await consentManager.isMonitoringAllowed(employeeId);
  
  if (!isAllowed) {
    console.log(`Monitoring not allowed for employee ${employeeId}`);
    return null;
  }
  
  // Proceed with screen capture
  // ... existing screen capture logic
}
```

### Testing

Use the health check endpoint to verify integration:

```bash
curl -H "X-API-Key: uniguru-dev-key-2025" \
     http://localhost:5000/api/compliance/health
```

### Security Considerations

1. **API Key Management**
   - Change default API key in production
   - Use environment variables for sensitive data
   - Implement key rotation policies

2. **Data Protection**
   - Audit logs are immutable once created
   - Hash chaining prevents tampering
   - Automatic retention policy enforcement

3. **Access Control**
   - All API access is logged
   - User attribution through X-User-ID header
   - IP address and user agent tracking

## Credits

Original compliance middleware developed by **Sankalp Rishab**.
Repository: https://github.com/sankalp0709/Compliance-middleware-consent-tracking.git

Integrated into Complete Infiverse by adapting Python FastAPI code to Node.js/Express with MongoDB storage.