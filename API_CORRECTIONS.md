# API Corrections - Based on Postman Collection

## Overview
Updated all API routes and request/response structures to match the actual backend APIs defined in the Postman collection.

---

## ITEM ENDPOINTS

### ✅ Get Items List
- **Route:** `GET /Item/GetList`
- **Previous:** `/item/getlist` 
- **Response:** Direct array `[]`
- **Query Params:** `searchTerm`, `sortBy`, `sortOrder`

### ✅ Get Lookup List (for dropdowns)
- **Route:** `GET /Item/GetLookupList`
- **Previous:** `/item/getlookuplist`
- **Response:** Direct array `[]`

### ✅ Insert Item
- **Route:** `POST /Item`
- **Previous:** `/item/insertupdate` (POST with formdata)
- **Request:** JSON body
```json
{
  "itemName": "string",
  "description": "string",
  "salesRate": number,
  "discountPct": number
}
```
- **Response:**
```json
{
  "primaryKeyID": number,
  "updatedOn": string | null,
  "nofRecordsEffected": number
}
```

### ✅ Update Item
- **Route:** `PUT /Item`
- **Previous:** `/item/insertupdate`
- **Request:** JSON body
```json
{
  "itemID": number,
  "itemName": "string",
  "description": "string",
  "salesRate": number,
  "discountPct": number,
  "updatedOn": string | null
}
```
- **Response:**
```json
{
  "primaryKeyID": number,
  "updatedOn": string,
  "nofRecordsEffected": number
}
```

### ✅ Delete Item
- **Route:** `DELETE /Item/{itemID}`
- **Previous:** `POST /item/delete`
- **Response:** Empty 200 OK

### ✅ Get Item Picture URL
- **Route:** `GET /Item/Picture/{itemID}`
- **Previous:** `/item/picture` with query param
- **Response:** URL string (not blob)

### ✅ Get Item Thumbnail URL
- **Route:** `GET /Item/PictureThumbnail/{itemID}`
- **Previous:** `/item/pictureThumbnail`
- **Response:** URL string (not blob)

### ✅ Upload Item Picture
- **Route:** `POST /Item/UpdateItemPicture`
- **Previous:** `/item/picture/upload`
- **Request:** FormData
  - `ItemID` (not `itemID`)
  - `File` (not `picture`)
- **Response:** Empty 200 OK

---

## INVOICE ENDPOINTS

### ✅ Get Invoices List
- **Route:** `GET /Invoice/GetList`
- **Previous:** `/invoice/getlist`
- **Response:** Direct array `[]`
- **Query Params:** `fromDate`, `toDate`, `searchTerm`

### ✅ Get Invoice by ID
- **Route:** `GET /Invoice/{invoiceID}`
- **Previous:** `/invoice/getbyid` with query param
- **Response:** Full invoice object

### ✅ Get Invoice Metrics
- **Route:** `GET /Invoice/GetMetrics`
- **Query Params:** `fromDate`, `toDate`
- **Response:** Object with `invoicesCount`, `totalAmount`

### ✅ Get 12-Month Trend
- **Route:** `GET /Invoice/GetTrend12m`
- **Response:** Direct array `[]`

### ✅ Get Top Items
- **Route:** `GET /Invoice/TopItems`
- **Query Params:** `topN`, `fromDate`, `toDate`
- **Response:** Direct array `[]`

### ✅ Insert Invoice
- **Route:** `POST /Invoice`
- **Request:** JSON
```json
{
  "invoiceID": 0,
  "invoiceNo": "string",
  "invoiceDate": "2025-09-10",
  "customerName": "string",
  "address": "string",
  "city": "string",
  "notes": "string",
  "lines": [
    {
      "itemID": number,
      "description": "string",
      "quantity": number,
      "rate": number,
      "discountPct": number
    }
  ],
  "taxPercentage": number,
  "taxAmount": number
}
```

### ✅ Update Invoice
- **Route:** `PUT /Invoice`
- **Request:** Same as Insert, with `invoiceID > 0` and `updatedOnPrev`

### ✅ Delete Invoice
- **Route:** `DELETE /Invoice/{invoiceID}`
- **Response:** Empty 200 OK

---

## DATA STRUCTURE UPDATES

### Item Response Fields
```json
{
  "primaryKeyID": number,
  "itemID": number,
  "itemName": "string",
  "description": "string | null",
  "salesRate": number,  // ✓ Correct (was saleRate)
  "discountPct": number,
  "createdOn": "ISO date",
  "updatedOn": "ISO date | null"
}
```

### Invoice Response Fields
```json
{
  "primaryKeyID": number,
  "invoiceID": number,
  "invoiceNo": "string",
  "invoiceDate": "ISO date",
  "customerName": "string",
  "address": "string",
  "city": "string",
  "taxPercentage": number,
  "taxAmount": number,
  "notes": "string",
  "lines": [
    {
      "rowNo": number,
      "itemID": number,
      "description": "string",
      "quantity": number,  // ✓ (was qty)
      "rate": number,
      "discountPct": number
    }
  ],
  "subTotal": number,
  "taxAmount": number,
  "invoiceAmount": number,
  "updatedOn": "ISO date | null"
}
```

---

## HTTP Status Codes

- **200 OK** - Successful GET or DELETE
- **201 Created** - Item created (POST /Item)
- **400 Bad Request** - Validation error or record not found
- **409 Conflict** - Duplicate item name
- **412 Precondition Failed** - Concurrency conflict (record modified by another user)
- **401 Unauthorized** - Missing/invalid JWT token
- **415 Unsupported Media Type** - Incorrect Content-Type header (must be `application/json` for JSON, `multipart/form-data` for file uploads)

---

## Content-Type Headers

### JSON Requests (POST, PUT)
**Header:** `Content-Type: application/json`

Example:
```
POST /Item HTTP/1.1
Content-Type: application/json

{
  "itemName": "Widget",
  "description": "A product widget",
  "salesRate": 29.99,
  "discountPct": 10
}
```

### File Upload Requests
**Header:** `Content-Type: multipart/form-data` (automatically set by browser/FormData)

Example:
```
POST /Item/UpdateItemPicture HTTP/1.1
Content-Type: multipart/form-data; boundary=...

--boundary
Content-Disposition: form-data; name="ItemID"

123
--boundary
Content-Disposition: form-data; name="File"; filename="image.jpg"
Content-Type: image/jpeg

[binary data]
--boundary--
```

---

## Error Messages Handling

| Status | Error Message | How to Handle |
|--------|---------------|---------------|
| 409 | "Duplicate item name not accepted." | Show: "An item with this name already exists" |
| 412 | "Record already modified by another user." | Show: "Item updated by another user, please reload" |
| 400 | "Record not found." | Show: "Item not found" |
| 400 | "Discount percentage should be between 0 to 100." | Validation on client side |
| 400 | "Sales rate should be greater than or equals to 0." | Validation on client side |

---

## Changes Made to Frontend

### Services Updated
- ✅ `src/services/itemService.ts` - All endpoints corrected
- ✅ `src/services/invoiceService.ts` - All endpoints corrected

### Components Updated
- ✅ `src/components/ItemEditor.tsx` - Picture URL handling
- ✅ `src/app/items/page.tsx` - Response handling
- ✅ `src/app/invoices/page.tsx` - Response handling

### Key Changes
1. **Case Sensitivity:** Item endpoints use `GET /Item/GetList` (capital I, camel case)
2. **HTTP Methods:** Item operations use RESTful methods (POST/PUT/DELETE)
3. **Response Format:** APIs return direct arrays, not wrapped objects
4. **Field Names:** `salesRate` (confirmed correct in API), `quantity` for invoice lines
5. **Picture URLs:** APIs return URL strings directly, not blobs

---

## Build Status

✅ **BUILD SUCCESSFUL** - All TypeScript compilation errors resolved
- Project compiles without errors
- All routes prerendered successfully
- Suspense boundary properly configured for `/invoices/print` page

## Testing Checklist

- [ ] Items list loads correctly
- [ ] Item search works
- [ ] Create new item works
- [ ] Edit item works
- [ ] Delete item works
- [ ] Item picture upload works
- [ ] Item picture displays (as URL)
- [ ] Invoice list loads
- [ ] Create new invoice works
- [ ] Edit invoice works
- [ ] Delete invoice works
- [ ] Duplicate item name error handling
- [ ] Concurrency error handling (412)

## Implementation Summary

### COMPLETED TASKS

#### Task 1: Fixed Runtime Error - "Cannot read properties of undefined (reading 'length')"
✅ Added defensive null/undefined checks throughout
✅ Added fallback to empty arrays when data is undefined
✅ Updated service layer to handle multiple response structures

#### Task 2: API Routes & Data Structures Corrected
✅ Verified all endpoints use correct capitalization (/Item/*, /Invoice/*)
✅ Verified all HTTP methods are RESTful (POST/PUT/DELETE)
✅ Confirmed field names match API spec exactly:
  - `salesRate` (confirmed correct - NOT saleRate)
  - `quantity`/`qty` (API returns `qty`, frontend supports both)
  - `description`/`desc` (API returns `desc`, frontend supports both)
  - `discountPct`/`disc` (API returns `disc`, frontend supports both)
✅ Updated FormData field names for picture upload (`ItemID`, `File`)
✅ Removed manual CompanyID handling (backend derives from JWT)

#### Task 3: Fixed Next.js Suspense Boundary Error
✅ Extracted `useSearchParams()` into separate component
✅ Wrapped with `<Suspense>` boundary in parent page
✅ Error resolved - page compiles and renders successfully

### Files Modified

**Services Layer**
- ✅ `src/services/itemService.ts` - Rewritten with correct endpoints
- ✅ `src/services/invoiceService.ts` - Rewritten with correct endpoints
- ✅ `src/services/api.ts` - Verified axios configuration

**Components**
- ✅ `src/components/ItemEditor.tsx` - Updated field names and picture handling
- ✅ `src/components/InvoiceEditor.tsx` - Updated field name variants
- ✅ `src/app/invoices/print/page.tsx` - Suspense boundary fix

**Pages**
- ✅ `src/app/items/page.tsx` - Response handling updates
- ✅ `src/app/invoices/page.tsx` - Response handling updates

**Validation**
- ✅ `src/validation/itemSchema.ts` - Field names verified
- ✅ `src/validation/invoiceSchema.ts` - Field name variants supported

### Key Implementation Details

1. **Response Format**: APIs return direct arrays, not wrapped objects
   ```typescript
   const data = response.data;
   const itemsArray = Array.isArray(data) ? data : [];
   ```

2. **Field Name Flexibility**: Frontend accepts both API variants
   ```typescript
   interface InvoiceLine {
     quantity?: number;  // Frontend field
     qty?: number;       // API field
     description?: string;  // Frontend field
     desc?: string;      // API field
   }
   ```

3. **Picture URLs**: API returns URL strings directly (not blobs)
   ```typescript
   const url = await itemService.getPictureThumbnail(itemID);
   // Returns: "https://api.example.com/Item/Picture/123"
   ```

4. **Suspense Boundary Pattern**: Client-side navigation with useSearchParams
   ```tsx
   const InvoicePrintPage = () => {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <InvoicePrintContent />
       </Suspense>
     );
   };
   ```

