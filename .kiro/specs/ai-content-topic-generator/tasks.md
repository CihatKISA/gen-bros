# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create Next.js 15 project with TypeScript
  - Install Payload CMS, ShadCN, Tailwind CSS v4, and required dependencies
  - Configure Tailwind CSS v4 with custom theme
  - Set up project directory structure following the design specification
  - Create .env.example file with all required environment variables
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Configure Payload CMS and database
  - [x] 2.1 Set up Payload configuration file
    - Create payload.config.ts with Neon PostgreSQL adapter
    - Configure authentication settings with JWT
    - Set up admin panel configuration
    - _Requirements: 8.1, 3.4_

  - [x] 2.2 Create Users collection
    - Implement Users collection with auth enabled
    - Add email, role, preferences, and usageStats fields
    - Configure access control policies for user operations
    - _Requirements: 2.1, 2.2, 2.3, 8.1_

  - [x] 2.3 Create ToolModules collection
    - Implement ToolModules collection with name, slug, description fields
    - Add rate limit configuration fields
    - Set up admin-only access control
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 8.3_

  - [x] 2.4 Create Categories collection
    - Implement Categories collection with hierarchical structure
    - Add self-referential parent relationship
    - Configure public read access
    - _Requirements: 8.4_

  - [x] 2.5 Create SavedTopics collection
    - Implement SavedTopics collection with relationships to users, tools, and categories
    - Add content, input, and metadata fields as JSON
    - Configure owner-based access control
    - Create database indexes for performance optimization
    - _Requirements: 5.2, 5.3, 5.4, 6.2, 8.2, 8.5_

- [x] 3. Implement authentication system
  - [x] 3.1 Create authentication middleware
    - Implement Next.js middleware for route protection
    - Add JWT token validation logic
    - Configure protected and auth route patterns
    - Handle redirect logic for unauthenticated users
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.2 Build registration page and form
    - Create registration page with form validation using Zod
    - Implement RegisterForm component with email and password fields
    - Add client-side validation with error messages
    - Integrate with Payload auth API for user creation
    - Handle successful registration with session creation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 13.5_

  - [x] 3.3 Build login page and form
    - Create login page with form validation
    - Implement LoginForm component with credential inputs
    - Add error handling for invalid credentials
    - Integrate with Payload auth API for authentication
    - Handle successful login with redirect to intended destination
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.4 Create useAuth hook for client-side auth state
    - Implement custom hook to access current user data
    - Add loading and error states
    - Provide logout functionality
    - _Requirements: 3.5, 7.5_

- [x] 4. Set up AI integration infrastructure
  - [x] 4.1 Configure OpenAI client
    - Create OpenAI client instance with API key from environment
    - Define default model, token limits, and temperature settings
    - Add environment variable validation for API key
    - _Requirements: 9.1, 11.1, 11.2_

  - [x] 4.2 Implement prompt engineering system
    - Create system prompts for topic generator
    - Implement buildTopicGeneratorPrompt function with category parameter
    - Define structured JSON output format for AI responses
    - _Requirements: 4.2_

  - [x] 4.3 Build AI service layer
    - Create generateCompletion function wrapping OpenAI API calls
    - Implement error handling for API failures with retry logic
    - Add response parsing and validation
    - Track token usage and processing time
    - _Requirements: 4.5, 9.4, 9.5_

  - [x] 4.4 Implement rate limiting system
    - Set up Redis client for rate limit tracking (or in-memory fallback)
    - Create checkRateLimit function with hourly and daily limits
    - Implement rate limit key generation by user and tool
    - Add automatic expiration for rate limit counters
    - _Requirements: 9.2, 9.3_


- [x] 5. Build topic generation API
  - [x] 5.1 Create topic generation endpoint
    - Implement POST /api/tools/generate-topics route
    - Add request validation using Zod schema
    - Integrate rate limiting check for authenticated users
    - Call AI service to generate topics
    - Update user usage statistics after successful generation
    - Return topics with metadata (tokens used, model)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.2, 9.3, 9.4_

  - [x] 5.2 Create save topic endpoint
    - Implement POST /api/tools/save-topic route
    - Add authentication requirement check
    - Validate request data with Zod schema
    - Check for duplicate saved topics
    - Create saved topic record in database
    - Return saved topic data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 5.3 Create get saved topics endpoint
    - Implement GET /api/tools/saved-topics route
    - Add authentication requirement
    - Support filtering by tool slug
    - Implement pagination with limit and page parameters
    - Return topics sorted by creation date descending
    - _Requirements: 6.2, 6.3_

  - [x] 5.4 Create delete saved topic endpoint
    - Implement DELETE /api/tools/saved-topics/[id] route
    - Verify user ownership before deletion
    - Remove topic from database
    - Return success confirmation
    - _Requirements: 6.5_

- [x] 6. Install and configure ShadCN components
  - Initialize ShadCN with Tailwind CSS v4
  - Install required UI components: Button, Input, Card, Form, Dialog, Tabs, Badge, Skeleton
  - Configure component variants and styling
  - _Requirements: 12.1, 12.2_

- [x] 7. Build topic generator tool interface
  - [x] 7.1 Create TopicGeneratorForm component
    - Build form with category input field
    - Implement form validation with react-hook-form and Zod
    - Add loading state during AI generation
    - Display error messages for failed requests
    - Handle form submission and call generation API
    - _Requirements: 4.1, 4.3, 14.1, 14.2, 14.3_

  - [x] 7.2 Create TopicResults component
    - Display list of generated topics in card layout
    - Show topic title, description, content type, and hashtags
    - Display target audience and engagement hook
    - Show generation metadata (token count)
    - Implement responsive grid layout
    - _Requirements: 4.4, 12.3, 12.5_

  - [x] 7.3 Create SaveTopicButton component
    - Add bookmark icon button for each topic
    - Check authentication status before save attempt
    - Show auth dialog for guest users
    - Call save topic API for authenticated users
    - Display saved state with visual feedback
    - Handle save errors gracefully
    - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 14.4_

  - [x] 7.4 Create topic generator page
    - Build /topic-generator page with TopicGeneratorForm
    - Manage state for generated topics
    - Conditionally render TopicResults after generation
    - Wrap components in ErrorBoundary
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4_

- [x] 8. Build user dashboard
  - [x] 8.1 Create DashboardLayout component
    - Build dashboard container with user greeting
    - Implement tabs for different tool sections
    - Add settings tab placeholder
    - Protect with authentication requirement
    - _Requirements: 6.1, 7.1_

  - [x] 8.2 Create SavedTopicsList component
    - Fetch saved topics from API on mount
    - Display topics in organized list/grid
    - Show timestamps for each saved topic
    - Implement loading skeleton during fetch
    - Handle empty state when no topics saved
    - _Requirements: 6.2, 6.3, 12.4_

  - [x] 8.3 Create TopicCard component
    - Display individual saved topic with all details
    - Add delete button with confirmation
    - Show tool type badge
    - Implement responsive card layout
    - _Requirements: 6.4, 6.5_

  - [x] 8.4 Create dashboard page
    - Build /dashboard page with DashboardLayout
    - Integrate SavedTopicsList component
    - Add route protection via middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_


- [x] 9. Implement layout and navigation
  - [x] 9.1 Create Header component
    - Build header with logo and navigation links
    - Add authentication status display
    - Show login/register buttons for guests
    - Show user menu with logout for authenticated users
    - Implement responsive mobile navigation
    - _Requirements: 12.5_

  - [x] 9.2 Create root layout
    - Build app/layout.tsx with global styles
    - Include Header component
    - Add ErrorBoundary wrapper
    - Configure metadata and fonts
    - _Requirements: 12.3, 14.1_

  - [x] 9.3 Create homepage
    - Build landing page with tool introduction
    - Add call-to-action to try topic generator
    - Include features overview
    - Add registration prompt for guests
    - _Requirements: 1.1_

- [x] 10. Implement error handling and validation
  - [x] 10.1 Create error classes and handlers
    - Define AppError base class and specific error types
    - Implement global error handler for API routes
    - Create client-side ErrorBoundary component
    - _Requirements: 14.2, 14.3, 14.4_

  - [x] 10.2 Add input validation and sanitization
    - Create Zod schemas for all form inputs
    - Implement sanitization functions for user inputs
    - Add CSRF protection in middleware
    - Validate environment variables on startup
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11. Add security measures
  - [x] 11.1 Implement rate limiting for API routes
    - Add global rate limiter for all API endpoints
    - Implement strict rate limiter for auth endpoints
    - Return appropriate error responses when limits exceeded
    - _Requirements: 9.2, 9.3_

  - [x] 11.2 Configure security headers
    - Add security headers in Next.js config
    - Implement CORS policy
    - Configure CSP headers
    - _Requirements: 13.3_

- [x] 12. Set up database seeding
  - Create seed script for initial data
  - Add default topic-generator tool module with rate limits
  - Create default categories (Digital Marketing, Technology, etc.)
  - Document seeding process in README
  - _Requirements: 10.4_

- [x] 13. Implement performance optimizations
  - [x] 13.1 Add caching layer
    - Set up Redis client for caching (optional)
    - Implement getCached utility function
    - Add cache invalidation logic
    - _Requirements: 15.2_

  - [x] 13.2 Optimize database queries
    - Create optimized query functions with proper indexes
    - Implement pagination for large datasets
    - Use Payload depth parameter for relationship loading
    - _Requirements: 15.1_

  - [x] 13.3 Configure code splitting
    - Use dynamic imports for heavy components
    - Add loading skeletons for lazy-loaded components
    - Optimize bundle size
    - _Requirements: 15.3_

- [x] 14. Add logging and monitoring
  - Set up logging infrastructure with pino
  - Create logging utilities for AI requests and errors
  - Add analytics tracking for key user events
  - Implement performance monitoring hooks
  - _Requirements: 9.4_


- [x] 15. Configure deployment
  - [x] 15.1 Set up environment configuration
    - Create comprehensive .env.example file
    - Document all environment variables
    - Add environment validation on build
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 15.2 Configure Vercel deployment
    - Create vercel.json configuration
    - Set up environment variables in Vercel dashboard
    - Configure build and deployment settings
    - _Requirements: 11.4_

  - [x] 15.3 Set up Neon PostgreSQL database
    - Create Neon project and database
    - Configure connection string
    - Run database migrations via Payload
    - Execute seed script for initial data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 16. Testing and quality assurance
  - [x] 16.1 Write unit tests for utilities
    - Test prompt generation functions
    - Test validation schemas
    - Test sanitization functions
    - _Requirements: 13.1, 13.2_

  - [x] 16.2 Write integration tests for API routes
    - Test topic generation endpoint with mocked AI service
    - Test save topic endpoint with authentication
    - Test rate limiting behavior
    - Test error handling scenarios
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 16.3 Write component tests
    - Test TopicGeneratorForm submission and validation
    - Test SaveTopicButton authentication flow
    - Test dashboard components rendering
    - Test error boundary behavior
    - _Requirements: 14.1, 14.2, 14.3_