"use client";

import { useState, type ReactNode } from "react";
import {
  X,
  Save,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  ShoppingBag,
} from "lucide-react";
import type { Hours, Restaurant } from "@/lib/types";
import { isSyncManaged } from "@/lib/sync-fields";
import { STATUS } from "./status";
import { HoursEditor } from "./HoursEditor";

export function ListingEditor({
  listing,
  saving,
  onClose,
  onSave,
}: {
  listing: Restaurant;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: Restaurant) => void;
}) {
  const [draft, setDraft] = useState<Restaurant>({ ...listing });

  const isLocked = (field: string) => draft.locked_fields.includes(field);

  const toggleLock = (field: string) => {
    setDraft((d) => ({
      ...d,
      locked_fields: isLocked(field)
        ? d.locked_fields.filter((f) => f !== field)
        : [...d.locked_fields, field],
    }));
  };

  /** Set a field; editing a sync-managed field auto-locks it. */
  const set = <K extends keyof Restaurant>(field: K, value: Restaurant[K]) => {
    setDraft((d) => {
      const locked =
        isSyncManaged(field as string) && !d.locked_fields.includes(field as string)
          ? [...d.locked_fields, field as string]
          : d.locked_fields;
      return { ...d, [field]: value, locked_fields: locked };
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-page w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-ink text-cream px-5 py-3 flex items-center justify-between sm:rounded-t-2xl">
          <span className="font-display text-lg">Edit listing</span>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Restaurant name" field="name" locked={isLocked} onToggleLock={toggleLock}>
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className="inp"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cuisine" field="cuisine" locked={isLocked} onToggleLock={toggleLock}>
              <input
                value={draft.cuisine ?? ""}
                onChange={(e) => set("cuisine", e.target.value || null)}
                placeholder="e.g. Hot Dog, Pizza"
                className="inp"
              />
            </Field>
            <Field label="Phone" field="phone" locked={isLocked} onToggleLock={toggleLock}>
              <input
                value={draft.phone ?? ""}
                onChange={(e) => set("phone", e.target.value || null)}
                className="inp"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" field="price_level" locked={isLocked} onToggleLock={toggleLock}>
              <select
                value={draft.price_level ?? ""}
                onChange={(e) =>
                  set("price_level", e.target.value ? Number(e.target.value) : null)
                }
                className="inp"
              >
                <option value="">—</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </Field>
            <Field label="Rating" field="rating" locked={isLocked} onToggleLock={toggleLock}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={draft.rating ?? ""}
                onChange={(e) =>
                  set("rating", e.target.value ? Number(e.target.value) : null)
                }
                className="inp"
              />
            </Field>
          </div>

          <Field label="Address" field="address" locked={isLocked} onToggleLock={toggleLock}>
            <input
              value={draft.address ?? ""}
              onChange={(e) => set("address", e.target.value || null)}
              className="inp"
            />
          </Field>

          <Field label="Hours" field="hours" locked={isLocked} onToggleLock={toggleLock}>
            <HoursEditor
              value={draft.hours}
              onChange={(h: Hours) => set("hours", h)}
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Toggle
              on={draft.accepts_cards === true}
              icon={CreditCard}
              label="Takes cards"
              onClick={() => set("accepts_cards", !(draft.accepts_cards === true))}
            />
            <Toggle
              on={draft.accepts_cash}
              icon={Banknote}
              label="Takes cash"
              onClick={() => set("accepts_cash", !draft.accepts_cash)}
            />
            <Toggle
              on={draft.online_ordering}
              icon={ShoppingBag}
              label="Online ordering"
              onClick={() => set("online_ordering", !draft.online_ordering)}
            />
            <Toggle
              on={!!draft.dine_in}
              label="Dine in"
              onClick={() => set("dine_in", !draft.dine_in)}
            />
            <Toggle
              on={!!draft.takeout}
              label="Take out"
              onClick={() => set("takeout", !draft.takeout)}
            />
            <Toggle
              on={!!draft.delivery}
              label="Delivery"
              onClick={() => set("delivery", !draft.delivery)}
            />
            <Toggle
              on={!!draft.byob}
              label="BYOB"
              onClick={() => set("byob", !draft.byob)}
            />
            <Toggle
              on={!!draft.catering}
              label="Catering"
              onClick={() => set("catering", !draft.catering)}
            />
          </div>

          <Field label="Menu link (FB / Insta / website)">
            <input
              value={draft.menu_url ?? ""}
              onChange={(e) => set("menu_url", e.target.value || null)}
              placeholder="https://…"
              className="inp"
            />
          </Field>
          <Field label="Online ordering link">
            <input
              value={draft.order_url ?? ""}
              onChange={(e) => set("order_url", e.target.value || null)}
              placeholder="https://…"
              className="inp"
            />
          </Field>
          <Field label="Catering link (first-party only)">
            <input
              value={draft.catering_url ?? ""}
              onChange={(e) => set("catering_url", e.target.value || null)}
              placeholder="https://…"
              className="inp"
            />
          </Field>
          <Field label="Website">
            <input
              value={draft.website_url ?? ""}
              onChange={(e) => set("website_url", e.target.value || null)}
              placeholder="https://…"
              className="inp"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Facebook">
              <input
                value={draft.facebook_url ?? ""}
                onChange={(e) => set("facebook_url", e.target.value || null)}
                placeholder="https://facebook.com/…"
                className="inp"
              />
            </Field>
            <Field label="Instagram">
              <input
                value={draft.instagram_url ?? ""}
                onChange={(e) => set("instagram_url", e.target.value || null)}
                placeholder="https://instagram.com/…"
                className="inp"
              />
            </Field>
          </div>

          <Field label="Description" field="description" locked={isLocked} onToggleLock={toggleLock}>
            <textarea
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value || null)}
              className="inp resize-none"
            />
          </Field>

          <Field label="Notes / call log">
            <textarea
              rows={3}
              value={draft.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              className="inp resize-none"
            />
          </Field>

          <Field label="Verification status">
            <div className="flex gap-2">
              {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${
                    draft.status === s
                      ? "border-transparent text-white"
                      : "border-ink/20 text-ink/60 bg-white"
                  }`}
                  style={draft.status === s ? { background: STATUS[s].tone } : {}}
                >
                  {STATUS[s].label}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex flex-wrap gap-2">
            <Toggle
              on={draft.published}
              label={draft.published ? "Published" : "Unpublished"}
              onClick={() => set("published", !draft.published)}
            />
            <Toggle
              on={!!draft.featured}
              label="Featured"
              onClick={() => set("featured", !draft.featured)}
            />
            <Toggle
              on={!!draft.owner_verified}
              label="Owner-verified"
              onClick={() => set("owner_verified", !draft.owner_verified)}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-page border-t border-ink/10 p-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold border border-ink/25"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold bg-ink text-cream disabled:opacity-50"
          >
            <Save size={15} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  field,
  locked,
  onToggleLock,
  children,
}: {
  label: string;
  field?: string;
  locked?: (field: string) => boolean;
  onToggleLock?: (field: string) => void;
  children: ReactNode;
}) {
  const lockable = field && isSyncManaged(field);
  const isLocked = lockable && locked ? locked(field!) : false;

  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
          {label}
        </span>
        {lockable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleLock?.(field!);
            }}
            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${
              isLocked ? "text-coral" : "text-ink/30 hover:text-ink/60"
            }`}
            title={
              isLocked
                ? "Locked — Google sync skips this. Click to let Google manage it again."
                : "Google-managed. Editing locks it automatically."
            }
          >
            {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
            {isLocked ? "Locked" : "Auto"}
          </button>
        )}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  on,
  icon: Icon,
  label,
  onClick,
}: {
  on: boolean;
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
        on
          ? "bg-status-verified text-white border-transparent"
          : "bg-white text-ink/45 border-ink/20"
      }`}
    >
      {Icon && <Icon size={13} />} {label}
    </button>
  );
}
