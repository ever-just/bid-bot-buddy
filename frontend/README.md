# 🎨 RFP Platform Frontend

**Next.js application with shadcn/ui components for the RFP Automation Platform**

## 🏗️ **Architecture**

- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui (React components)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Query
- **API Integration**: Axios with Flask backend

## 🚀 **Setup Instructions**

### **1. Initialize Next.js App**
```bash
cd frontend
npx create-next-app@latest rfp-platform --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### **2. Install shadcn/ui**
```bash
cd rfp-platform
npx shadcn@latest init
```

### **3. Install Core Components**
```bash
# Navigation & Layout
npx shadcn@latest add sidebar card tabs

# Forms & Input
npx shadcn@latest add form input button textarea select

# Data Display
npx shadcn@latest add table data-table badge progress

# Feedback & Notifications
npx shadcn@latest add alert dialog toast

# Charts & Analytics
npx shadcn@latest add chart accordion
```

## 📁 **Component Structure**

```
frontend/rfp-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── rfp/               # RFP analysis pages
│   │   ├── contracts/         # Historical contracts
│   │   ├── vendors/           # Vendor management
│   │   └── proposals/         # Generated proposals
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── agents/            # Agent-specific components
│   │   │   ├── rfp-reader.tsx
│   │   │   ├── contract-researcher.tsx
│   │   │   ├── vendor-scout.tsx
│   │   │   ├── profit-estimator.tsx
│   │   │   ├── proposal-writer.tsx
│   │   │   └── submitter.tsx
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   └── shared/
│   │       ├── loading-card.tsx
│   │       ├── stats-dashboard.tsx
│   │       └── progress-tracker.tsx
│   ├── lib/
│   │   ├── api.ts            # Backend API calls
│   │   ├── agents.ts         # Agent orchestration
│   │   └── utils.ts          # Utilities
│   └── types/
│       ├── rfp.ts           # RFP data types
│       ├── contracts.ts     # Contract types
│       └── agents.ts        # Agent response types
```

## 🎯 **Key Pages & Components**

### **1. Dashboard (Home Page)**
- **Components**: Sidebar, Stats Cards, Recent RFPs
- **shadcn/ui**: `Sidebar`, `Card`, `Badge`, `Progress`

### **2. RFP Analysis Page**
- **Components**: URL Input, Agent Progress, Results Tabs
- **shadcn/ui**: `Form`, `Input`, `Button`, `Tabs`, `Alert`

### **3. Historical Contracts**
- **Components**: Search, Filters, Data Table
- **shadcn/ui**: `Input`, `Select`, `DataTable`, `Pagination`

### **4. Vendor Management**
- **Components**: Vendor Cards, Contact Forms, Quote Tracking
- **shadcn/ui**: `Card`, `Dialog`, `Form`, `Badge`

### **5. Proposal Generator**
- **Components**: Template Selection, Content Editor, PDF Preview
- **shadcn/ui**: `Tabs`, `Textarea`, `Button`, `Dialog`

## 🔗 **API Integration**

### **Backend Connection**
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
  scrape: (url: string) => axios.post(`${API_BASE}/api/scrape`, { url }),
  analyzeRFP: (url: string) => axios.post(`${API_BASE}/api/rfp/analyze`, { url }),
  searchContracts: (query: string) => axios.get(`${API_BASE}/api/contracts`, { params: { q: query } }),
  findVendors: (requirements: any) => axios.post(`${API_BASE}/api/vendors/search`, requirements),
  generateProposal: (data: any) => axios.post(`${API_BASE}/api/proposal/generate`, data)
}
```

## 🎨 **Design System**

### **Color Palette** (Tailwind CSS)
- **Primary**: Blue (government, trust)
- **Secondary**: Green (success, money)
- **Accent**: Orange (warnings, attention)
- **Neutral**: Gray (text, backgrounds)

### **Component Theming**
```typescript
// tailwind.config.ts
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    900: '#14532d'
  }
}
```

## 📱 **Responsive Design**

- **Desktop**: Full sidebar, multi-column layouts
- **Tablet**: Collapsible sidebar, stacked columns  
- **Mobile**: Hidden sidebar, single column, drawer navigation

## 🚀 **Development Commands**

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Add new shadcn/ui component
npx shadcn@latest add [component-name]
```

## 🔄 **Integration with Flask Backend**

The Next.js frontend will communicate with the existing Flask backend:

1. **Current Flask API** (`/api/scrape`) → Enhanced with agent endpoints
2. **Real-time Updates** → WebSocket or Server-Sent Events for agent progress
3. **File Uploads** → PDF RFP documents, proposal downloads
4. **Authentication** → JWT tokens for user sessions

## 📊 **Component Examples**

### **RFP Analysis Dashboard**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function RFPDashboard({ rfpData }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            RFP Analysis Results
            <Badge variant="outline">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="contracts">Historical</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="proposal">Proposal</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              {/* RFP summary content */}
            </TabsContent>
            {/* Other tab contents */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

This frontend will provide a **professional, government-contract-worthy interface** using shadcn/ui's proven design patterns! 🎨 