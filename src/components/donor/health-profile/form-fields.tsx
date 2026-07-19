export const inputClass =
	"mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ring";

export function Field({
	label,
	icon: Icon,
	className,
	children,
}: {
	label: string;
	icon?: React.ElementType;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<label className={`block ${className ?? ""}`}>
			<span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				{Icon && <Icon className="h-3.5 w-3.5" />}
				{label}
			</span>
			{children}
		</label>
	);
}

export function Checkbox({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2.5 text-sm text-foreground">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="h-4 w-4 rounded border-input text-brand focus:ring-ring"
			/>
			{label}
		</label>
	);
}
