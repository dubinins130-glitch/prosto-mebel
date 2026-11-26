"use client";

import { useRef, useState, type FormEvent } from "react";
import { company, type RoomSlug } from "@/content/site";
import {
  estimates, estimateSummary, formatMm, initialDraft, readChoice, readList, readNumber,
  type Draft, type Field, type NumberField, type Value,
} from "@/content/estimate";
import { jumpWithinCategory } from "./category-journey";
import { EstimateSketch } from "./estimate-sketch";
import { Arrow } from "./primitives";

function DimensionControl({ field, value, onChange }: { field: NumberField; value: number; onChange: (value: number) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const { kind, id, label, min, max } = field;
  const size = kind === "size";
  const number = editing === null || editing === "" ? value : Number(editing);
  const invalid = editing !== null && editing !== "" && (!Number.isInteger(number) || number < min || number > max);

  return (
    <div className="estimate-dimension">
      <label id={`dimension-${id}`} htmlFor={`estimate-${id}`}>{label}</label>
      <div className="dimension-manual">
        <input
          id={`manual-${id}`}
          type="number"
          inputMode="numeric"
          aria-label={size ? `${label}, ручной ввод в миллиметрах` : `${label}, ручной ввод`}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `dimension-error-${id}` : undefined}
          min={min}
          max={max}
          step={1}
          value={editing ?? value}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            const next = event.currentTarget.valueAsNumber;
            setEditing(raw);
            if (Number.isInteger(next) && next >= min && next <= max) onChange(next);
          }}
          onBlur={() => setEditing(null)}
        />
        {size && <span aria-hidden="true">мм</span>}
      </div>
      <input
        id={`estimate-${id}`}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-labelledby={`dimension-${id}`}
        aria-valuetext={size ? formatMm(value) : String(value)}
        onChange={(event) => {
          setEditing(null);
          onChange(event.currentTarget.valueAsNumber);
        }}
      />
      {invalid && <p id={`dimension-error-${id}`} className="dimension-error">Целое число от {min} до {max}{size ? " мм" : ""}.</p>}
    </div>
  );
}

function EstimateField({ field, draft, update }: { field: Field; draft: Draft; update: (id: string, value: Value) => void }) {
  const { id, kind, label } = field;
  if (kind === "size" || kind === "count") {
    return <DimensionControl field={field} value={readNumber(draft, id)} onChange={(value) => update(id, value)} />;
  }
  if (kind === "text") {
    return (
      <label className="category-field">
        {label}
        <textarea rows={2} maxLength={500} value={readChoice(draft, id)} placeholder={field.placeholder} onChange={(event) => update(id, event.target.value)} />
      </label>
    );
  }
  if ("options" in field) {
    const selected = kind === "multi" ? readList(draft, id) : [];
    return (
      <fieldset className="choice-set">
        <legend className={field.compact ? "sr-only" : undefined}>{label}</legend>
        {field.options.map((item) => (
          <label className="choice" key={item.id}>
            <input
              type={kind === "choice" ? "radio" : "checkbox"}
              name={id}
              checked={kind === "choice" ? readChoice(draft, id) === item.id : selected.includes(item.id)}
              onChange={() => update(id, kind === "choice" ? item.id : selected.includes(item.id)
                ? selected.filter((value) => value !== item.id)
                : [...selected, item.id])}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }
}

function EstimateContact({ config, summary, inquiryId }: { config: (typeof estimates)[RoomSlug]; summary: string; inquiryId: string }) {
  const [copied, setCopied] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const parameters = useRef<HTMLTextAreaElement>(null);

  async function copyParameters() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("Параметры скопированы.");
    } catch {
      parameters.current?.focus();
      parameters.current?.select();
      setCopied("Параметры выделены. Скопируйте их вручную.");
    }
  }

  function submitDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("Поля заполнены. Параметры можно скопировать.");
  }

  return (
    <section className="category-section category-contact" id={inquiryId} aria-labelledby={`${inquiryId}-title`}>
      <div>
        <div className="category-section-head">
          <h2 className="category-display" id={`${inquiryId}-title`} tabIndex={-1}>Обсудим<br />проект?</h2>
        </div>
        <address className="kitchen-address">
          <span>{company.contactLocation}</span>
          {company.phoneHref && <a className="kitchen-phone" href={company.phoneHref}>{company.phone}</a>}
          {company.email && <span>{company.email}</span>}
        </address>
        {(company.email || company.phoneHref) && (
          <div className="kitchen-contact-actions">
            {company.email && <a className="category-action" href={`mailto:${company.email}`}>Обсудить проект <Arrow /></a>}
            {company.phoneHref && <a className="category-action" href={company.phoneHref}>Позвонить <Arrow /></a>}
          </div>
        )}
      </div>
      <form className="kitchen-form" method="dialog" onSubmit={submitDemo} onChange={() => setFormStatus("")} aria-describedby="estimate-form-note">
        <div className="category-mono kitchen-form-top"><span>Заявка на расчёт</span><span>Тип · {config.type}</span></div>
        <label className="category-field">
          {config.parameters}
          <textarea ref={parameters} name="parameters" readOnly value={summary} rows={5} />
        </label>
        <button className="category-action" type="button" onClick={copyParameters}>Скопировать параметры <Arrow /></button>
        <p role="status" className="category-form-status">{copied}</p>
        <div className="kitchen-fields">
          <label className="category-field">Имя <input name="name" required maxLength={80} pattern=".*\S.*" placeholder="Как к вам обращаться" /></label>
          <label className="category-field">Телефон <input name="phone" type="tel" required maxLength={35} pattern="\+?[0-9](?:[\s\(\)\-]*[0-9]){6,14}" placeholder="+7 ___ ___-__-__" /></label>
        </div>
        <div className="kitchen-form-bottom">
          <button className="category-action" type="submit">Проверить заявку <Arrow /></button>
          <p id="estimate-form-note">Демо-форма без отправки данных.</p>
        </div>
        <p role="status" className="category-form-status">{formStatus}</p>
      </form>
    </section>
  );
}

export function FurnitureEstimate({ room }: { room: RoomSlug }) {
  const config = estimates[room];
  const [draft, setDraft] = useState(() => initialDraft(config));
  const [step, setStep] = useState(0);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const stepTitles = [...config.steps.map(({ title }) => title), "Параметры для расчёта"];
  const finalStep = stepTitles.length - 1;
  const fields = config.steps[step]?.fields.filter((field) => !field.when || field.when(draft)) ?? [];
  const inquiryId = room === "kitchens" ? "kitchen-inquiry" : "inquiry";
  const summary = estimateSummary(config, draft);

  function goToStep(index: number) {
    if (index === step) return;
    setStep(index);
    requestAnimationFrame(() => stepHeading.current?.focus({ preventScroll: true }));
  }

  function update(id: string, value: Value) {
    setDraft((current) => ({ ...current, [id]: value }));
  }

  return (
    <>
      <section className="category-section estimate" id="estimate" aria-labelledby="estimate-title">
        <div className="category-section-head">
          <h2 className="category-display" id="estimate-title" tabIndex={-1}>По вашим<br />размерам.</h2>
          <p>{config.description}</p>
        </div>
        <div className="estimate-grid">
          <EstimateSketch room={room} config={config} draft={draft} />
          <div className="estimate-console">
            <ol className="estimate-steps" aria-label="Этапы подготовки расчёта">
              {stepTitles.map((label, index) => (
                <li key={label}>
                  <button type="button" onClick={() => goToStep(index)} aria-current={index === step ? "step" : undefined} aria-label={`Шаг ${index + 1}. ${label}`}>
                    {String(index + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ol>
            <div className="estimate-step" key={step}>
              <p className="category-mono estimate-kind">Тип мебели · {config.type}</p>
              <h3 tabIndex={-1} ref={stepHeading}>{stepTitles[step]}</h3>
              {step < finalStep ? (
                <div className="estimate-fields">
                  {fields.map((field) => <EstimateField key={field.id} field={field} draft={draft} update={update} />)}
                </div>
              ) : (
                <div className="estimate-summary">
                  <p>{summary}</p>
                  <a className="category-action" href={`#${inquiryId}`} onClick={jumpWithinCategory}>Запросить индивидуальный расчёт <Arrow /></a>
                </div>
              )}
            </div>
            <div className="estimate-nav">
              {step > 0 && <button type="button" className="category-action" onClick={() => goToStep(step - 1)}><Arrow direction="left" /> Назад</button>}
              {step < finalStep && (
                <button type="button" className="category-action" onClick={() => goToStep(step + 1)}>
                  {step === finalStep - 1 ? "Посмотреть параметры" : "Далее"} <Arrow direction="right" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <EstimateContact config={config} summary={summary} inquiryId={inquiryId} />
    </>
  );
}
