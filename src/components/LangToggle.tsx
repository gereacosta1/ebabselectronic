import React from "react";
import { useI18n } from "../i18n/I18nProvider";

export default function LangToggle() {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Change language"
      className="
        px-3 py-1 rounded-md
        border border-purple-200 bg-purple-50
        text-purple-800 font-extrabold
        hover:bg-purple-100 hover:border-purple-300
        transition-colors
      "
      title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}
