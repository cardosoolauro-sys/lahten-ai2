export default function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  minLength,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  minLength?: number;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
      />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
