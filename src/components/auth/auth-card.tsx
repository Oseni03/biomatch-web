"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { EASE_SMOOTH } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthCardProps {
	icon?: ReactNode;
	title: string;
	description?: ReactNode;
	children: ReactNode;
}

export function AuthCard({ icon, title, description, children }: AuthCardProps) {
	return (
		<Card className="rounded-3xl p-2">
			<CardHeader className="relative pb-2 pt-6 text-center">
				{icon && (
					<div className="mx-auto mb-4 flex h-10 w-10 scale-100 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 hover:scale-105">
						{icon}
					</div>
				)}
				<CardTitle className="text-3xl font-semibold tracking-tighter">
					{title}
				</CardTitle>
				{description && (
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						{description}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="p-6 pt-0">
				{children}
			</CardContent>
		</Card>
	);
}
