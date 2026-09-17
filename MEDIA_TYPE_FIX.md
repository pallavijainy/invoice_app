# Fix: 415 Unsupported Media Type Error

## Problem
The API was returning `415 Unsupported Media Type` error when creating/updating items and invoices.

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.16",
  "title": "Unsupported Media Type",
  "status": 415,
  "traceId": "00-9d1fd60078fb54d53350c85f652f1492-eb1eb43fa4e9d434-00"
}
```

## Root Cause
Axios was not explicitly setting the `Content-Type: application/json` header for POST/PUT requests. The server requires this header to be present for JSON requests, otherwise it rejects them with a 415 error.

## Solution
Updated the axios configuration in `src/services/api.ts` to:

1. **Set default Content-Type header** to `application/json` for all requests
2. **Preserve FormData Content-Type** for file uploads by removing the header when FormData is detected
3. **Maintain Authorization header** handling

### Code Changes

**File: `src/services/api.ts`**

```typescript
const axiosInstance = axios.create({
    baseURL: api.baseUrl,
    headers: {
        'Content-Type': 'application/json',  // ✅ Added
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Don't override Content-Type for multipart/form-data
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];  // ✅ Added
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

**File: `src/services/itemService.ts`**

```typescript
// Removed explicit Content-Type header from picture upload
async uploadPicture(itemID: number, pictureFile: File) {
    const formData = new FormData();
    formData.append("ItemID", itemID.toString());
    formData.append("File", pictureFile);

    // ContentType will be automatically handled by axios interceptor
    const response = await axiosInstance.post("/Item/UpdateItemPicture", formData);
    return response.data;
}
```

## How It Works

### For JSON Requests (POST /Item, PUT /Item, etc.)
1. Axios default header: `Content-Type: application/json`
2. Server receives proper header and accepts the request
3. Response: 201 Created or 200 OK

### For File Upload Requests (POST /Item/UpdateItemPicture)
1. FormData is created by browser
2. Axios interceptor detects FormData and removes the default header
3. Browser automatically sets `Content-Type: multipart/form-data; boundary=...`
4. Server receives proper header and processes the multipart form data
5. Response: 200 OK

## Testing

After this fix, the following requests should work:

```bash
# Create Item - Now works with proper Content-Type
POST /Item
Content-Type: application/json

{
  "itemName": "Test Item",
  "description": "Test",
  "salesRate": 99.99,
  "discountPct": 10
}

# Upload Picture - FormData handled automatically
POST /Item/UpdateItemPicture
Content-Type: multipart/form-data; boundary=...

ItemID: 123
File: [image data]

# Update Item - Now works with proper Content-Type
PUT /Item
Content-Type: application/json

{
  "itemID": 1,
  "itemName": "Updated Item",
  ...
}
```

## Files Modified
- ✅ `src/services/api.ts` - Added default Content-Type header and FormData detection
- ✅ `src/services/itemService.ts` - Removed explicit Content-Type header override

## Build Status
✅ Build successful after changes
✅ No TypeScript errors
✅ All routes prerendered successfully

## Notes
- The fix follows HTTP standards where `Content-Type` header is required for request bodies
- FormData automatically handles multipart encoding (no manual header needed)
- This fix applies to both Item and Invoice API calls
