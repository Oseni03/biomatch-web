import { Loader2 } from "lucide-react";

export function RouteLoading() {
	return (
		<div className="flex h-64 items-center justify-center">
			<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
		</div>
	);
}
