# Invoice API Fixes - Request Format Corrections

## Issue
When creating invoices, the API was rejecting requests with error:
```json
{
  "status": 400,
  "title": "One or more validation errors occurred.",
  "errors": {
    "model": ["The model field is required."],
    "$.invoiceNo": ["The JSON value could not be converted to System.Nullable`1[System.Int32]..."]
  }
}
```

## Root Causes

### 1. invoiceNo was a String, API Expects Number
- **Frontend sent:** `"invoiceNo": "INV-001"` (string)
- **API expects:** `"invoiceNo": 1` (number)

### 2. Incorrect Field Names in Lines
- **Frontend sent:** `qty`, `desc`, `disc`
- **API expects:** `quantity`, `description`, `discountPct`

### 3. Missing rowNo Field
- API lines require `rowNo` field for ordering

### 4. Sending invoiceID for POST (Should be POST-only)
- For new invoices (POST), `invoiceID` should NOT be included
- For updates (PUT), `invoiceID` should be included

## Corrections Made

### 1. Updated Invoice Service (`src/services/invoiceService.ts`)

#### Interface Changes
```typescript
// Before
export interface InvoiceLine {
  itemID: number;
  description?: string;
  desc?: string;
  quantity?: number;
  qty?: number;
  rate: number;
  discountPct?: number;
  disc?: number;
}

// After - Only API field names
export interface InvoiceLine {
  rowNo?: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}
```

#### insertUpdate Method Changes
```typescript
// Now converts form data to correct API format
async insertUpdate(...) {
  // Transform lines to API format
  const apiLines = lines.map((line, index) => ({
    rowNo: (line.rowNo || index + 1),  // ✅ Add rowNo
    itemID: line.itemID,
    description: line.description || '',
    quantity: line.quantity || 0,       // ✅ Use quantity not qty
    rate: line.rate || 0,
    discountPct: line.discountPct || 0, // ✅ Use discountPct not disc
  }));

  const payload: Record<string, any> = {
    invoiceNo: Number(invoiceNo),  // ✅ Convert to number
    invoiceDate,
    customerName,
    address,
    city,
    notes,
    lines: apiLines,
    taxPercentage,
    taxAmount: taxAmount || 0,
  };

  // Only add invoiceID for updates
  if (invoiceID > 0) {
    payload.invoiceID = invoiceID;
    if (updatedOnPrev) {
      payload.updatedOnPrev = updatedOnPrev;
    }
  }
  // ✅ POST for new, PUT for update
  const method = invoiceID === 0 ? "post" : "put";
  const response = await axiosInstance[method]("/Invoice", payload);
}
```

### 2. Updated Invoice Schema (`src/validation/invoiceSchema.ts`)

```typescript
// Before: Mixed field names and optional fields
invoiceLineSchema = z.object({
  itemID: z.number().min(1, "Item is required"),
  description: z.string().optional(),
  desc: z.string().optional(),      // ❌ Removed
  quantity: z.number().optional(),
  qty: z.number().optional(),        // ❌ Removed
  rate: z.number().min(0),
  discountPct: z.number().optional(),
  disc: z.number().optional(),       // ❌ Removed
});

// After: Only API field names, discountPct with default
invoiceLineSchema = z.object({
  rowNo: z.number().optional(),
  itemID: z.number().min(1, "Item is required"),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  rate: z.number().min(0),
  discountPct: z.number().min(0).max(100).default(0),  // ✅ Default 0
});

// invoiceNo is now a number
invoiceEditorSchema = z.object({
  invoiceNo: z.number().min(1, "Invoice number is required"),  // ✅ Number not string
  // ...rest of fields
});
```

### 3. Updated InvoiceEditor Component (`src/components/InvoiceEditor.tsx`)

```typescript
// Default values - use correct field names
defaultValues: {
  invoiceNo: 0,  // ✅ Number type
  // ...
  lines: [{ 
    itemID: 0, 
    description: "",  // ✅ Not desc
    quantity: 0,      // ✅ Not qty
    rate: 0, 
    discountPct: 0    // ✅ Not disc
  }],
}

// When selecting item
handleItemChange = (lineIndex: number, itemID: number) => {
  const item = itemLookup.find((i) => i.itemID === itemID);
  if (item) {
    setValue(`lines.${lineIndex}.itemID`, item.itemID);
    setValue(`lines.${lineIndex}.description`, item.description);  // ✅ description
    setValue(`lines.${lineIndex}.rate`, item.salesRate);
    setValue(`lines.${lineIndex}.discountPct`, item.discountPct);  // ✅ discountPct
  }
}

// Form field: invoiceNo is now number input
<input
  type="number"
  {...register("invoiceNo", { valueAsNumber: true })}
/>

// Table cells use correct field names
{...register(`lines.${index}.description`)}  // ✅ Not desc
{...register(`lines.${index}.quantity`)}     // ✅ Not qty
{...register(`lines.${index}.discountPct`)}  // ✅ Not disc
```

### 4. Updated Print Page (`src/app/invoices/print/page.tsx`)

```typescript
// Use API field names from response
{invoice.lines.map((line) => (
  <tr>
    <td>{line.description}</td>           // ✅ Use description
    <td>{line.quantity}</td>              // ✅ Use quantity
    <td>{line.discountPct}</td>           // ✅ Use discountPct
  </tr>
))}
```

## API Request Format

### POST - Create New Invoice
```json
{
  "invoiceNo": 1,                    // ✅ Number type
  "invoiceDate": "2025-09-10",
  "customerName": "John Doe",
  "address": "123 Street",
  "city": "New York",
  "notes": "Payment due in 30 days",
  "lines": [
    {
      "rowNo": 1,                    // ✅ Include rowNo
      "itemID": 10,
      "description": "Product A",    // ✅ Not desc
      "quantity": 5,                 // ✅ Not qty
      "rate": 100.00,
      "discountPct": 10              // ✅ Not disc
    }
  ],
  "taxPercentage": 10,
  "taxAmount": 55
}
```

### PUT - Update Invoice
```json
{
  "invoiceID": 1,                    // ✅ Only for PUT
  "invoiceNo": 1,
  "invoiceDate": "2025-09-10",
  "customerName": "John Doe",
  "address": "123 Street",
  "city": "New York",
  "notes": "Payment due in 30 days",
  "lines": [
    {
      "rowNo": 1,
      "itemID": 10,
      "description": "Product A",
      "quantity": 5,
      "rate": 100.00,
      "discountPct": 10
    }
  ],
  "taxPercentage": 10,
  "taxAmount": 55,
  "updatedOnPrev": "2025-09-10T10:30:00.000Z"  // ✅ For concurrency check
}
```

## Files Modified
- ✅ `src/services/invoiceService.ts` - Fixed request format and field names
- ✅ `src/validation/invoiceSchema.ts` - Updated to use API field names
- ✅ `src/components/InvoiceEditor.tsx` - Use correct field names throughout
- ✅ `src/app/invoices/print/page.tsx` - Display correct field names

## Build Status
✅ **Compiled successfully** - No TypeScript errors

## Testing

The following should now work:
- Create new invoice with line items ✅
- invoiceNo accepts numeric input ✅
- Line items with description, quantity, rate, discount ✅
- Update existing invoice ✅
- Print invoice with correct values ✅

## Technical Details

### Type Safety
- Invoice line interface now strictly requires correct field names
- invoiceNo is number type (validated by schema)
- discountPct has default value of 0
- No optional/variant field names causing confusion

### Data Transformation
- Frontend uses consistent field names internally
- Service layer transforms to API format only when sending
- Response parsing remains flexible for backward compatibility

### RESTful Compliance
- POST for create (no invoiceID in payload)
- PUT for update (includes invoiceID and updatedOnPrev)
- Proper HTTP methods aligned with API expectations
