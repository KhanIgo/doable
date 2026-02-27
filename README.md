# Doable - Project Management Platform

A modern, full-featured project management application built with Nuxt.js and SQLite.

## 🚀 Features

### Core Functionality
- **Task Management** - Create, update, and organize tasks with rich markdown descriptions
- **Projects** - Group tasks under projects with ownership tracking
- **Sprints** - Agile sprint planning and management
- **Data Storage** - Flexible JSON data storage for custom fields

### User Management
- **Authentication** - Secure login/registration with bcrypt password hashing
- **User Roles** - Role-based access control (admin/user)
- **User Profiles** - Avatar, status, and custom data fields

### Rich Text Editor
- **Markdown Support** - Full markdown editing with live preview
- **Image Uploads** - Drag & drop or paste images to S3-compatible storage
- **Toolbar** - Bold, italic, headings, links, lists, code blocks
- **Keyboard Shortcuts** - Paste images from clipboard

### Database
- **SQLite** - Lightweight, serverless database
- **S3-Compatible Storage** - Support for MinIO, DigitalOcean Spaces, or AWS S3
- **Automatic Migrations** - Database schema auto-initialization

## 📁 Database Schema

### Tables

#### Users
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| username | TEXT | User's username |
| email | TEXT | Unique email (NOT NULL) |
| password | TEXT | Bcrypt hashed password |
| role | TEXT | User role (default: 'user') |
| avatar | TEXT | Avatar URL |
| status | TEXT | Account status (default: 'active') |
| data | JSON | Custom user data |

#### Projects
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Project name |
| slug | TEXT | URL-friendly slug |
| description | TEXT | Project description |
| owner_id | INTEGER | Reference to users.id |
| status | TEXT | Project status |

#### Tasks
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| title | TEXT | Task title |
| description | TEXT | Markdown description |
| status | INTEGER | Task status |
| project_id | INTEGER | Reference to projects.id |
| user_id | INTEGER | Reference to users.id |
| priority | INTEGER | Priority level |
| type | TEXT | Task type (default: 'task') |
| due_date | TIMESTAMP | Due date |
| data, attachments, comments, tags, labels, assignees, subtasks | JSON | Extended fields |

#### Sprints
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Sprint name |
| description | TEXT | Sprint description |
| status | INTEGER | Sprint status |
| user_id | INTEGER | Reference to users.id |
| data | JSON | Custom sprint data |

#### Data
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Unique name (indexed) |
| data | JSON | Flexible data storage |
| status | INTEGER | Status flag |
| user_id | INTEGER | Reference to users.id |

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 4, Vue 3, TypeScript
- **Backend**: Nitro Server, H3
- **Database**: SQLite (better-sqlite3)
- **Storage**: S3-compatible (MinIO, AWS S3, DigitalOcean Spaces)
- **Authentication**: bcrypt password hashing
- **Markdown**: markdown-it

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- S3-compatible storage (optional for image uploads)

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# S3_ENDPOINT=https://your-storage.com
# S3_BUCKET=your-bucket
# S3_REGION=us-east-1
# S3_ACCESS_KEY_ID=your-key
# S3_SECRET_ACCESS_KEY=your-secret

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
node .output/server/index.mjs
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sprints
- `GET /api/sprints` - List all sprints
- `POST /api/sprints` - Create sprint
- `PATCH /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint

### Data
- `GET /api/data` - List all data records
- `POST /api/data` - Create data record
- `PATCH /api/data/:id` - Update data record
- `DELETE /api/data/:id` - Delete data record

### Upload
- `POST /api/upload` - Upload image to S3

## 📱 Pages

- `/` - Task manager dashboard
- `/auth` - Login page
- `/reg` - Registration page
- `/projects` - Projects list
- `/sprints` - Sprints list

## 🔐 Default Admin User

After first run, seed the database with:
```bash
# The admin user is automatically seeded
Email: admin@example.com
Password: password
```

## 📝 Markdown Editor Features

- **Bold** (`Ctrl+B`)
- *Italic* (`Ctrl+I`)
- Headings (H1-H6)
- Links
- Lists (bulleted/numbered)
- Code blocks
- Image upload (drag & drop, paste, or button)
- Live preview toggle

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `S3_ENDPOINT` | S3-compatible storage URL | For uploads |
| `S3_BUCKET` | Bucket name | For uploads |
| `S3_REGION` | Storage region | For uploads |
| `S3_ACCESS_KEY_ID` | Access key | For uploads |
| `S3_SECRET_ACCESS_KEY` | Secret key | For uploads |

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
