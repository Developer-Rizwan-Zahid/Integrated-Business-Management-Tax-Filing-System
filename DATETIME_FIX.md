# DateTime UTC Fix for PostgreSQL

## Problem
PostgreSQL requires UTC DateTime values when using `timestamp with time zone`, but the application was sending Local DateTime values, causing:
```
Cannot write DateTime with Kind=Local to PostgreSQL type 'timestamp with time zone', only UTC is supported.
```

## Solution Applied

### 1. **Model Fix** (`Models/Tax.cs`)
- Changed `CalculatedDate` default from `DateTime.Now` to `DateTime.UtcNow`

### 2. **Controller Fixes**
All controllers now convert incoming DateTime values to UTC:

#### TaxController.cs
- Explicitly sets `CalculatedDate = DateTime.UtcNow` when creating TaxRecord

#### FinanceController.cs
- Converts `incomeDto.Date` to UTC before saving
- Converts `expenseDto.Date` to UTC before saving

#### AssetController.cs
- Converts `assetDto.PurchaseDate` to UTC before saving
- Already using `DateTime.UtcNow` for `AssignedDate`

### 3. **Global Value Converter** (`Data/AppDbContext.cs`)
Added automatic UTC conversion for ALL DateTime properties:
- All DateTime values are automatically converted to UTC before saving
- All DateTime? (nullable) values are also handled
- This ensures no DateTime values slip through without conversion

## How It Works

1. **Frontend**: Sends dates using `toISOString()` which is already UTC format
2. **Backend Controllers**: Convert incoming dates to UTC if needed
3. **DbContext**: Global value converter ensures ALL DateTime values are UTC before database operations

## Testing

After these fixes, you should be able to:
- ✅ Calculate taxes without DateTime errors
- ✅ Add assets with purchase dates
- ✅ Add income/expenses with dates
- ✅ All DateTime operations work correctly with PostgreSQL

## Notes

- The value converter in `AppDbContext` provides a safety net for any DateTime properties that might be missed
- All DateTime comparisons and queries should continue to work as expected
- Dates are stored in UTC and can be converted to local time when displaying to users

---

**All DateTime issues resolved!** ✅
