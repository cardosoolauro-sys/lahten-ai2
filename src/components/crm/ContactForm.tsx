"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createContact, updateContact } from "@/lib/crm/actions";
import { KINDS, STATUSES } from "@/lib/crm/constants";

export type ContactValues = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  kind: string;
  status: string;
  source: string | null;
  interest: string | null;
  notes: string | null;
};

const inputCls =
  "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric";
const labelCls = "mb-1 block text-xs text-slate-400";

export default function ContactForm({ contact }: { contact?: ContactValues }) {
  const [state, action, pending] = useActionState(
    contact ? updateContact : createContact,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      {contact && <input type="hidden" name="id" value={contact.id} />}

      <div>
        <label htmlFor="full_name" className={labelCls}>
          Nome *
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={contact?.full_name ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelCls}>
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={contact?.phone ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={254}
            defaultValue={contact?.email ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="kind" className={labelCls}>
            Tipo
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={contact?.kind ?? "lead"}
            className={inputCls}
          >
            {Object.entries(KINDS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelCls}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={contact?.status ?? "new"}
            className={inputCls}
          >
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="source" className={labelCls}>
          Origem (ex.: indicação, site, portal)
        </label>
        <input
          id="source"
          name="source"
          maxLength={100}
          defaultValue={contact?.source ?? ""}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="interest" className={labelCls}>
          Interesse
        </label>
        <input
          id="interest"
          name="interest"
          maxLength={500}
          defaultValue={contact?.interest ?? ""}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={5000}
          defaultValue={contact?.notes ?? ""}
          className={`${inputCls} resize-none`}
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-electric px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/crm" className="text-sm text-slate-400 hover:text-white">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
