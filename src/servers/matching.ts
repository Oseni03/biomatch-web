"use server";

import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { LOCATION_FRESH_HOURS } from "@/lib/config";

export interface EligibleDonor {
	donorId: string;
	distanceKm: number;
}

// Eligible-donor query (see prisma/biomatch_constraints.sql backend note 3):
// compatible blood, verified, active, available, out of cooldown, not banned,
// within the radius. Uses the last-known location when fresh, else the home
// pin. Phone verification deliberately does NOT affect matching. Donors
// already matched to the request are excluded, so re-running only matches
// newly eligible donors (escalation in slice 15 reuses this).
export async function findEligibleDonors(
	requestId: string,
	radiusKm: number,
	freshHours = LOCATION_FRESH_HOURS,
): Promise<EligibleDonor[]> {
	const rows = await prisma.$queryRaw<{ userId: string; km: number }[]>(
		Prisma.sql`
      WITH r AS (
        SELECT id, "bloodGroup", latitude, longitude FROM blood_requests WHERE id = ${requestId}::uuid
      )
      SELECT d."userId", dist.km
      FROM r
      JOIN blood_compatibility c ON c."recipientGroup" = r."bloodGroup"
      JOIN donor_profiles d ON d."bloodGroup" = c."donorGroup"
      JOIN "user" u ON u.id = d."userId" AND COALESCE(u.banned, false) = false
      CROSS JOIN LATERAL (
        SELECT CASE WHEN d."lastKnownAt" > now() - make_interval(hours => ${freshHours})
                    THEN d."lastKnownLatitude"  ELSE d."homeLatitude"  END AS lat,
               CASE WHEN d."lastKnownAt" > now() - make_interval(hours => ${freshHours})
                    THEN d."lastKnownLongitude" ELSE d."homeLongitude" END AS lng
      ) loc
      CROSS JOIN LATERAL (
        SELECT 2 * 6371 * asin(LEAST(1.0, sqrt(
                 power(sin(radians(loc.lat - r.latitude) / 2), 2)
               + cos(radians(r.latitude)) * cos(radians(loc.lat))
                 * power(sin(radians(loc.lng - r.longitude) / 2), 2)))) AS km
      ) dist
      WHERE d."verificationStatus" = 'verified'
        AND d."donorStatus" = 'active'
        AND d."isAvailable"
        AND (d."cooldownUntil" IS NULL OR d."cooldownUntil" <= now())
        AND loc.lat IS NOT NULL AND loc.lng IS NOT NULL
        AND dist.km <= ${radiusKm}
        AND NOT EXISTS (SELECT 1 FROM request_matches m
                         WHERE m."requestId" = r.id AND m."donorId" = d."userId")
      ORDER BY dist.km`,
	);
	return rows.map((row) => ({
		donorId: row.userId,
		distanceKm: Math.round(Number(row.km) * 100) / 100,
	}));
}
