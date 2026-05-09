/**
 * Inzu branded shimmer skeleton primitives.
 * Uses the inzu-shimmer keyframe defined in globals.css.
 */

function ShimmerBar({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(144,180,148,0.06)",
        borderRadius: 6,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(144,180,148,0.10) 50%, transparent 100%)",
          animation: "inzu-shimmer 1.6s infinite",
        }}
      />
    </div>
  );
}

/** Skeleton for a list of rows (tenants, invoices, maintenance) */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(144,180,148,0.08)",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: i < rows - 1 ? "1px solid rgba(144,180,148,0.06)" : "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <ShimmerBar style={{ height: 12, width: 140 + (i % 3) * 30 }} />
            <ShimmerBar style={{ height: 10, width: 90 }} />
          </div>
          <ShimmerBar style={{ height: 24, width: 72, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a grid of cards (properties) */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 16,
            background: "rgba(144,180,148,0.05)",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
            animationDelay: `${i * 80}ms`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <ShimmerBar style={{ height: 13, width: 120 }} />
              <ShimmerBar style={{ height: 20, width: 56, borderRadius: 20 }} />
            </div>
            <ShimmerBar style={{ height: 10, width: 80 }} />
            <ShimmerBar style={{ height: 10, width: 160 }} />
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <ShimmerBar style={{ height: 30, flex: 1, borderRadius: 8 }} />
              <ShimmerBar style={{ height: 30, flex: 1, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a single settings/form page */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 512 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ShimmerBar style={{ height: 10, width: 80 + (i % 2) * 40 }} />
          <ShimmerBar style={{ height: 38, width: "100%", borderRadius: 8 }} />
        </div>
      ))}
    </div>
  );
}
