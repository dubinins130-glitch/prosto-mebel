"use client";

import { useState, type FormEvent } from "react";
import { Arrow } from "./primitives";

export function ContactForm() {
  const [checked, setChecked] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecked(true);
  }

  return (
    <form className="contact-form" method="dialog" onSubmit={handleSubmit} onChange={() => setChecked(false)} aria-describedby="form-note">
      <p className="form-title">О вашем проекте</p>
      <div className="form-row">
        <label htmlFor="request-name">
          Имя
          <input id="request-name" name="name" placeholder="Как к вам обращаться" required maxLength={80} pattern=".*\S.*" />
        </label>
        <label htmlFor="request-phone">
          Телефон
          <input id="request-phone" name="phone" type="tel" placeholder="+7 ___ ___-__-__" required maxLength={32} pattern="\+?[0-9](?:[\s\(\)\-]*[0-9]){6,14}" title="Введите от 7 до 15 цифр" />
        </label>
      </div>
      <label htmlFor="request-details">
        Какую мебель вы планируете?
        <textarea id="request-details" name="details" placeholder="Например, шкаф во всю стену в спальне" rows={2} maxLength={1000} />
      </label>
      <div className="form-footer">
        <button className="action action-light" type="submit">Проверить заявку <Arrow /></button>
        <p id="form-note">Демо-форма без отправки данных.</p>
      </div>
      <p className="form-status" role="status">{checked ? "Поля заполнены. Обсудить проект можно по телефону или почте." : ""}</p>
    </form>
  );
}
