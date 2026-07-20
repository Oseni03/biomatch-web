"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	variant?: "simple" | "numbered";
}

export function PaginationControls({
	page,
	totalPages,
	onPageChange,
	variant = "simple",
}: PaginationControlsProps) {
	if (totalPages <= 1) return null;

	if (variant === "numbered") {
		const windowSize = Math.min(totalPages, 7);
		const pageNumbers = Array.from({ length: windowSize }, (_, i) => {
			if (totalPages <= 7) return i + 1;
			if (page <= 4) return i + 1;
			if (page >= totalPages - 3) return totalPages - 6 + i;
			return page - 3 + i;
		});

		return (
			<div className="flex items-center justify-center gap-2 pt-2">
				<button
					onClick={() => onPageChange(Math.max(1, page - 1))}
					disabled={page <= 1}
					className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
				>
					<ChevronLeft className="h-4 w-4" />
					Previous
				</button>

				<div className="flex items-center gap-1">
					{pageNumbers.map((pageNum) => (
						<button
							key={pageNum}
							onClick={() => onPageChange(pageNum)}
							className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
								pageNum === page
									? "bg-brand text-white"
									: "text-muted-foreground hover:bg-muted"
							}`}
						>
							{pageNum}
						</button>
					))}
				</div>

				<button
					onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					disabled={page >= totalPages}
					className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center gap-3">
			<button
				onClick={() => onPageChange(Math.max(1, page - 1))}
				disabled={page <= 1}
				className="p-2 rounded-xl border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
			>
				<ChevronLeft className="h-4 w-4" />
			</button>
			<span className="text-sm text-muted-foreground font-mono">
				Page {page} of {totalPages}
			</span>
			<button
				onClick={() => onPageChange(Math.min(totalPages, page + 1))}
				disabled={page >= totalPages}
				className="p-2 rounded-xl border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
			>
				<ChevronRight className="h-4 w-4" />
			</button>
		</div>
	);
}
