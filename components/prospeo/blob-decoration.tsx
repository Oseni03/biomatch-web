export function BlobDecoration() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-[80px]" />
			<div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-amber-300/10 blur-[80px]" />
		</div>
	);
}
