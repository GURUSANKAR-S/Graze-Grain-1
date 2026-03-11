 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/admin") {
      return pathname.startsWith("/admin");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navClass = (href: string) =>
    `rounded-full px-3 py-2 transition ${
      isActive(href)
        ? "bg-[var(--brand)] text-white shadow-sm"
        : "hover:bg-amber-100/60 hover:text-[var(--brand-strong)] text-[var(--muted)]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/10 bg-[rgba(255,248,238,0.82)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-[var(--brand-strong)]">
          Graze <span className="text-[var(--foreground)]">&</span> Grain
        </Link>
        <nav>
          <ul className="flex items-center gap-1 rounded-full border border-amber-900/10 bg-white/70 p-1 text-sm font-semibold text-[var(--muted)] shadow-sm">
            <li>
              <Link href="/" className={navClass("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/menu" className={navClass("/menu")}>
                Menu
              </Link>
            </li>
            <li>
              <Link href="/about" className={navClass("/about")}>
                About
              </Link>
            </li>
            <li>
              <Link href="/reservations" className={navClass("/reservations")}>
                Reserve
              </Link>
            </li>
            <li>
              <Link href="/admin" className={navClass("/admin")}>
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
