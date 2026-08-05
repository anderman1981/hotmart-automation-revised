# Testing Suite Documentation

## Overview

This project implements a comprehensive testing suite for the Hotmart Automation System, including unit tests, integration tests, and end-to-end tests with a minimum coverage requirement of 80%.

## Framework Stack

- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: Jest + Supertest
- **E2E Tests**: Playwright
- **Coverage**: Istanbul (built into Jest)
- **CI/CD**: GitHub Actions

## Test Structure

```
tests/
├── setup.js                 # Global test configuration and mocks
├── unit/
│   ├── agents/              # Agent unit tests
│   ├── api/                 # API endpoint tests
│   └── components/          # React component tests
├── integration/
│   ├── api.integration.test.js    # API integration tests
│   └── database.test.js          # Database operation tests
└── e2e/
    └── system.e2e.test.js        # End-to-end system tests
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:components
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run API integration tests specifically
cd tests && npm run test:api
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with headed browser (useful for debugging)
npm run test:e2e:headed

# Run specific E2E test
npx playwright test system.e2e.test.js
```

### Full Test Suite

```bash
# Run all tests with coverage
npm run test:ci
```

## Coverage Requirements

The testing suite enforces minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

Coverage reports are generated in the `coverage/` directory and can be viewed as HTML:

```bash
open coverage/lcov-report/index.html
```

## Test Categories

### Unit Tests

**Agents (motor/src/agents/)**
- Each Super Agent has comprehensive unit tests
- Tests initialization, core functionality, error handling
- Validates agent coordination and communication
- Tests data processing and decision-making logic

**API Endpoints (motor/index.js)**
- Tests all REST API endpoints
- Validates request/response formats
- Tests error handling and edge cases
- Validates authentication and authorization

**React Components (dashboard/src/)**
- Component rendering and behavior
- User interactions and state management
- Accessibility testing
- Responsive design testing

### Integration Tests

**API Integration**
- Database operations with real connections
- Agent coordination workflows
- Frontend-backend communication
- Data consistency across operations

**Database Operations**
- CRUD operations for all entities
- Transaction management and rollbacks
- Constraint validation
- Performance with large datasets

### E2E Tests

**User Workflows**
- Complete user journeys through the system
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness
- Real-time data updates

**System Performance**
- Load handling with concurrent requests
- Response time thresholds
- Memory and resource usage
- Error recovery and resilience

## Environment Configuration

### Test Database Setup

The tests use a separate test database to avoid affecting production data:

```bash
# Create test database
createdb test_hotmart

# Set environment variables
export DB_HOST=localhost
export DB_USER=test_user
export DB_PASSWORD=test_password
export DB_NAME=test_hotmart
export REDIS_HOST=localhost
export NODE_ENV=test
```

### Docker Compose for Test Services

```yaml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: test_hotmart
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5432:5432"
  
  redis-test:
    image: redis:7
    ports:
      - "6379:6379"
```

## Test Data Management

### Mock Data

The test suite uses predefined mock data:

```javascript
// Global test utils
global.testUtils = {
  mockProduct: {
    hotmart_id: 'HM-TEST123',
    name: 'Test Product',
    niche: 'Technology',
    url_sales_page: 'https://pay.hotmart.com/RTEST123'
  },
  mockAgent: {
    name: 'TestAgent',
    status: 'active',
    last_activity: new Date().toISOString()
  }
};
```

### Database Cleanup

Tests automatically clean up after themselves:

```javascript
afterEach(async () => {
  // Clean up test data
  await client.query('DELETE FROM products WHERE hotmart_id LIKE $1', ['HM-TEST%']);
  await client.query('DELETE FROM daily_metrics WHERE product_id IN (SELECT id FROM products WHERE hotmart_id LIKE $1)', ['HM-TEST%']);
});
```

## Performance Testing

### Response Time Thresholds

- API responses: < 500ms
- Page loads: < 3s
- Database queries: < 100ms

### Load Testing

```bash
# Run concurrent request test
npm run test:load

# Run memory usage test
npm run test:memory
```

## Security Testing

### Input Validation

All inputs are validated for:

- SQL injection attempts
- XSS vulnerabilities
- Path traversal
- Command injection

### Authentication Testing

```bash
# Run security tests
npm run security:test

# Run security audit
npm run security:audit
```

## CI/CD Integration

### GitHub Actions Workflow

The testing suite runs automatically on:

1. **Push to main/develop**: Full test suite
2. **Pull requests**: Unit and integration tests
3. **Merge**: All tests including E2E

### Coverage Enforcement

Coverage thresholds are enforced in CI:

```yaml
- name: Check coverage thresholds
  run: |
    # Check if coverage meets minimum thresholds
    THRESHOLD=80
    if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
      echo "Coverage $COVERAGE% is below threshold $THRESHOLD%"
      exit 1
    fi
```

## Debugging Tests

### Running Tests in Debug Mode

```bash
# Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debugging
npx playwright test --debug

# Headful browser testing
npx playwright test --headed
```

### Test Output Analysis

```bash
# Verbose test output
npm run test -- --verbose

# Generate detailed reports
npm run test -- --coverageReporters=text-lcov | coveralls
```

## Best Practices

### Test Organization

1. **Arrange-Act-Assert Pattern**
2. **Descriptive test names**
3. **Independent tests**
4. **Reusable test utilities**

### Mock Strategy

1. **Mock external dependencies**
2. **Use test doubles for databases**
3. **Stub network requests**
4. **Fake time and dates**

### Error Handling

1. **Test happy and error paths**
2. **Validate error messages**
3. **Test edge cases**
4. **Verify cleanup**

## Troubleshooting

### Common Issues

**Test Database Connection Failed**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check credentials
psql -h localhost -U test_user -d test_hotmart -c "SELECT 1;"
```

**Tests Time Out**
```bash
# Increase timeout
JEST_TEST_TIMEOUT=30000 npm run test

# Run tests sequentially
npm run test -- --runInBand
```

**Coverage Not Generated**
```bash
# Clean coverage directory
rm -rf coverage/

# Regenerate coverage
npm run test:coverage
```

### Getting Help

1. Check GitHub Actions logs for CI failures
2. Review test output for specific error messages
3. Consult the Jest and Playwright documentation
4. Check test environment configuration

## Contributing

When adding new features:

1. Write tests before implementing functionality
2. Ensure all tests pass before submitting PR
3. Maintain or improve coverage percentages
4. Update documentation as needed
5. Run the full test suite locally

The testing suite is designed to ensure the Hotmart Automation System remains reliable, secure, and performant as it evolves.