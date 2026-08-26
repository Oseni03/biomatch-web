interface DateRangePickerProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (value: string) => void;
	onEndDateChange: (value: string) => void;
}

export function DateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: DateRangePickerProps) {
	return (
		<div className="flex items-center gap-4 flex-wrap">
			<div className="flex items-center gap-2">
				<label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
					From
				</label>
				<input
					type="date"
					value={startDate}
					onChange={(e) => onStartDateChange(e.target.value)}
					className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium"
				/>
			</div>
			<div className="flex items-center gap-2">
				<label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
					To
				</label>
				<input
					type="date"
					value={endDate}
					onChange={(e) => onEndDateChange(e.target.value)}
					className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium"
				/>
			</div>
		</div>
	);
}
