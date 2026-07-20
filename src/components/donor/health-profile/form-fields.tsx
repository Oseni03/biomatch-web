export const inputClass =
	"w-full rounded-xl border-border bg-muted px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
			<span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
				{Icon && <Icon className="h-3 w-3" />}
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
