"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

/** Updates a single query parameter while preserving the rest (and resetting paging). */
function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      if (key !== "page") params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );
}

interface SearchInputProps {
  paramKey?: string;
  placeholder: string;
  ariaLabel?: string;
}

export function SearchInput({
  paramKey = "q",
  placeholder,
  ariaLabel,
}: SearchInputProps) {
  const setParam = useSetParam();
  const currentValue = useSearchParams().get(paramKey) ?? "";
  const [value, setValue] = useState(currentValue);
  const [lastExternalValue, setLastExternalValue] = useState(currentValue);

  // Adopt URL changes made outside this input (clear filters, back/forward)
  // by adjusting state during render per the React-recommended pattern.
  if (currentValue !== lastExternalValue) {
    setLastExternalValue(currentValue);
    setValue(currentValue);
  }

  useEffect(() => {
    if (value === currentValue) return;
    const timeout = setTimeout(() => {
      setParam(paramKey, value.trim() || null);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            setValue("");
            setParam(paramKey, null);
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="pr-8"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            setParam(paramKey, null);
          }}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

interface FilterSelectProps {
  paramKey: string;
  placeholder: string;
  /** When provided, adds an "All …" option with this label and empty value. */
  allLabel?: string;
  options: { label: string; value: string }[];
  ariaLabel?: string;
}

export function FilterSelect({
  paramKey,
  placeholder,
  allLabel,
  options,
  ariaLabel,
}: FilterSelectProps) {
  const setParam = useSetParam();
  const current = useSearchParams().get(paramKey) ?? "";
  const value = current || (allLabel ? ALL_VALUE : "");

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        setParam(paramKey, next === ALL_VALUE ? null : next)
      }
    >
      <SelectTrigger
        className="w-full sm:w-44"
        aria-label={ariaLabel ?? placeholder}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel ? (
          <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
