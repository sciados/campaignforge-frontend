# 🗺️ CampaignForge Frontend Sitemap

**Project:** CampaignForge Universal Campaign System  
**Architecture:** Input-Agnostic Content Generation Platform  
**Generated:** June 19, 2025

---

## 📁 Current File Structure

### 🎯 App Directory (Next.js 13+ App Router)
```
src/app/
├── admin/
│   └── page.tsx                    # Admin dashboard
├── campaigns/
│   ├── page.tsx                    # ✅ Main campaigns list (WORKING)
│   └── [id]/                       # 🔄 TO IMPLEMENT: Campaign detail routes
│       ├── inputs/
│       │   └── page.tsx            # 🆕 Input source management
│       ├── analysis/
│       │   └── page.tsx            # 🆕 AI analysis & intelligence
│       ├── generate/
│       │   └── page.tsx            # 🆕 Content generation hub
│       └── settings/
│           └── page.tsx            # 🆕 Campaign settings
├── dashboard/
│   ├── analytics/
│   │   └── page.tsx                # Analytics overview
│   └── page.tsx                    # Main dashboard
├── content-library/
│   └── page.tsx                    # Generated content archive
├── settings/
│   └── page.tsx                    # User/company settings
├── login/
│   └── page.tsx                    # Authentication
├── register/
│   └── page.tsx                    # User registration
├── layout.tsx                      # Root layout
└── globals.css                     # Global styles
```

### 🧩 Components Directory
```
src/components/
├── admin/
│   ├── CompanyEditModal.tsx        # Company management
│   └── UserGridModal.tsx           # User management
├── ai-generation/                  # 🔄 RENAME TO: intelligence/
│   ├── CampaignCard.tsx           # ➡️ MOVE TO: campaigns/
│   ├── CampaignFilters.tsx        # ➡️ MOVE TO: campaigns/
│   ├── CampaignGrid.tsx           # ➡️ MOVE TO: campaigns/
│   ├── CampaignStats.tsx          # ➡️ MOVE TO: campaigns/
│   └── CreateCampaignModal.tsx    # ➡️ MOVE TO: campaigns/
├── campaigns/                      # 🎯 MAIN CAMPAIGN COMPONENTS
│   ├── CampaignCard.tsx           # ✅ Individual campaign display
│   ├── CampaignFilters.tsx        # ✅ Filter & search
│   ├── CampaignGrid.tsx           # ✅ Campaign grid layout
│   ├── CampaignStats.tsx          # ✅ Statistics dashboard
│   ├── CreateCampaignModal.tsx    # 🔄 MODIFY: Remove campaign types
│   └── UniversalCampaignCreator.tsx # 🆕 New universal creator
├── dashboards/                    # Dashboard components
│   ├── shared/
│   │   ├── header.tsx             # Shared header
│   │   └── sidebar.tsx            # Shared sidebar
│   ├── AdminDashboard.tsx         # Admin-specific dashboard
│   ├── CampaignDashboard.tsx      # Campaign overview
│   ├── CampaignStep1.tsx          # Legacy: Campaign creation step 1
│   ├── CampaignStep2.tsx          # Legacy: Campaign creation step 2
│   ├── CampaignStep3.tsx          # Legacy: Campaign creation step 3
│   ├── QuickActions.tsx           # Quick action buttons
│   ├── RecentActivity.tsx         # Recent activity feed
│   └── UserDashboard.tsx          # User-specific dashboard
├── input-sources/                 # 🆕 INPUT MANAGEMENT SYSTEM
│   ├── DataInputs/                # 🆕 Data input components
│   │   └── [to be created]
│   ├── DocumentInputs/            # 🆕 Document upload components
│   │   └── [to be created]
│   ├── VideoInputs/               # 🆕 Video processing components
│   │   └── [to be created]
│   ├── WebInputs/                 # 🆕 Web scraping components
│   │   └── [to be created]
│   ├── UniversalInputCollector.tsx # 🆕 Main input interface
│   ├── InputSourceCard.tsx        # 🆕 Individual source display
│   ├── FileUploader.tsx           # 🆕 Drag & drop uploader
│   ├── URLInputField.tsx          # 🆕 URL input component
│   └── ProcessingQueue.tsx        # 🆕 Processing status tracker
├── intelligence/                  # 🆕 AI ANALYSIS SYSTEM
│   ├── ContentGenerator-v1.tsx   # 🔄 RENAME: LegacyContentGenerator.tsx
│   ├── ContentGenerator.tsx      # ✅ Current content generator
│   ├── IntelligenceAnalyzer.tsx  # ✅ Current intelligence analyzer
│   ├── AnalysisDisplay.tsx       # 🆕 Consolidated insights viewer
│   ├── KeywordSelector.tsx       # 🆕 AI keyword suggestions
│   ├── InsightsViewer.tsx         # 🆕 Multi-source insights
│   ├── AudienceAnalyzer.tsx      # 🆕 Audience persona generator
│   └── CompetitiveAnalysis.tsx   # 🆕 Competitive intelligence
├── outputs/                       # 🆕 CONTENT GENERATION SYSTEM
│   ├── shared/                    # Shared output components
│   │   ├── ContentEditor.tsx     # Universal content editor
│   │   ├── ExportOptions.tsx     # Export functionality
│   │   └── PreviewModal.tsx      # Content preview
│   ├── EmailGenerator.tsx        # 🆕 Email series generator
│   ├── VideoScriptGenerator.tsx  # 🆕 Video script creator
│   ├── SocialPostGenerator.tsx   # 🆕 Social media content
│   ├── BlogContentGenerator.tsx  # 🆕 Blog post generator
│   ├── AdCopyGenerator.tsx       # 🆕 Advertisement copy
│   ├── LeadMagnetGenerator.tsx   # 🆕 Lead magnet creator
│   ├── SalesMaterialGenerator.tsx # 🆕 Sales collateral
│   ├── ContentGeneratorSelector.tsx # 🆕 Output type selector
│   ├── GeneratedContentDisplay.tsx # 🆕 Generated content viewer
│   └── GenerationQueue.tsx       # 🆕 Generation progress tracker
└── ui/                            # Shared UI components
    ├── button.tsx                 # Button component
    ├── card.tsx                   # Card component
    ├── input.tsx                  # Input component
    └── label.tsx                  # Label component
```

### 📚 Lib Directory
```
src/lib/
├── hooks/
│   ├── useAuth.js                 # Authentication hook
│   └── useUserTier.js             # User tier management
├── stores/                        # 🆕 State management
│   ├── campaignStore.ts           # 🆕 Campaign state
│   ├── inputSourceStore.ts       # 🆕 Input sources state
│   └── intelligenceStore.ts      # 🆕 Intelligence data state
├── types/                         # 🆕 TypeScript definitions
│   ├── campaign.ts               # 🆕 Campaign interfaces
│   ├── inputSource.ts            # 🆕 Input source types
│   ├── intelligence.ts           # 🆕 Intelligence types
│   └── output.ts                 # 🆕 Output generation types
├── utils/
│   ├── api.ts                    # ✅ API client (WORKING)
│   └── utils.ts                  # Utility functions
└── api.ts                        # 🔄 CONSOLIDATE WITH: utils/api.ts
```

### 🎨 Styles Directory
```
src/styles/
└── [global styles]
```

---

## 🛣️ Planned Route Structure (Universal Campaign System)

### 🏠 Main Application Routes
```
/                                   # Landing/Dashboard
├── /login                         # Authentication
├── /register                      # User registration
├── /dashboard                     # Main dashboard
│   ├── /analytics                # Analytics overview
│   └── /settings                 # User settings
├── /campaigns                     # ✅ Campaign list (WORKING)
│   ├── /create                   # 🆕 Universal campaign creator
│   └── /[campaignId]/            # 🆕 Campaign workspace
│       ├── /overview             # Campaign summary & stats
│       ├── /inputs               # 🆕 Input source management
│       │   ├── /upload           # File upload interface
│       │   ├── /urls             # URL input interface
│       │   └── /[sourceId]       # Individual source details
│       ├── /analysis             # 🆕 AI analysis & intelligence
│       │   ├── /keywords         # Keyword management
│       │   ├── /audience         # Audience insights
│       │   ├── /themes           # Content themes
│       │   └── /competitive      # Competitive analysis
│       ├── /generate             # 🆕 Content generation hub
│       │   ├── /email            # Email series generation
│       │   ├── /video            # Video content generation
│       │   ├── /social           # Social media content
│       │   ├── /blog             # Blog content
│       │   ├── /ads              # Advertisement copy
│       │   ├── /leads            # Lead magnets
│       │   └── /sales            # Sales materials
│       ├── /content              # Generated content library
│       │   ├── /drafts           # Draft content
│       │   ├── /approved         # Approved content
│       │   └── /published        # Published content
│       └── /settings             # Campaign settings
├── /content-library              # Global content archive
│   ├── /templates                # Content templates
│   ├── /exports                  # Exported content
│   └── /shared                   # Shared resources
└── /admin                        # Admin panel (role-based)
    ├── /users                    # User management
    ├── /companies                # Company management
    └── /analytics                # System analytics
```

---

## 🎯 Component Reorganization Plan

### Phase 1: Immediate Reorganization (Next Session)

#### 📁 Move Existing Components
```bash
# Move campaign components from ai-generation to campaigns
mv src/components/ai-generation/CampaignCard.tsx src/components/campaigns/
mv src/components/ai-generation/CampaignFilters.tsx src/components/campaigns/
mv src/components/ai-generation/CampaignGrid.tsx src/components/campaigns/
mv src/components/ai-generation/CampaignStats.tsx src/components/campaigns/
mv src/components/ai-generation/CreateCampaignModal.tsx src/components/campaigns/

# Rename ai-generation to intelligence
mv src/components/ai-generation src/components/intelligence
```

#### 🆕 Create New Component Directories
```bash
mkdir -p src/components/input-sources/{DataInputs,DocumentInputs,VideoInputs,WebInputs}
mkdir -p src/components/outputs/shared
mkdir -p src/lib/{stores,types}
```

### Phase 2: Universal Campaign System Components

#### 🔧 Components to Create
```
📁 input-sources/
├── UniversalInputCollector.tsx    # Main input interface with drag & drop
├── InputSourceCard.tsx            # Display individual sources
├── FileUploader.tsx               # File upload with progress
├── URLInputField.tsx              # URL input with validation
└── ProcessingQueue.tsx            # Show processing status

📁 intelligence/
├── AnalysisDisplay.tsx            # Show consolidated insights
├── KeywordSelector.tsx            # AI suggestions + user selection
├── InsightsViewer.tsx             # Multi-source analysis results
├── AudienceAnalyzer.tsx           # Audience persona generation
└── CompetitiveAnalysis.tsx        # Competitive intelligence display

📁 outputs/
├── ContentGeneratorSelector.tsx   # Choose output types
├── GeneratedContentDisplay.tsx    # Show generated content
├── EmailGenerator.tsx             # Email series creation
├── VideoScriptGenerator.tsx       # Video script generation
├── SocialPostGenerator.tsx        # Social media content
├── BlogContentGenerator.tsx       # Blog post generation
├── AdCopyGenerator.tsx            # Advertisement copy
├── LeadMagnetGenerator.tsx        # Lead magnet creation
├── SalesMaterialGenerator.tsx     # Sales collateral
└── GenerationQueue.tsx            # Track generation progress
```

#### 🏗️ State Management Structure
```typescript
// lib/stores/campaignStore.ts
interface CampaignStore {
  currentCampaign: Campaign | null
  campaigns: Campaign[]
  isLoading: boolean
  createCampaign: (data: CampaignCreateRequest) => Promise<void>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}

// lib/stores/inputSourceStore.ts
interface InputSourceStore {
  sources: InputSource[]
  isProcessing: boolean
  addSource: (campaignId: string, source: InputSourceRequest) => Promise<void>
  removeSource: (sourceId: string) => Promise<void>
  processSource: (sourceId: string) => Promise<void>
}

// lib/stores/intelligenceStore.ts
interface IntelligenceStore {
  intelligence: CampaignIntelligence | null
  isAnalyzing: boolean
  keywords: string[]
  suggestedKeywords: string[]
  analyzeContent: (campaignId: string) => Promise<void>
  updateKeywords: (keywords: string[]) => Promise<void>
}
```

---

## 🔄 Migration Strategy

### Current Working Files to Preserve
```
✅ KEEP AS-IS:
├── src/app/campaigns/page.tsx              # Working campaign list
├── src/components/campaigns/CampaignCard.tsx
├── src/components/campaigns/CampaignFilters.tsx
├── src/components/campaigns/CampaignGrid.tsx
├── src/components/campaigns/CampaignStats.tsx
├── src/lib/utils/api.ts                    # Working API client
└── src/components/intelligence/ContentGenerator.tsx
```

### Files to Modify
```
🔄 MODIFY:
├── src/components/campaigns/CreateCampaignModal.tsx  # Remove campaign types
├── src/app/campaigns/page.tsx                      # Add universal create button
└── src/lib/utils/api.ts                           # Add new API methods
```

### New Files to Create
```
🆕 CREATE:
├── src/app/campaigns/[id]/inputs/page.tsx
├── src/app/campaigns/[id]/analysis/page.tsx
├── src/app/campaigns/[id]/generate/page.tsx
├── src/components/input-sources/* (all components)
├── src/components/intelligence/AnalysisDisplay.tsx
├── src/components/outputs/* (all components)
├── src/lib/stores/* (all stores)
└── src/lib/types/* (all types)
```

---

## 🎯 Implementation Priority Order

### Session 1: Foundation
1. ✅ **Campaign Creation Working** (COMPLETE)
2. 🔄 **Remove campaign type restrictions**
3. 🔄 **Create universal campaign creator**

### Session 2: Input System
1. 🆕 **Build UniversalInputCollector component**
2. 🆕 **Add file upload functionality**  
3. 🆕 **Create input source management**

### Session 3: Intelligence Engine
1. 🆕 **Build AI analysis pipeline**
2. 🆕 **Create keyword suggestion system**
3. 🆕 **Add multi-source consolidation**

### Session 4: Output Generation
1. 🆕 **Build content generator selector**
2. 🆕 **Add email series generation**
3. 🆕 **Create social media content generator**

### Session 5: Advanced Features
1. 🆕 **Add global caching system**
2. 🆕 **Build content library**
3. 🆕 **Create export functionality**

---

## 🔗 Component Dependencies

### Data Flow
```
Campaign Creation
    ↓
Input Sources (Videos, URLs, Documents)
    ↓
AI Analysis & Intelligence Consolidation
    ↓
Keyword Refinement & Audience Insights
    ↓
Content Generation (Multiple Output Types)
    ↓
Content Library & Export
```

### Component Relationships
```
CampaignList → CampaignCard → CampaignDetail
    ↓
UniversalInputCollector → InputSourceCard → ProcessingQueue
    ↓
AnalysisDisplay → KeywordSelector → InsightsViewer
    ↓
ContentGeneratorSelector → [Generator Components] → GeneratedContentDisplay
```

---

## 📊 Success Metrics

### Technical Metrics
- [ ] All existing functionality preserved
- [ ] New universal campaign creation works
- [ ] Input sources accept multiple file types
- [ ] AI analysis processes multiple sources
- [ ] Content generation produces multiple formats

### User Experience Metrics
- [ ] Campaign creation time reduced
- [ ] Content variety increased
- [ ] Processing efficiency improved
- [ ] User satisfaction with flexibility

---

*Last Updated: June 19, 2025*  
*Architecture: Universal Input-Agnostic Campaign System*