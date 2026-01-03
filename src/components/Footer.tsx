import React from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export default function Footer() {
  const { t, lang } = useI18n();

  const EMAIL = "ebabselectronic@gmail.com";
  const PHONE_TEL = "+17869681621";

  const financingNote =
    lang === "es" ? "Financiamiento disponible con Affirm." : "Financing available with Affirm.";

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-purple-500/40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header / brand */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 h-1 w-24 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-full" />

          <h2 className="text-2xl font-black tracking-wide text-purple-100">EBABS ELECTRONIC LLC</h2>
          <p className="mt-2 text-sm text-gray-400">{t("footer.tagline")}</p>
          <p className="mt-2 text-xs text-gray-500 max-w-2xl mx-auto">{t("footer.desc")}</p>
        </div>

        {/* 3 columns */}
        <div className="grid gap-8 md:grid-cols-3 text-sm">
          {/* Column 1: contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              {t("contact.info.title")}
            </h3>

            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-[2px] text-purple-400" />
                <span>811 NE 79th St – Miami, FL</span>
              </li>

              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <a href={`tel:${PHONE_TEL}`} className="hover:text-purple-200">
                  (786) 968 1621
                </a>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <a href={`mailto:${EMAIL}`} className="hover:text-purple-200">
                  {EMAIL}
                </a>
              </li>

              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-[2px] text-purple-400" />
                <span className="whitespace-pre-line">{t("contact.info.hoursValue")}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: quick links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              {t("footer.quickLinks.title")}
            </h3>

            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#inicio" className="hover:text-purple-200">
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-purple-200">
                  {t("nav.catalog")}
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-purple-200">
                  {t("nav.about")}
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-purple-200">
                  {t("nav.contact")}
                </a>
              </li>

              <li>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  {financingNote}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: services / social */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-purple-200 uppercase mb-4">
              {t("footer.services.title")}
            </h3>

            <ul className="space-y-2 text-gray-300 mb-4">
              <li>• {t("services.new")}</li>
              <li>• {t("services.used")}</li>
              <li>• {t("services.tech")}</li>
              <li>• {t("services.finance")}</li>
            </ul>

            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 hover:bg-purple-500 transition-colors"
                aria-label={t("social.instagram")}
                title={t("social.instagram")}
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 hover:bg-purple-500 transition-colors"
                aria-label={t("social.facebook")}
                title={t("social.facebook")}
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="#contacto"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-4 text-xs font-semibold hover:bg-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t("contact.whatsapp")}
              </a>
            </div>
          </div>
        </div>

        {/* bottom line */}
        <div className="mt-10 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EBABS ELECTRONIC LLC. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
