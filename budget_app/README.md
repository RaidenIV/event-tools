# Event Budget Tracker - Modular Structure

## 📁 Module Organization

Your app has been broken down into 8 focused modules:

### 1. **state.js** - State Management
- Centralized app state (headliners, DJs, charts, etc.)
- Field definitions for all form inputs
- CSV metadata and versioning
- Field mapping utilities

### 2. **utils.js** - Utility Functions
- `getNum()` / `getStr()` - Safe DOM value getters
- `setVal()` - Safe DOM value setter
- `storeValues()` / `restoreValues()` - Dynamic field persistence
- `safeFileName()` - Filename sanitization
- File naming helpers (CSV, TXT, PNG)
- `fmtMoney()` - Currency formatting
- `loadImage()` - Promise-based image loading

### 3. **repeaters.js** - Dynamic Form Fields
- `regenerateHeadliners()` - Dynamic headliner inputs
- `regenerateLocalDJs()` - Local DJ inputs
- `regenerateCDJs()` - CDJ equipment inputs
- `regenerateShowRunners()` - Show runner inputs
- `regenerateVendors()` - Merch vendor inputs
- `regenerateOtherCategories()` - Custom expense categories
- `regenerateOtherItems()` - Items within categories

### 4. **budgetCalculator.js** - Budget Logic
- `calculateBudget()` - Core calculation engine
  - Totals expenses by category
  - Totals revenue streams
  - Calculates net profit
- `updateSummaryDisplay()` - Updates summary section UI

### 5. **charts.js** - Chart Management
- `updateCharts()` - Renders/updates pie charts
- Chart.js configuration and styling
- Legend formatting with percentages
- `downloadChartsPNG()` - Exports charts as single PNG

### 6. **textPreview.js** - Text Budget Preview
- `updateTextPreview()` - Generates formatted text budget
- Alignment and formatting logic
- `copyTextPreview()` - Copy to clipboard
- `exportTextPreviewTxt()` - Export as .txt file

### 7. **csv.js** - CSV Import/Export
- `downloadCSV()` - Exports budget to CSV
- `loadCSV()` - Imports CSV with backward compatibility
- `setupCSVImport()` - Configures file input handler
- `triggerImport()` - Opens file picker
- Legacy format support

### 8. **main.js** - Application Controller
- `updateBudget()` - Orchestrates all updates
- `resetForm()` - Clears all data
- `downloadAll()` - Exports all formats
- `toggleCollapse()` - Collapsible section handler
- Global function registration for HTML handlers
- DOM initialization

## 🔗 Module Dependencies

```
main.js (orchestrator)
  ├── state.js (data)
  ├── utils.js (helpers)
  ├── repeaters.js → state.js, utils.js
  ├── budgetCalculator.js → utils.js
  ├── charts.js → state.js, utils.js
  ├── textPreview.js → utils.js
  └── csv.js → state.js, utils.js, repeaters.js
```

## 🚀 Usage

### In HTML:
```html
<!-- Load modules in order -->
<script type="module" src="js/state.js"></script>
<script type="module" src="js/utils.js"></script>
<script type="module" src="js/repeaters.js"></script>
<script type="module" src="js/budgetCalculator.js"></script>
<script type="module" src="js/charts.js"></script>
<script type="module" src="js/textPreview.js"></script>
<script type="module" src="js/csv.js"></script>
<script type="module" src="js/main.js"></script>
```

### Importing in JS:
```javascript
// Example: Using utilities
import { getNum, fmtMoney } from './utils.js';

// Example: Using state
import { state, FIELDS } from './state.js';

// Example: Triggering updates
import { updateBudget } from './main.js';
```

## 📝 Benefits of This Structure

✅ **Separation of Concerns** - Each module has one clear responsibility  
✅ **Maintainability** - Easy to find and fix issues  
✅ **Reusability** - Modules can be reused in other projects  
✅ **Testability** - Each module can be tested independently  
✅ **Scalability** - Easy to add new features without breaking existing code  
✅ **Readability** - Smaller files are easier to understand

## 🛠️ Extending the App

### Adding a New Field:
1. Add to `FIELDS` in **state.js**
2. Update CSV export in **csv.js** → `downloadCSV()`
3. Update CSV import in **csv.js** → `loadCSV()`
4. Update calculation in **budgetCalculator.js**
5. Update preview in **textPreview.js**

### Adding a New Feature:
1. Create new module file (e.g., `analytics.js`)
2. Import dependencies from other modules
3. Export functions for use elsewhere
4. Import into **main.js** and wire up

## 🔍 Finding Things

- **Need to change calculations?** → `budgetCalculator.js`
- **Need to fix charts?** → `charts.js`
- **Need to modify CSV format?** → `csv.js`
- **Need to add dynamic fields?** → `repeaters.js`
- **Need to adjust text preview?** → `textPreview.js`
- **Need to add new data fields?** → `state.js`
- **Need helper functions?** → `utils.js`
- **Need to coordinate features?** → `main.js`