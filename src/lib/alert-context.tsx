"use client";

import { createContext, useContext } from "react";

const AlertCountContext = createContext(0);

export function AlertCountProvider({
	value,
	children,
}: {
	value: number;
	children: React.ReactNode;
}) {
	return (
		<AlertCountContext.Provider value={value}>
			{children}
		</AlertCountContext.Provider>
	);
}

export function useAlertCount() {
	return useContext(AlertCountContext);
}
