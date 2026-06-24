# Phase 3 — Real-time Inventory via SSE

**Goal**: Replace the 10-second `setInterval` polling on the inventory page with Server-Sent Events for efficient real-time updates.

## Steps

### 1. Create SSE route handler
**New file**: `app/api/inventory/stream/route.ts`

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const sendData = async () => {
        const banks = await prisma.hospitalBank.findMany();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(banks)}\n\n`));
      };

      sendData();

      // Poll DB and push updates every 5s
      const interval = setInterval(sendData, 5000);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 2. Create `useInventoryStream` hook
**New file**: `hooks/use-inventory-stream.ts`

Custom hook that:
- Opens an `EventSource` to `/api/inventory/stream`
- Parses incoming `data` events
- Updates state or React Query cache
- Reconnects on error with exponential backoff
- Closes on unmount

```typescript
export function useInventoryStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const es = new EventSource("/api/inventory/stream");

    es.onmessage = (event) => {
      const banks = JSON.parse(event.data);
      queryClient.setQueryData(["inventory"], banks);
    };

    es.onerror = () => {
      // Reconnect handled by browser automatically
    };

    return () => es.close();
  }, [queryClient]);
}
```

### 3. Replace polling in inventory page
**File**: `app/hospital/inventory/page.tsx`

- Remove the `setInterval(fetchBanks, 10000)` call
- Call `useInventoryStream()` at the top of the component
- Keep `fetchBanks()` as a one-time initial load via the React Query hook
- The SSE stream populates the cache, and the component re-renders automatically

### 4. Authenticate the SSE endpoint (optional)
**File**: `app/api/inventory/stream/route.ts`

Add session verification to ensure only authenticated hospital users can subscribe:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user || session.user.role !== "hospital") {
  return new Response("Unauthorized", { status: 401 });
}
```

## Files Changed / Created

| Action | File |
|---|---|
| Create | `app/api/inventory/stream/route.ts` |
| Create | `hooks/use-inventory-stream.ts` |
| Modify | `app/hospital/inventory/page.tsx` |
