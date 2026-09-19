"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, ChevronsUpDown, HelpCircle, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { PROFILE_URL, type Role } from "./nav-config";
import { SupportDialog } from "./support-dialog";

export interface SidebarUser {
    name: string;
    email: string;
    image?: string | null;
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function UserIdentity({ role, user }: { role: Role; user: SidebarUser }) {
    return (
        <>
            <Avatar className="size-8 rounded-lg">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="rounded-lg border border-brand/20 bg-brand/10 text-xs font-bold text-brand">
                    {role === "hospital" ? (
                        <Building2 className="size-4" aria-hidden="true" />
                    ) : (
                        getInitials(user.name)
                    )}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {user.email && (
                    <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
                )}
            </div>
        </>
    );
}

interface SidebarUserMenuProps {
    role: Role;
    user: SidebarUser;
    /** Overrides the built-in Help dialog with a caller-owned one. */
    onSupportClick?: () => void;
}

export function SidebarUserMenu({ role, user, onSupportClick }: SidebarUserMenuProps) {
    const router = useRouter();
    const { isMobile, setOpenMobile } = useSidebar();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const openSupport = () => {
        if (onSupportClick) {
            onSupportClick();
        } else {
            setIsHelpOpen(true);
        }
    };

    const handleSignOut = async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            const { error } = await authClient.signOut();
            if (error) throw error;
            router.replace("/auth/login");
            router.refresh();
        } catch {
            toast.error("Couldn't sign you out. Please try again.");
            setIsSigningOut(false);
        }
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    {/* modal={false} avoids Radix leaving the page unclickable when a dialog opens from a menu item */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="rounded-xl data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <UserIdentity role={role} user={user} />
                                <ChevronsUpDown
                                    className="ml-auto size-4 text-sidebar-foreground/50"
                                    aria-hidden="true"
                                />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl"
                            side={isMobile ? "top" : "right"}
                            align="end"
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5">
                                    <UserIdentity role={role} user={user} />
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href={PROFILE_URL[role]} onClick={() => setOpenMobile(false)}>
                                        <User className="size-4" aria-hidden="true" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={openSupport}>
                                    <HelpCircle className="size-4" aria-hidden="true" />
                                    Help &amp; Support
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                disabled={isSigningOut}
                                onSelect={(event) => {
                                    // Keep the menu open so "Signing out…" is visible until we navigate.
                                    event.preventDefault();
                                    void handleSignOut();
                                }}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <LogOut className="size-4" aria-hidden="true" />
                                {isSigningOut ? "Signing out…" : "Log out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <SupportDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
        </>
    );
}