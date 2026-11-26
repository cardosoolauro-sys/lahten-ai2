"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProperty, updateProperty } from "@/lib/properties/actions";
import { PURPOSES, STATUSES, TYPES } from "@/lib/properties/constants";

export type PropertyValues = {
  id: string;
  title: string;
  property_type: string;
  purpose: string;
  status: string;
  sale_price: number | string | null;
  rent_price: number | string | null;
  area_m2: number | string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
};

const inputCls =
  "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric";
const labelCls = "mb-1 block text-xs text-slate-400";

function Options({ items }: { items: Record<string, string> }) {
  return (
    <>
      {Object.entries(items).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  );
}

export default function PropertyForm({
  property,
}: {
  property?: PropertyValues;
}) {
  const [state, action, pending] = useActionState(
    property ? updateProperty : createProperty,
    undefined
  );

  const text = (v: string | number | null | undefined) =>
    v === null || v === undefined ? "" : String(v);

  return (
    <form action={action} className="space-y-5">
      {property && <input type="hidden" name="id" value={property.id} />}

      <div>
        <label htmlFor="title" className={labelCls}>
          Título *
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={2}
          maxLength={150}
          defaultValue={property?.title ?? ""}
          placeholder="Ex.: Apartamento 3 quartos no Centro"
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="property_type" className={labelCls}>
            Tipo
          </label>
          <select
            id="property_type"
            name="property_type"
            defaultValue={property?.property_type ?? "apartment"}
            className={inputCls}
          >
            <Options items={TYPES} />
          </select>
        </div>
        <div>
          <label htmlFor="purpose" className={labelCls}>
            Finalidade
          </label>
          <select
            id="purpose"
            name="purpose"
            defaultValue={property?.purpose ?? "sale"}
            className={inputCls}
          >
            <Options items={PURPOSES} />
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelCls}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={property?.status ?? "available"}
            className={inputCls}
          >
            <Options items={STATUSES} />
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sale_price" className={labelCls}>
            Preço de venda (R$)
          </label>
          <input
            id="sale_price"
            name="sale_price"
            inputMode="decimal"
            defaultValue={text(property?.sale_price)}
            placeholder="350000"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="rent_price" className={labelCls}>
            Aluguel mensal (R$)
          </label>
          <input
            id="rent_price"
            name="rent_price"
            inputMode="decimal"
            defaultValue={text(property?.rent_price)}
            placeholder="2500"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="area_m2" className={labelCls}>
            Área (m²)
          </label>
          <input
            id="area_m2"
            name="area_m2"
            inputMode="decimal"
            defaultValue={text(property?.area_m2)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="bedrooms" className={labelCls}>
            Quartos
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            inputMode="numeric"
            maxLength={3}
            defaultValue={text(property?.bedrooms)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="bathrooms" className={labelCls}>
            Banheiros
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            inputMode="numeric"
            maxLength={3}
            defaultValue={text(property?.bathrooms)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className={labelCls}>
          Endereço
        </label>
        <input
          id="address"
          name="address"
          maxLength={200}
          defaultValue={property?.address ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label htmlFor="city" className={labelCls}>
            Cidade
          </label>
          <input
            id="city"
            name="city"
            maxLength={100}
            defaultValue={property?.city ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="state" className={labelCls}>
            UF
          </label>
          <input
            id="state"
            name="state"
            maxLength={2}
            defaultValue={property?.state ?? ""}
            placeholder="SC"
            className={`${inputCls} uppercase`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={property?.description ?? ""}
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
        <Link
          href="/properties"
          className="text-sm text-slate-400 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
        }
