"use client";

import { RouteError, type RouteErrorProps } from "@/components/layout/route-error";

export default function Error({ error, reset }: RouteErrorProps) {
	return <RouteError error={error} reset={reset} />;
}
