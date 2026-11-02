import { PageHeader, Card, StatusPill } from "@/components/admin/ui";
import { TicketReplyForm } from "@/components/admin/TicketReplyForm";
import { listSupportTickets } from "@/lib/admin/live";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Customer queries", robots: { index: false } };

export default async function AdminTicketsPage() {
  const tickets = await listSupportTickets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer queries"
        description="Messages from the contact form. Reply here to email the customer."
      />
      {tickets.length === 0 ? (
        <p className="text-sm text-muted">
          No queries yet. Run migrate_ops_coverage.sql, then a contact-form
          message will appear here.
        </p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => (
            <li key={t.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{t.subject}</p>
                    <p className="text-xs text-muted">
                      {t.name} · {t.email}
                      {t.phone ? ` · ${t.phone}` : ""} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      t.status === "open"
                        ? "accent"
                        : t.status === "replied"
                          ? "primary"
                          : "muted"
                    }
                  >
                    {t.status}
                  </StatusPill>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{t.body}</p>
                {t.adminReply ? (
                  <p className="mt-2 rounded-md bg-surface-muted p-2 text-sm">
                    Reply: {t.adminReply}
                  </p>
                ) : null}
                {t.status !== "closed" ? (
                  <TicketReplyForm ticketId={t.id} />
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
