"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/nav";

export default function NavMenu({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-stone-700 flex-wrap">
      {items.map((item) =>
        item.children ? (
          <Dropdown key={item.href} item={item} />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded hover:bg-stone-100"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        aria-expanded={open}
        onClick={() => setOpen(false)}
        className="px-3 py-2 rounded hover:bg-stone-100 inline-flex items-center gap-1"
      >
        {item.label}
        <span className="text-xs text-stone-400">▾</span>
      </Link>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-50">
          {item.children?.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
              onClick={() => setOpen(false)}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
