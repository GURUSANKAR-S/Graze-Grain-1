export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <div className="mb-10 reveal-up">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">About Us</p>
        <h1 className="mt-2 text-5xl font-semibold">The Graze & Grain Philosophy</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-surface rounded-3xl p-7">
          <h2 className="text-3xl font-semibold">Our Story</h2>
          <p className="mt-4 text-[var(--muted)]">
            Graze & Grain was built around seasonal ingredients, honest cooking, and warm service. We started as a
            neighborhood kitchen and grew into a full restaurant focused on memorable meals and hospitality.
          </p>
        </section>

        <section className="glass-surface rounded-3xl p-7">
          <h2 className="text-3xl font-semibold">Our Philosophy</h2>
          <p className="mt-4 text-[var(--muted)]">
            We source local produce first, prepare dishes from scratch, and keep the menu balanced across comfort food
            and lighter options.
          </p>
        </section>

        <section className="glass-surface rounded-3xl p-7">
          <h2 className="text-3xl font-semibold">Chef & Team</h2>
          <p className="mt-4 text-[var(--muted)]">
            Our culinary team is led by Chef Arjun Menon, with a front-of-house team trained to deliver clear
            recommendations and thoughtful service.
          </p>
        </section>

        <section className="rounded-3xl border border-amber-900/15 bg-gradient-to-br from-[var(--brand-strong)] via-[var(--brand)] to-[#b56a36] p-7 text-white shadow-[0_22px_45px_-30px_rgba(60,24,8,0.8)]">
          <h2 className="text-3xl font-semibold">Contact</h2>
          <div className="mt-4 space-y-2 text-amber-50">
            <p>Phone: +91 98765 43210</p>
            <p>Email: hello@grazeandgrain.com</p>
            <p>Address: 123 Food Street, Race Course, Coimbatore, Tamil Nadu 641018</p>
          </div>
        </section>
      </div>
    </div>
  );
}
