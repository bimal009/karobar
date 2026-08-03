import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

const contentWrapper = { maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }
const kicker = {
  display: "block",
  fontSize: 13,
  lineHeight: "14px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-accent-700, #ae1800)",
}
const rowLabel = {
  fontFamily: "var(--font-heading)",
  fontWeight: "var(--font-heading-weight)" as unknown as number,
  fontSize: 15,
  lineHeight: "28px",
  margin: 0,
  fontFeatureSettings: "'tnum' 1",
}
const rowGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(64px,140px) minmax(0,380px) minmax(0,1fr)",
  gap: "28px clamp(24px,4vw,72px)",
  alignItems: "baseline",
  padding: "42px 0",
}
const rowHeading = {
  fontFamily: "var(--font-heading)",
  fontWeight: "var(--font-heading-weight)" as unknown as number,
  fontSize: 24,
  lineHeight: "28px",
  letterSpacing: "-0.01em",
  margin: 0,
}
const rowBody = {
  fontSize: 15.5,
  lineHeight: "28px",
  margin: 0,
  maxWidth: "52ch",
  color: "color-mix(in srgb, var(--color-text) 78%, transparent)",
}
const statNumber = {
  fontFamily: "var(--font-heading)",
  fontWeight: "var(--font-heading-weight)" as unknown as number,
  fontSize: "clamp(34px,3.4vw,48px)",
  lineHeight: "56px",
  color: "var(--color-accent)",
  margin: "0 0 0 -0.045em",
}
const statLabel = {
  fontSize: 13,
  lineHeight: "14px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
  margin: "14px 0 0",
}

const stockRows = [
  { sku: "KB-1140", item: "Basmati rice · 5 kg", hand: "18", reorder: "12", tag: null },
  { sku: "KB-2076", item: "Toor dal · 1 kg", hand: "6", reorder: "", tag: { label: "Order now", cls: "km-tag-accent" } },
  { sku: "KB-3312", item: "Mustard oil · 1 L", hand: "41", reorder: "20", tag: null },
  { sku: "KB-4508", item: "Atta · 10 kg", hand: "27", reorder: "15", tag: null },
  { sku: "KB-5190", item: "Sugar · 1 kg", hand: "9", reorder: "", tag: { label: "Low", cls: "km-tag-outline" } },
]

const whatItDoes = [
  {
    n: "01",
    title: "A till that keeps count",
    body: "Scan, weigh, split the payment, print or send the bill. Each line written at the counter is the same line inventory reads — there is no nightly reconciliation, because there is nothing to reconcile.",
  },
  {
    n: "02",
    title: "Reorder before the shelf empties",
    body: "Karobar watches how fast each SKU moves and raises the purchase order at the point where the stock left equals the days your supplier takes. One red mark, one approval.",
  },
  {
    n: "03",
    title: "Every outlet on one page",
    body: "Transfer stock between branches, compare margins by store and shift, and see the whole business as one number without asking four managers for a spreadsheet.",
  },
  {
    n: "04",
    title: "Works when the line drops",
    body: "The counter runs on the machine in front of you and syncs when the connection returns. Billing does not wait for the internet, and neither does the queue.",
  },
]

const stats = [
  { value: "1.4s", label: "Average time to close a bill" },
  { value: "98.6%", label: "Stock accuracy after first month" },
  { value: "12", label: "Counters on one licence" },
  { value: "0", label: "Sales lost to a dead internet line" },
]

const pricingTiers = [
  { name: "Counter", price: "₹899", tag: null, body: "One till, unlimited bills, 500 SKUs, GST returns ready." },
  {
    name: "Shop",
    price: "₹1,999",
    tag: "Most taken",
    body: "Four tills, unlimited SKUs, auto purchase orders, offline billing.",
    accent: true,
  },
  { name: "Chain", price: "Talk", tag: null, body: "Every outlet, stock transfers, role controls, a named engineer." },
]

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <div style={contentWrapper}>
        <section style={{ padding: "112px 0 84px" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: "var(--font-heading-weight)" as unknown as number,
              fontSize: "clamp(42px,6.2vw,84px)",
              lineHeight: "clamp(44.5px,6.57vw,89px)",
              letterSpacing: "-0.02em",
              margin: "0 0 0 -0.058em",
            }}
          >
            <span style={{ display: "block" }}>Ring it up.</span>
            <span style={{ display: "block" }}>Count it down.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: "28px", maxWidth: "58ch", margin: "38px 0 0" }}>
            Karobar is one system for the till and the stockroom. Every sale moves a number in
            inventory the instant it happens — so the shelf, the screen and the ledger never
            disagree.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: 28 }}>
            <a href="/acme-retail/pos" className="km-btn km-btn-primary">
              Start free trial
            </a>
            <a href="#counter" className="km-btn km-btn-ghost">
              See the counter
            </a>
          </div>
        </section>

        <section
          id="counter"
          style={{
            borderTop: "2px solid var(--color-divider)",
            borderBottom: "2px solid var(--color-divider)",
            display: "grid",
            gridTemplateColumns: "minmax(0,4fr) minmax(0,6fr)",
          }}
        >
          <div
            style={{
              padding: "32px clamp(20px,3vw,40px) 40px",
              borderRight: "2px solid var(--color-divider)",
            }}
          >
            <span style={{ ...kicker, margin: "0 0 20px" }}>Counter · Bill 4021</span>
            <div style={{ display: "grid", gap: 14, fontSize: 15, lineHeight: "20px", fontFeatureSettings: "'tnum' 1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Basmati rice · 5&nbsp;kg</span>
                <span>620.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Toor dal · 1&nbsp;kg × 2</span>
                <span>340.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Mustard oil · 1&nbsp;L</span>
                <span>185.00</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
                }}
              >
                <span>Tax (5%)</span>
                <span>57.25</span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                marginTop: 24,
                paddingTop: 20,
                borderTop: "2px solid var(--color-divider)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: "var(--font-heading-weight)" as unknown as number,
                  fontSize: 34,
                  lineHeight: "34px",
                  color: "var(--color-accent)",
                  fontFeatureSettings: "'tnum' 1",
                }}
              >
                1,202.25
              </span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: 24 }}>
              <button type="button" className="km-btn km-btn-primary">
                Take payment
              </button>
              <button type="button" className="km-btn km-btn-ghost">
                Hold
              </button>
            </div>
          </div>
          <div style={{ padding: "32px clamp(20px,3vw,40px) 40px" }}>
            <span style={{ ...kicker, margin: "0 0 20px" }}>Stock, live</span>
            <table className="km-table" style={{ fontFeatureSettings: "'tnum' 1" }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th style={{ textAlign: "right" }}>On hand</th>
                  <th style={{ textAlign: "right" }}>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {stockRows.map((r) => (
                  <tr key={r.sku}>
                    <td>{r.sku}</td>
                    <td>{r.item}</td>
                    <td style={{ textAlign: "right" }}>{r.hand}</td>
                    <td style={{ textAlign: "right" }}>
                      {r.tag ? <span className={`km-tag ${r.tag.cls}`}>{r.tag.label}</span> : r.reorder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="Karobar by the numbers" style={{ padding: "70px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", justifyContent: "space-between", gap: "42px 28px" }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p style={statNumber}>{s.value}</p>
                <p style={statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stock" style={{ borderTop: "2px solid var(--color-divider)", padding: "84px 0 70px" }}>
          <span style={{ ...kicker, margin: "0 0 14px" }}>What Karobar does</span>
          {whatItDoes.map((row, i) => (
            <div key={row.n} style={{ ...rowGrid, borderTop: i > 0 ? "2px solid var(--color-divider)" : undefined }}>
              <p style={rowLabel}>{row.n}</p>
              <h2 style={rowHeading}>{row.title}</h2>
              <p style={rowBody}>{row.body}</p>
            </div>
          ))}
        </section>

        <section
          style={{
            borderTop: "2px solid var(--color-divider)",
            display: "grid",
            gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)",
            gap: "28px clamp(24px,5vw,96px)",
            alignItems: "center",
            padding: "56px 0 84px",
          }}
        >
          <div>
            <span style={{ ...kicker, margin: "0 0 14px" }}>On the floor</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--font-heading-weight)" as unknown as number, fontSize: 32, lineHeight: "42px", letterSpacing: "-0.015em", margin: 0 }}>
              Built for the shop, not the demo
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: "28px", color: "color-mix(in srgb, var(--color-text) 78%, transparent)", margin: "20px 0 0", maxWidth: "48ch" }}>
              Barcode gun, weighing scale, thermal printer, cash drawer — plug them in and they
              work. Staff learn the counter in an afternoon, because there is only one screen to
              learn.
            </p>
          </div>
          <figure className="km-grayscale" style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shop-floor.jpg"
              alt="Shop floor, printed in black and white"
              style={{ width: "100%", aspectRatio: "951/665", objectFit: "cover" }}
            />
          </figure>
        </section>

        <section id="pricing" style={{ borderTop: "2px solid var(--color-divider)", padding: "70px 0 84px" }}>
          <span style={{ ...kicker, margin: "0 0 42px" }}>Pricing, per outlet, per month</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 0, borderTop: "2px solid var(--color-divider)" }}>
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                style={{
                  padding: "32px clamp(16px,2.5vw,32px) 36px",
                  borderRight: i < pricingTiers.length - 1 ? "2px solid var(--color-divider)" : undefined,
                }}
              >
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--font-heading-weight)" as unknown as number, fontSize: 20, lineHeight: "28px", margin: 0 }}>
                  {tier.name}
                  {tier.tag && <span className="km-tag km-tag-accent" style={{ marginLeft: 8 }}>{tier.tag}</span>}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: "var(--font-heading-weight)" as unknown as number,
                    fontSize: 40,
                    lineHeight: "48px",
                    margin: "16px 0 0",
                    color: tier.accent ? "var(--color-accent)" : undefined,
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  {tier.price}
                </p>
                <p style={{ fontSize: 15, lineHeight: "28px", color: "color-mix(in srgb, var(--color-text) 78%, transparent)", margin: "14px 0 0" }}>
                  {tier.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ borderTop: "2px solid var(--color-divider)", padding: "70px 0 98px" }}>
          <figure style={{ margin: 0 }}>
            <blockquote
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: "var(--font-heading-weight)" as unknown as number,
                fontSize: "clamp(24px,2.6vw,34px)",
                lineHeight: "42px",
                letterSpacing: "-0.015em",
                maxWidth: "32ch",
                margin: 0,
                textIndent: "-0.496em",
              }}
            >
              &ldquo;We stopped closing for stock-taking. The count is just correct on a Tuesday
              afternoon.&rdquo;
            </blockquote>
            <figcaption
              style={{
                fontSize: 15.5,
                lineHeight: "28px",
                color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
                margin: "42px 0 0",
                textIndent: "-1.209em",
              }}
            >
              — R. Menon, four grocery outlets, Kochi
            </figcaption>
          </figure>
        </section>
      </div>

      <section style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "84px clamp(20px,5vw,72px)" }}>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: "var(--font-heading-weight)" as unknown as number,
              fontSize: "clamp(34px,4.2vw,56px)",
              lineHeight: "clamp(36px,4.45vw,59.4px)",
              letterSpacing: "-0.015em",
              margin: "0 0 0 -0.058em",
            }}
          >
            <span style={{ display: "block" }}>Open tomorrow on Karobar.</span>
          </h3>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: 42 }}>
            <a
              href="/acme-retail/dashboard"
              className="km-btn km-btn-ghost"
              style={{ color: "var(--color-bg)", border: "1px solid var(--color-bg)" }}
            >
              Start free — 30 days, no card
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
