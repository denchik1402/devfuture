import { legalConfig } from "@/lib/legal";

/** Блок реквизитов для документов и подвала */
export function LegalRequisitesBlock({ className = "" }: { className?: string }) {
  const rows: { label: string; value: string }[] = [];
  if (legalConfig.entityName) {
    rows.push({ label: "Исполнитель", value: legalConfig.entityName });
  }
  if (legalConfig.inn) {
    rows.push({ label: "ИНН", value: legalConfig.inn });
  }
  if (legalConfig.ogrn) {
    rows.push({
      label: legalConfig.ogrn.length === 15 ? "ОГРНИП" : "ОГРН",
      value: legalConfig.ogrn,
    });
  }
  if (legalConfig.address) {
    rows.push({ label: "Адрес", value: legalConfig.address });
  }
  if (legalConfig.email) {
    rows.push({ label: "Email", value: legalConfig.email });
  }
  if (legalConfig.phone) {
    rows.push({ label: "Телефон", value: legalConfig.phone });
  }

  if (rows.length === 0) return null;

  return (
    <dl className={`space-y-2 text-sm text-zinc-400 ${className}`}>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
        >
          <dt className="shrink-0 font-medium text-zinc-500 sm:w-28">
            {r.label}
          </dt>
          <dd className="text-zinc-300">
            {r.label === "Email" ? (
              <a
                href={`mailto:${r.value}`}
                className="text-cyan-neon hover:underline"
              >
                {r.value}
              </a>
            ) : r.label === "Телефон" && legalConfig.phoneTel ? (
              <a
                href={legalConfig.phoneTel}
                className="text-cyan-neon hover:underline"
              >
                {r.value}
              </a>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
