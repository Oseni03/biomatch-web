"use server";

import { prisma } from "@/lib/prisma";

export interface AuditEntry {
	actorId?: string;
	organizationId?: string;
	action: string;
	entityType: string;
	entityId?: string;
	metadata?: Record<string, unknown>;
	ipAddress?: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
	await prisma.auditLog.create({
		data: {
			actorId: entry.actorId,
			organizationId: entry.organizationId,
			action: entry.action,
			entityType: entry.entityType,
			entityId: entry.entityId,
			metadata: (entry.metadata ?? {}) as object,
			ipAddress: entry.ipAddress,
		},
	});
}
