"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { SkeletonList } from "@/components/inzu-skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInzuApi } from "@/hooks/use-inzu-api";
import { ApiError } from "@/lib/api";

type Ticket = {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  propertyId?: string;
  propertyName?: string;
  unitNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_STYLE: Record<Priority, { color: string; bg: string }> = {
  low:    { color: "rgba(245,247,246,0.4)",  bg: "rgba(144,180,148,0.07)" },
  medium: { color: "#825D42",                bg: "rgba(130,93,66,0.10)" },
  high:   { color: "#E22026",                bg: "rgba(226,32,38,0.10)" },
  urgent: { color: "#E22026",                bg: "rgba(226,32,38,0.16)" },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  open:        { color: "#90B494",               bg: "rgba(144,180,148,0.12)" },
  in_progress: { color: "#825D42",               bg: "rgba(130,93,66,0.10)" },
  resolved:    { color: "rgba(245,247,246,0.4)",  bg: "rgba(144,180,148,0.06)" },
  closed:      { color: "rgba(245,247,246,0.3)",  bg: "rgba(144,180,148,0.04)" },
};

function Chip({ label, style: { color, bg } }: { label: string; style: { color: string; bg: string } }) {
  return (
    <span style={{
      background: bg, color,
      fontSize: 10, fontWeight: 500, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
    }}>
      {label}
    </span>
  );
}

function normalizeTickets(res: unknown): Ticket[] {
  if (Array.isArray(res)) return res as Ticket[];
  if (res && typeof res === "object" && "tickets" in res && Array.isArray((res as { tickets: unknown }).tickets)) {
    return (res as { tickets: Ticket[] }).tickets;
  }
  return [];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MaintenancePage() {
  const api = useInzuApi();
  const [data, setData] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);

  /* New ticket form */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function fetchTickets() {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.maintenance
      .list()
      .then((res) => { if (!cancelled) setData(normalizeTickets(res)); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }

  useEffect(() => {
    const cancel = fetchTickets();
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setFormError("Title is required"); return; }
    setFormError(null);
    setSubmitting(true);
    api.maintenance
      .create({ title: title.trim(), description: description.trim() || undefined, priority })
      .then(() => {
        setNewOpen(false);
        setTitle(""); setDescription(""); setPriority("medium");
        fetchTickets();
      })
      .catch((err) => setFormError(err instanceof ApiError ? err.message : String(err)))
      .finally(() => setSubmitting(false));
  }

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Maintenance</h1>
            {data && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.length} {data.length === 1 ? "ticket" : "tickets"}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setNewOpen(true)}>New ticket</Button>
        </div>

        {loading && <SkeletonList rows={4} />}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {!loading && !error && data && data.length === 0 && (
          <div className="inzu-empty">
            <Wrench size={28} className="text-muted-foreground" style={{ opacity: 0.4 }} />
            <p className="text-sm text-muted-foreground">No maintenance tickets yet.</p>
            <button
              className="text-xs font-medium underline underline-offset-4"
              style={{ color: "#90B494" }}
              onClick={() => setNewOpen(true)}
            >
              Log your first ticket
            </button>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <ul style={{ borderRadius: 12, border: "1px solid rgba(144,180,148,0.10)", overflow: "hidden" }}>
            {data.map((ticket) => {
              const id = ticket.id ?? ticket._id ?? String(Math.random());
              const priorityKey = (ticket.priority?.toLowerCase() ?? "medium") as Priority;
              const statusKey = ticket.status?.toLowerCase() ?? "open";
              const priorityStyle = PRIORITY_STYLE[priorityKey] ?? PRIORITY_STYLE.medium;
              const statusStyle = STATUS_STYLE[statusKey] ?? STATUS_STYLE.open;

              return (
                <li key={id} className="inzu-row flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{ticket.title ?? "Untitled"}</span>
                      <Chip label={priorityKey} style={priorityStyle} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {ticket.propertyName && <span>{ticket.propertyName}</span>}
                      {ticket.unitNumber && <span>Unit {ticket.unitNumber}</span>}
                      {ticket.description && (
                        <span className="line-clamp-1 max-w-xs">{ticket.description}</span>
                      )}
                      {formatDate(ticket.createdAt) && (
                        <span>{formatDate(ticket.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  <Chip label={ticket.status ?? "open"} style={statusStyle} />
                </li>
              );
            })}
          </ul>
        )}

        {/* New ticket dialog */}
        <Dialog open={newOpen} onOpenChange={(open) => { setNewOpen(open); if (!open) { setFormError(null); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New maintenance ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitTicket} className="mt-2 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leaking tap in Unit 4B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe the issue…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={inputClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              {formError && <p className="text-sm text-destructive" role="alert">{formError}</p>}
              <Button type="submit" size="sm" className="w-full mt-1" disabled={submitting}>
                {submitting ? "Creating…" : "Create ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Container>
    </RequireOrganization>
  );
}
