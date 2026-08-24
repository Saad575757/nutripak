"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Applies a short transition class so palette changes feel smooth but subtle. */
function useThemeTransition() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("theme-transitioning");
    };
  }, []);

  return () => {
    document.documentElement.classList.add("theme-transitioning");
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 220);
  };
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const withTransition = useThemeTransition();

  const select = (value: string) => {
    withTransition();
    setTheme(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => select("light")}
          data-active={theme === "light"}
        >
          <Sun className="size-4" aria-hidden /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => select("dark")}
          data-active={theme === "dark"}
        >
          <Moon className="size-4" aria-hidden /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => select("system")}
          data-active={theme === "system"}
        >
          <Laptop className="size-4" aria-hidden /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
