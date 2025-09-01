# Health Tracker Frontend - Architecture Guide for Claude Code

## 🎯 Frontend Project Overview

React-based health tracking application with domain-driven architecture. Supports multiple daily measurements, RENPHO CSV imports, and real-time data visualization. Built for mobile-first responsive design with multi-device synchronization.

## 🏗️ Tech Stack & Libraries

### Core Stack
- **React** (functional components + hooks)
- **Zustand** for global state management
- **React Hook Form** for form handling
- **shadcn/ui** components for UI consistency
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Available Utilities
- **Papaparse** for CSV processing
- **Zustand** for state management
- **React Hook Form** for form handling & validation

### Backend Integration
- **Supabase client** for API calls
- **Supabase Auth** for authentication
- **Supabase Storage** for image uploads

## 🚫 Critical Frontend Constraints

### ❌ NEVER USE localStorage/sessionStorage FOR:
```javascript
// ❌ Health data - requires multi-device sync
localStorage.setItem('userMeasurements', JSON.stringify(data))
localStorage.setItem('sessions', JSON.stringify(sessions))
localStorage.setItem('bodyComposition', JSON.stringify(measurements))

// ❌ User authentication tokens - handled by Supabase
localStorage.setItem('authToken', token)
```

### ✅ ACCEPTABLE localStorage usage:
```javascript
// ✅ UI preferences and settings
localStorage.setItem('theme', 'dark')
localStorage.setItem('chartTimeRange', 'week')
localStorage.setItem('dashboardLayout', 'compact')
localStorage.setItem('importWizardStep', '2')

// ✅ Form draft states (non-sensitive)
localStorage.setItem('quickCheckInDraft', JSON.stringify(formData))
localStorage.setItem('measurementFormDraft', JSON.stringify(partialData))

// ✅ User experience enhancements
localStorage.setItem('hasSeenWelcomeModal', 'true')
localStorage.setItem('preferredUnits', 'metric')
localStorage.setItem('sidebarCollapsed', 'false')
```

### ❌ OTHER CRITICAL CONSTRAINTS:
```javascript
// ❌ HTML forms  
<form onSubmit={handleSubmit}>

// ❌ External libraries beyond specified
import SomeRandomLibrary from 'some-library'
```

### ✅ ALWAYS USE:
```javascript
// ✅ Zustand for global state management
const useHealthStore = create((set) => ({
  sessions: [],
  currentUser: null,
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  }))
}))

// ✅ React Hook Form for forms
const { register, handleSubmit, formState: { errors } } = useForm()

// ✅ React state for local component state
const [isLoading, setIsLoading] = useState(false)

// ✅ localStorage for UI preferences only
localStorage.setItem('theme', 'dark')

// ✅ React event handlers (non-form)
<button onClick={handleClick}>

// ✅ Approved libraries only
import { LineChart } from "recharts"
import { Calendar } from "lucide-react"
import Papa from "papaparse"
```

## 🏗️ Domain-Driven Frontend Architecture

```
src/
├── 📱 app/                          # Application setup
│   ├── App.jsx                     # Root component
│   ├── App.css                     # Global styles
│   └── providers/
│       ├── AuthProvider.jsx        # Authentication context
│       ├── SupabaseProvider.jsx    # Supabase client context
│       └── ThemeProvider.jsx       # shadcn/ui theme
│
├── 🏗️ shared/                       # Shared frontend resources
│   ├── stores/                     # Zustand stores
│   │   ├── useAuthStore.js         # Authentication state
│   │   ├── useHealthStore.js       # Health data state
│   │   ├── useUIStore.js           # UI preferences state
│   │   └── useImportStore.js       # Import process state
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── select.jsx
│   │   │   ├── slider.jsx          # For 1-10 scales
│   │   │   └── calendar.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MobileNav.jsx
│   │   ├── forms/
│   │   │   ├── FormField.jsx       # Reusable form field
│   │   │   ├── NumberInput.jsx     # Validated numeric input
│   │   │   ├── ScaleSlider.jsx     # 1-10 subjective scales
│   │   │   └── FileUpload.jsx      # Drag & drop uploader
│   │   └── feedback/
│   │       ├── LoadingSpinner.jsx
│   │       ├── ErrorMessage.jsx
│   │       ├── SuccessAlert.jsx
│   │       └── ProgressBar.jsx     # For import progress
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useSupabase.js          # Supabase client hook
│   │   ├── useDateRange.js         # Date range selector
│   │   ├── useDebounce.js          # Input debouncing
│   │   ├── useLocalStorage.js      # UI preferences storage
│   │   ├── useFormValidation.js    # React Hook Form validation
│   │   └── useLocalState.js        # Component state management
│   │
│   ├── utils/
│   │   ├── dateUtils.js            # Date formatting & manipulation
│   │   ├── validationUtils.js      # Frontend validation rules
│   │   ├── formatUtils.js          # Data display formatting
│   │   ├── calculationUtils.js     # BMI, ratios, statistics
│   │   └── constants.js            # Frontend constants
│   │
│   └── services/
│       ├── supabaseClient.js       # Configured Supabase client
│       ├── authService.js          # Auth operations
│       └── storageService.js       # File upload operations
│
├── 🎯 domains/                      # FEATURE DOMAINS
│   │
│   ├── 📊 dashboard/               # Main dashboard
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── MetricCard.jsx      # Individual metric display
│   │   │   ├── TrendChart.jsx      # Recharts trend visualization
│   │   │   ├── QuickStats.jsx      # Summary statistics
│   │   │   ├── RecentSessions.jsx  # Latest measurements
│   │   │   └── TimeRangePicker.jsx # Period selector
│   │   ├── hooks/
│   │   │   ├── useDashboardData.js # Dashboard data fetching
│   │   │   ├── useMetricsTrends.js # Trend calculations
│   │   │   └── useTimeRange.js     # Time period management
│   │   ├── services/
│   │   │   └── dashboardService.js # Dashboard API calls
│   │   └── DashboardPage.jsx
│   │
│   ├── ⏰ sessions/                # Measurement sessions
│   │   ├── components/
│   │   │   ├── SessionsList.jsx    # Sessions list view
│   │   │   ├── SessionCard.jsx     # Individual session card
│   │   │   ├── SessionTimeline.jsx # Daily timeline view
│   │   │   ├── NewSessionModal.jsx # Create session modal
│   │   │   └── SessionComparison.jsx # Compare sessions
│   │   ├── hooks/
│   │   │   ├── useSessions.js      # Sessions CRUD operations
│   │   │   ├── useSessionsByDate.js # Date-filtered sessions
│   │   │   └── useSessionComparison.js # Comparison logic
│   │   ├── services/
│   │   │   └── sessionsService.js
│   │   └── SessionsPage.jsx
│   │
│   ├── 🏃‍♂️ measurements/           # Data entry forms
│   │   ├── components/
│   │   │   ├── MeasurementForm.jsx  # Main form container
│   │   │   ├── QuickCheckIn.jsx     # <30 second check-in
│   │   │   ├── BodyCompositionForm.jsx # Manual body composition
│   │   │   ├── AnthropometryForm.jsx # Manual measurements
│   │   │   ├── CardiovascularForm.jsx # BP & heart rate
│   │   │   ├── LifestyleForm.jsx    # Lifestyle + subjective scales
│   │   │   └── MeasurementWizard.jsx # Step-by-step wizard
│   │   ├── hooks/
│   │   │   ├── useMeasurementForm.js # React Hook Form setup
│   │   │   ├── useQuickCheckIn.js   # Quick entry logic
│   │   │   ├── useFormValidation.js # Custom validation rules
│   │   │   └── useFormSubmission.js # Form submission logic
│   │   ├── services/
│   │   │   └── measurementsService.js
│   │   └── MeasurementsPage.jsx
│   │
│   ├── 📈 analytics/              # Data visualization
│   │   ├── components/
│   │   │   ├── ChartsContainer.jsx  # Charts layout
│   │   │   ├── WeightTrendChart.jsx # Recharts weight trends
│   │   │   ├── BodyFatChart.jsx     # Recharts body fat
│   │   │   ├── ComparisonChart.jsx  # Intra-day comparisons
│   │   │   ├── CorrelationChart.jsx # Multi-metric correlations
│   │   │   ├── PeriodSelector.jsx   # Chart period controls
│   │   │   └── ChartExport.jsx      # Export chart data
│   │   ├── hooks/
│   │   │   ├── useChartData.js      # Chart data preparation
│   │   │   ├── useAnalytics.js      # Analytics calculations
│   │   │   └── useDataExport.js     # Export functionality
│   │   ├── services/
│   │   │   └── analyticsService.js
│   │   └── AnalyticsPage.jsx
│   │
│   ├── 📸 progress/               # Progress photos
│   │   ├── components/
│   │   │   ├── PhotoGallery.jsx    # Photo grid display
│   │   │   ├── PhotoUpload.jsx     # Drag & drop upload
│   │   │   ├── PhotoComparison.jsx # Side-by-side comparison
│   │   │   ├── PhotoTimeline.jsx   # Chronological photo view
│   │   │   ├── AngleSelector.jsx   # Photo angle filtering
│   │   │   └── PhotoMetadata.jsx   # Weight, date, notes display
│   │   ├── hooks/
│   │   │   ├── usePhotoUpload.js   # File upload logic
│   │   │   ├── usePhotoGallery.js  # Gallery state management
│   │   │   ├── usePhotoComparison.js # Comparison logic
│   │   │   └── usePhotoMetadata.js # Metadata management
│   │   ├── services/
│   │   │   └── photoService.js     # Supabase Storage operations
│   │   └── ProgressPage.jsx
│   │
│   ├── 📥 import/                 # RENPHO CSV import
│   │   ├── components/
│   │   │   ├── ImportWizard.jsx    # Multi-step import process
│   │   │   ├── FileUploader.jsx    # CSV file drag & drop
│   │   │   ├── DataPreview.jsx     # Preview CSV data
│   │   │   ├── ImportProgress.jsx  # Progress visualization
│   │   │   ├── DuplicateHandler.jsx # Handle duplicate records
│   │   │   ├── ValidationErrors.jsx # Display validation issues
│   │   │   └── ImportHistory.jsx   # Import history display
│   │   ├── hooks/
│   │   │   ├── useCSVImport.js     # CSV processing logic
│   │   │   ├── useImportProgress.js # Progress tracking
│   │   │   ├── useDuplicateDetection.js # Duplicate handling
│   │   │   └── useImportValidation.js # Data validation
│   │   ├── services/
│   │   │   ├── csvParsingService.js # Papaparse operations
│   │   │   ├── importValidationService.js # Validation rules
│   │   │   └── importService.js    # Import API calls
│   │   ├── utils/
│   │   │   ├── csvValidation.js    # CSV-specific validation
│   │   │   ├── renphoMapping.js    # Field mapping
│   │   │   └── duplicateDetection.js # Duplicate logic
│   │   └── ImportPage.jsx
│   │
│   ├── ⚙️ settings/               # User settings
│   │   ├── components/
│   │   │   ├── ProfileSettings.jsx
│   │   │   ├── NotificationSettings.jsx
│   │   │   ├── DataPreferences.jsx # Units, display preferences
│   │   │   ├── PrivacySettings.jsx
│   │   │   └── ExportSettings.jsx
│   │   ├── hooks/
│   │   │   ├── useSettings.js      # Settings CRUD
│   │   │   └── usePreferences.js   # User preferences
│   │   ├── services/
│   │   │   └── settingsService.js
│   │   └── SettingsPage.jsx
│   │
│   └── 🔐 auth/                   # Authentication
│       ├── components/
│       │   ├── LoginForm.jsx
│       │   ├── SignupForm.jsx
│       │   ├── ForgotPasswordForm.jsx
│       │   ├── AuthGuard.jsx       # Route protection
│       │   └── AuthLayout.jsx      # Auth pages layout
│       ├── hooks/
│       │   ├── useAuthForm.js      # Auth form logic
│       │   └── useAuthValidation.js # Auth validation
│       ├── services/
│       │   └── authService.js
│       └── AuthPage.jsx
│
└── 🎨 styles/
    ├── globals.css                # Tailwind + global styles
    ├── components.css             # Component-specific styles
    └── utilities.css              # Custom utility classes
```

## 🔄 State Management Architecture

### Zustand Store Pattern
```javascript
// Global health data store
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useHealthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        sessions: [],
        currentSession: null,
        selectedDateRange: { start: null, end: null },
        isLoading: false,
        
        // Actions
        setSessions: (sessions) => set({ sessions }),
        addSession: (session) => set((state) => ({ 
          sessions: [...state.sessions, session] 
        })),
        updateSession: (id, updates) => set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === id ? { ...session, ...updates } : session
          )
        })),
        setCurrentSession: (session) => set({ currentSession: session }),
        setLoading: (isLoading) => set({ isLoading }),
        
        // Computed values
        getSessionsByDate: (date) => {
          const { sessions } = get();
          return sessions.filter(session => 
            new Date(session.timestamp).toDateString() === date.toDateString()
          );
        }
      }),
      {
        name: 'health-store', // localStorage key
        partialize: (state) => ({ 
          selectedDateRange: state.selectedDateRange // Only persist UI preferences
        })
      }
    )
  )
);
```

### React Hook Form Pattern
```javascript
// Form with validation
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const measurementSchema = z.object({
  weight_kg: z.number().min(30).max(300),
  hunger_scale: z.number().min(1).max(10),
  satiety_scale: z.number().min(1).max(10),
  energy_scale: z.number().min(1).max(10)
});

const MeasurementForm = () => {
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      weight_kg: '',
      hunger_scale: 5,
      satiety_scale: 5,
      energy_scale: 5
    }
  });

  const onSubmit = async (data) => {
    try {
      await measurementsService.create(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="space-y-4">
      {/* Number input with validation */}
      <div>
        <Input
          {...register('weight_kg', { valueAsNumber: true })}
          placeholder="Weight (kg)"
        />
        {errors.weight_kg && (
          <p className="text-red-500 text-sm">{errors.weight_kg.message}</p>
        )}
      </div>

      {/* Controlled slider component */}
      <Controller
        name="hunger_scale"
        control={control}
        render={({ field }) => (
          <ScaleSlider
            label="Hunger Scale"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Button 
        onClick={handleSubmit(onSubmit)} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Measurement'}
      </Button>
    </div>
  );
};
```

### Local Component State Pattern
```javascript
// Use useState for pure UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');

// Use Zustand for shared/persistent state
const { sessions, addSession, isLoading } = useHealthStore();
```

### 2. Service Integration Pattern
```javascript
// Custom hook with Zustand integration
const useSessions = (dateRange) => {
  const { sessions, setSessions, isLoading, setLoading } = useHealthStore();
  
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionsService.getByDateRange(dateRange);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, setSessions, setLoading]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, refetch: fetchSessions };
};
```

### 3. Form Handling Pattern
```javascript
// React Hook Form with Zustand integration
const QuickCheckInForm = () => {
  const { addSession } = useHealthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      weight_kg: '',
      hunger_scale: 5,
      satiety_scale: 5,
      energy_scale: 5
    }
  });

  const onSubmit = async (formData) => {
    try {
      const session = await measurementsService.create({
        ...formData,
        timestamp: new Date().toISOString(),
        source_type: 'manual_entry'
      });
      
      // Update global state
      addSession(session);
      
      // Handle success
      toast.success('Measurement saved!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        {...register('weight_kg', { 
          required: 'Weight is required',
          min: { value: 30, message: 'Minimum weight is 30kg' },
          max: { value: 300, message: 'Maximum weight is 300kg' }
        })}
        placeholder="Weight (kg)"
        type="number"
        step="0.1"
      />
      {errors.weight_kg && (
        <p className="text-red-500 text-sm">{errors.weight_kg.message}</p>
      )}

      <Button 
        onClick={handleSubmit(onSubmit)} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Quick Check-in'}
      </Button>
    </div>
  );
};
```

## 📥 RENPHO Import Frontend Specifications

### CSV Processing with Papaparse
```javascript
// CSV parsing configuration
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        // Process results
        const processedData = results.data.map(row => ({
          ...row,
          // Clean headers (remove whitespace)
          weight_kg: row['Peso(kg)'],
          bmi: row['IMC'],
          // ... more field mappings
        }));
        resolve(processedData);
      },
      error: reject
    });
  });
};
```

### Expected RENPHO CSV Fields
```
Fecha, Hora, Peso(kg), IMC, Grasa corporal(%), 
Músculo esquelético(%), Peso corporal sin grasa(kg),
Grasa subcutánea(%), Grasa visceral, Agua corporal(%),
Masa muscular(kg), Masa ósea(kg), Proteína (%),
Tasa Metabólica Basal(kcal), Edad metabólica, Tipo de cuerpo
```

### Import UI Flow
```javascript
// Import wizard states
const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'process' | 'complete'
const [csvData, setCsvData] = useState([]);
const [validationErrors, setValidationErrors] = useState([]);
const [importProgress, setImportProgress] = useState(0);
```

## 📱 Mobile-First Component Patterns

### Responsive Design Principles
```javascript
// Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

// Touch-optimized interactions
<button className="min-h-[44px] px-4 py-2 touch-manipulation">
  {/* Minimum touch target size */}
</button>
```

### Mobile Navigation Pattern
```javascript
const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile menu button */}
      <Button 
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </Button>
      
      {/* Slide-out navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background 
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-auto
      `}>
        {/* Navigation content */}
      </div>
    </>
  );
};
```

## 📊 Recharts Integration Patterns

### Chart Component Pattern
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeightTrendChart = ({ data, timeRange }) => {
  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map(session => ({
      date: format(new Date(session.timestamp), 'MM/dd'),
      weight: session.body_composition?.weight_kg,
      timestamp: session.timestamp
    })).filter(item => item.weight != null);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip 
          labelFormatter={(value, payload) => 
            payload[0]?.payload?.timestamp 
              ? format(new Date(payload[0].payload.timestamp), 'PPP')
              : value
          }
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## 🔍 Form Validation Patterns

### React Hook Form with Zod Schema
```javascript
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Validation schema
const measurementSchema = z.object({
  weight_kg: z.number()
    .min(30, 'Minimum weight is 30kg')
    .max(300, 'Maximum weight is 300kg'),
  systolic_bp: z.number()
    .min(70, 'Systolic BP too low')
    .max(250, 'Systolic BP too high')
    .optional(),
  hunger_scale: z.number().min(1).max(10),
  satiety_scale: z.number().min(1).max(10),
  energy_scale: z.number().min(1).max(10),
  hydration_ml: z.number()
    .min(0)
    .max(5000, 'Maximum 5L per day')
    .optional()
});

// Form with schema validation
const useMeasurementForm = (defaultValues = {}) => {
  return useForm({
    resolver: zodResolver(measurementSchema),
    defaultValues,
    mode: 'onChange' // Real-time validation
  });
};
```

### Custom Validation Rules
```javascript
// Custom validation functions
export const validateWeight = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 'Must be a number';
  if (num < 30) return 'Minimum weight is 30kg';
  if (num > 300) return 'Maximum weight is 300kg';
  return true;
};

export const validateBloodPressure = (systolic, diastolic) => {
  if (systolic && diastolic && systolic <= diastolic) {
    return 'Systolic must be higher than diastolic';
  }
  return true;
};
```

## 🎨 UI/UX Component Guidelines

### shadcn/ui Integration
```javascript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Consistent component usage
<Card>
  <CardHeader>
    <CardTitle>Measurement Session</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Input placeholder="Weight (kg)" />
      <Button>Save Measurement</Button>
    </div>
  </CardContent>
</Card>
```

### Custom Component Pattern
```javascript
// Reusable scale slider component
const ScaleSlider = ({ label, value, onChange, min = 1, max = 10 }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}/{max}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
    </div>
  );
};
```

## 🔧 Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (`MeasurementForm.jsx`)
- **Hooks**: camelCase starting with `use` (`useMeasurementForm.js`)
- **Services**: camelCase ending with `Service` (`measurementsService.js`)
- **Utils**: camelCase ending with `Utils` (`validationUtils.js`)

### Import Organization
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. External library imports
import _ from 'lodash';
import { Calendar } from 'lucide-react';

// 3. UI component imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal component imports
import { MetricCard } from './MetricCard';
import { TrendChart } from './TrendChart';

// 5. Hook imports
import { useDashboardData } from '../hooks/useDashboardData';

// 6. Service imports
import { dashboardService } from '../services/dashboardService';

// 7. Utility imports
import { formatDate } from '@/shared/utils/dateUtils';
```

### Component Structure Template
```javascript
import { useForm, Controller } from 'react-hook-form'
import { create } from 'zustand'

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Zustand store
  const { globalState, globalActions } = useGlobalStore();

  // 2. React Hook Form
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // 3. Local state for UI only
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. Derived state
  const derivedValue = useMemo(() => {
    return someCalculation(prop1, globalState);
  }, [prop1, globalState]);

  // 5. Event handlers
  const handleSubmit = useCallback(async (data) => {
    try {
      const result = await apiService.create(data);
      globalActions.addItem(result);
    } catch (error) {
      console.error(error);
    }
  }, [globalActions]);

  // 6. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 7. Early returns
  if (!prop1) return null;

  // 8. Render
  return (
    <div className="component-container">
      {/* Form fields with React Hook Form */}
      <Input {...register('fieldName')} />
      {errors.fieldName && <span>{errors.fieldName.message}</span>}
      
      <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
    </div>
  );
};

export { ComponentName };
```

This architecture ensures a scalable, maintainable frontend codebase that follows React best practices while meeting the specific requirements of the health tracking application.