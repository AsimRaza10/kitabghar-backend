# Database Migration Scripts

## Order Snapshots Migration

This script migrates existing orders to include book snapshot data, ensuring that order history is preserved even if books are deleted from the system.

### What it does:
- Finds all orders without `bookSnapshot` data
- For each order item, creates a snapshot containing:
  - Book title
  - Book author
  - Book image
- If the book still exists, uses current book data
- If the book was deleted, creates a placeholder snapshot

### How to run:

```bash
cd backend
node src/scripts/migrateOrderSnapshots.js
```

### When to run:
- After deploying the updated Order model with bookSnapshot fields
- One-time migration for existing orders
- Safe to run multiple times (idempotent)

### Output:
The script will show:
- Number of orders found to migrate
- Success/failure status for each order
- Final summary with counts

### Note:
Make sure your `.env` file has the correct `MONGO_URI` configured before running the script.
