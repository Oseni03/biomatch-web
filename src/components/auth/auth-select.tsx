import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type AuthSelectProps = Omit<React.ComponentProps<"select">, "children"> & {
    id: string;
    label: string;
    options: readonly Option[];
    requiredIndicator?: boolean;
    hint?: string;
};

export function AuthSelect({
    id,
    label,
    options,
    requiredIndicator,
    hint,
    className,
    ...props
}: AuthSelectProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
                {label}
                {requiredIndicator && (
                    <span className="ml-0.5 text-brand" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            <select
                id={id}
                aria-describedby={hint ? `${id}-hint` : undefined}
                className={cn(
                    "w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand",
                    className,
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {hint && (
                <p id={`${id}-hint`} className="mt-2 text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
        </div>
    );
}