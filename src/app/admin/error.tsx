"use client";

import {
	RouteError,
	type RouteErrorProps,
} from "@/components/layout/route-error";

export default function AdminError(props: RouteErrorProps) {
	return <RouteError {...props} />;
}
