# Phase 2 — Donor Finder / Directory ✅

**Goal**: Build the full Donor Finder page at `/hospital/donor-finder` and support location-based search. **Complete**.

## Steps

### 1. Add `location` field to User schema
**File**: `prisma/schema.prisma`

```prisma
model User {
  ...
  location String?
  ...
}
```

Run `npx prisma migrate dev --name add_donor_location` to generate the migration.

### 2. Extend `listDonors()` with location search
**File**: `servers/user.ts`

Accept additional filters:
```typescript
export async function listDonors(filters?: {
  bloodGroup?: BloodGroup;
  eligibleOnly?: boolean;
  search?: string;       // search name
  location?: string;     // partial match on location
  page?: number;
  pageSize?: number;
}) {
  const where: Prisma.UserWhereInput = { role: "donor" };

  if (filters?.bloodGroup) where.bloodGroup = filters.bloodGroup;
  if (filters?.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters?.search) where.name = { contains: filters.search, mode: "insensitive" };
  if (filters?.eligibleOnly) {
    const cutoff = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
    where.OR = [
      { lastDonationDate: null },
      { lastDonationDate: { lte: cutoff } },
    ];
  }

  const [donors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: ((filters?.page ?? 1) - 1) * (filters?.pageSize ?? 20),
      take: filters?.pageSize ?? 20,
      select: { id: true, name: true, email: true, bloodGroup: true, genotype: true, lastDonationDate: true, location: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { donors, total, page: filters?.page ?? 1, pageSize: filters?.pageSize ?? 20 };
}
```

### 3. Build the Donor Finder page
**File**: `app/hospital/donor-finder/page.tsx`

Full page with:
- **Search filters**: blood group (dropdown), location (text input), eligibility (toggle)
- **Results table**: name, blood group, genotype, location, last donation date, eligibility status badge
- **Pagination**: page controls at bottom
- **Empty state**: friendly message when no donors match
- **Loading state**: skeleton while fetching

Uses the React Query hook `useEligibleDonors(filters)` from Phase 1.

### 4. Reuse EligibleDonorsList component
Import and reuse `components/donor/eligible-donors-list.tsx` from Phase 1 for consistent rendering.

### 5. Update sidebar navigation
**File**: `components/layout/sidebar.tsx`

The Donor Finder link already exists — no changes needed. Optionally add a badge count showing available donors matching critical blood types.

## Files Changed / Created

| Action | File |
|---|---|
| Modify | `prisma/schema.prisma` |
| Modify | `servers/user.ts` |
| Modify | `app/hospital/donor-finder/page.tsx` (full build) |
| Create | (new migration) |
