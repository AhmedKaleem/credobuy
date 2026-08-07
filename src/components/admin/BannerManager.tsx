"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Banner } from "@/types";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import {
  deleteBannerAction,
  saveBannerAction,
} from "@/lib/admin/actions";

const BG_OPTIONS = [
  "from-[#ff5e62] via-[#ff9966] to-[#ffb199]",
  "from-[#6a11cb] via-[#8e2de2] to-[#4a00e0]",
  "from-[#11998e] to-[#38ef7d]",
  "from-[#0f2027] via-[#203a43] to-[#2c5364]",
  "from-[#ee0979] to-[#ff6a00]",
  "from-[#16150f] to-[#3f3d35]",
];

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const empty: Banner = {
    id: "",
    title: "",
    subtitle: "",
    eyebrow: "",
    ctaLabel: "Shop now",
    ctaHref: "/shop",
    imageUrl: "",
    bg: BG_OPTIONS[0],
    textTone: "light",
  };

  const formBanner = creating ? empty : editing;

  async function save(banner: Banner, sortOrder: number) {
    setLoading(true);
    setError("");
    const result = await saveBannerAction({
      id: banner.id || undefined,
      title: banner.title,
      subtitle: banner.subtitle,
      eyebrow: banner.eyebrow,
      ctaLabel: banner.ctaLabel,
      ctaHref: banner.ctaHref,
      imageUrl: banner.imageUrl,
      bg: banner.bg,
      textTone: banner.textTone,
      sortOrder,
      isActive: true,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Deactivate this banner?")) return;
    await deleteBannerAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          Add banner
        </Button>
      </div>

      {formBanner && (
        <BannerForm
          key={formBanner.id || "new"}
          banner={formBanner}
          sortOrder={
            formBanner.id
              ? banners.findIndex((b) => b.id === formBanner.id) + 1
              : banners.length + 1
          }
          loading={loading}
          error={error}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
            setError("");
          }}
          onSave={save}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((b, i) => (
          <Card key={b.id} className="overflow-hidden">
            <div
              className={cn(
                "mb-3 flex h-32 flex-col justify-center rounded-xl bg-gradient-to-br p-4 text-white",
                b.bg
              )}
            >
              {b.eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  {b.eyebrow}
                </p>
              )}
              <p className="text-sm font-bold">{b.title}</p>
              <p className="text-xs text-white/85">{b.subtitle}</p>
            </div>
            <p className="text-sm font-medium">{b.ctaLabel}</p>
            <p className="text-xs text-muted">→ {b.ctaHref}</p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditing(b);
                  setCreating(false);
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(b.id)}
              >
                Deactivate
              </Button>
              <span className="ml-auto self-center text-xs text-muted">
                #{i + 1}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BannerForm({
  banner,
  sortOrder,
  loading,
  error,
  onCancel,
  onSave,
}: {
  banner: Banner;
  sortOrder: number;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onSave: (b: Banner, sortOrder: number) => void;
}) {
  const [draft, setDraft] = useState(banner);

  return (
    <Card className="space-y-4 p-5">
      <h3 className="font-semibold">
        {banner.id ? "Edit banner" : "New banner"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" htmlFor="btitle">
          <Input
            id="btitle"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Eyebrow" htmlFor="beye">
          <Input
            id="beye"
            value={draft.eyebrow ?? ""}
            onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Subtitle" htmlFor="bsub">
            <Textarea
              id="bsub"
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            />
          </Field>
        </div>
        <Field label="CTA label" htmlFor="bcta">
          <Input
            id="bcta"
            value={draft.ctaLabel}
            onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
          />
        </Field>
        <Field label="CTA link" htmlFor="bhref">
          <Input
            id="bhref"
            value={draft.ctaHref}
            onChange={(e) => setDraft({ ...draft, ctaHref: e.target.value })}
          />
        </Field>
        <Field label="Background gradient" htmlFor="bbg">
          <Select
            id="bbg"
            value={draft.bg}
            onChange={(e) => setDraft({ ...draft, bg: e.target.value })}
          >
            {BG_OPTIONS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Text tone" htmlFor="btone">
          <Select
            id="btone"
            value={draft.textTone ?? "light"}
            onChange={(e) =>
              setDraft({
                ...draft,
                textTone: e.target.value as "light" | "dark",
              })
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </Field>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={loading || !draft.title.trim()}
          onClick={() => onSave(draft, sortOrder)}
        >
          {loading ? "Saving…" : "Save banner"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
