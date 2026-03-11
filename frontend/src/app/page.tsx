import Image from 'next/image';
import Link from 'next/link';
import { apiFetch, resolveImageUrl } from '@/lib/api';
import { ApiSuccess, MenuItem } from '@/types/api';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

async function getFeaturedItems() {
  const response = await apiFetch<ApiSuccess<MenuItem[]>>('/menu-items/featured', {
    cache: 'no-store',
  });
  return response.data.slice(0, 6);
}

const Home = async () => {
  const featuredItems = await getFeaturedItems();
  const heroImage = resolveImageUrl(featuredItems[0]?.image_url);

  return (
    <div>
      <section
        className="relative min-h-[72vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,208,160,0.2),transparent_40%)]" />
        <div className="animate-drift absolute -left-16 top-12 h-56 w-56 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="animate-drift absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl [animation-delay:1.2s]" />
        <div className="animate-float-y absolute bottom-10 right-10 h-28 w-28 rounded-full border border-amber-100/40 bg-white/10 backdrop-blur-sm" />
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl items-end px-4 pb-20 pt-16 md:px-6">
          <div className="max-w-2xl rounded-3xl border border-[#c6926e]/35 bg-[rgba(255,246,235,0.9)] p-7 text-[#2e170d] shadow-[0_28px_55px_-28px_rgba(0,0,0,0.75)] backdrop-blur-sm md:p-10">
            <p className="reveal-up mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#8f4d24]">
              Modern Casual Dining
            </p>
            <h1 className="reveal-up delay-1 text-5xl font-semibold leading-tight text-[#2a150d] md:text-6xl">
              Graze & Grain
            </h1>
            <p className="reveal-up delay-2 mt-4 text-lg leading-relaxed text-[#4f3427]">
              Charcoal-fired signatures, seasonal plates, and warm hospitality in the heart of Coimbatore.
            </p>
            <Link
              href="/menu"
              className="animate-pulse-soft mt-7 inline-flex rounded-full bg-[#8f4d24] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#6f3515]"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-4xl font-semibold">Featured Dishes</h2>
          <Link href="/menu" className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
            View full menu
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-amber-900/10 bg-[var(--surface)] shadow-[0_20px_45px_-35px_rgba(71,30,7,0.7)] transition hover:-translate-y-1"
            >
              <Image
                src={resolveImageUrl(item.image_url)}
                alt={item.name}
                width={400}
                height={300}
                unoptimized
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <h3 className="text-2xl font-semibold">{item.name}</h3>
                <p className="mt-2 text-lg font-bold text-[var(--brand-strong)]">{inr.format(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
        <div className="rounded-3xl border border-amber-900/15 bg-[var(--surface-strong)] p-8 md:p-10">
          <h2 className="text-4xl font-semibold">Our Story</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)]">
            Graze & Grain was born from a passion for produce-led cooking, open-fire aromas, and thoughtful service.
            Every plate balances comfort with craft using local ingredients, clean flavors, and seasonal rhythm.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[var(--brand-strong)] via-[var(--brand)] to-[#b56a36] px-8 py-8 text-white md:flex-row">
          <p className="text-lg md:text-xl">Reserve your table for tonight&apos;s chef specials.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/menu" className="rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-[var(--brand-strong)] transition hover:bg-amber-100">
              Explore Menu
            </Link>
            <Link href="/reservations" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-white/10">
              Book Table
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
