"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Key, ChevronDown } from "lucide-react";
import { AuthUser } from "@/lib/api";
import { useState } from "react";
import { ChangePasswordDialog } from "./change-password-dialog";

export function AccountMenu({ auth, logout }: { auth: AuthUser | null; logout: () => void }) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const name = auth?.fullName;
  const email = auth?.email ?? "";
  const role = auth?.roles?.[0] ?? "";
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ||
    email.charAt(0).toUpperCase() ||
    "?";

  const prettyRole = role
    ? role
        .toLowerCase()
        .split("_")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group flex items-center h-10 px-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 gap-2 outline-none"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-300 transition-colors duration-200">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <span className="text-xs font-semibold leading-none truncate max-w-[120px] text-slate-700 dark:text-slate-200">
              {name || email.split("@")[0] || "Guest"}
            </span>
            {prettyRole && (
              <span className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium truncate max-w-[120px]">
                {prettyRole}
              </span>
            )}
          </div>
          <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
      >
        {/* Profile header */}
        <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-700 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {name || email || "Guest"}
              </p>
              {email && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {email}
                </p>
              )}
              {prettyRole && (
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                  {prettyRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-1.5">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setPasswordDialogOpen(true);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Key className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Change Password</span>
              <span className="block text-[11px] text-slate-400 dark:text-slate-500">Update your credentials</span>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Logout */}
        <div className="p-1.5">
          <DropdownMenuItem
            onSelect={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/30">
              <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <span className="block text-sm font-medium">Sign out</span>
              <span className="block text-[11px] text-red-400 dark:text-red-500">End your session</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </DropdownMenu>
  );
}
