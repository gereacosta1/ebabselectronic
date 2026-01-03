import React, { useState } from "react";
import {
  Award,
  Users,
  Clock,
  Wrench,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
} from "lucide-react";
import UnderlineGrow from "../components/UnderlineGrow";
import { useI18n } from "../i18n/I18nProvider";

const About: React.FC = () => {
  const { t } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const storeImages = [
    "/IMG/IMG-TIENDA2.jpeg",
    "/IMG/MOTOS-JUNTAS.jpeg",
    "/IMG/MOTOS-JUNTAS (2).jpeg",
    "/IMG/MOTOS-JUNTAS (1).jpeg",
  ];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % storeImages.length);
  const prevImage = () =>
    setCurrentImageIndex((p) => (p - 1 + storeImages.length) % storeImages.length);

  const stats = [
    { icon: Award, number: "15+", textKey: "about.stats.years" },
    { icon: Users, number: "5000+", textKey: "about.stats.clients" },
    { icon: Clock, number: "24/7", textKey: "about.stats.support" },
    { icon: Wrench, number: "100%", textKey: "about.stats.quality" },
  ] as const;

  const services = [
    {
      id: "new",
      icon: "⚡",
      titleKey: "about.services.new.title",
      descKey: "about.services.new.desc",
      accent: "from-amber-400 to-pink-500",
    },
    {
      id: "used",
      icon: "✅",
      titleKey: "about.services.used.title",
      descKey: "about.services.used.desc",
      accent: "from-emerald-400 to-teal-500",
    },
    {
      id: "fin",
      icon: "💳",
      titleKey: "about.services.fin.title",
      descKey: "about.services.fin.desc",
      accent: "from-sky-400 to-violet-500",
    },
    {
      id: "tech",
      icon: "🔧",
      titleKey: "about.services.tech.title",
      descKey: "about.services.tech.desc",
      accent: "from-violet-500 to-fuchsia-500",
    },
  ] as const;

  const alertMoreInfo = (serviceTitle: string) => {
    // ✅ tu texto ya trae {{title}}, acá lo inyectamos
    const template = t("about.services.moreInfo");
    const msg = template.replace("{{title}}", serviceTitle);
    window.alert(msg);
  };

  return (
    <section id="nosotros" className="pt-10 pb-24 bg-[#f5f7ff]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            <UnderlineGrow>{t("about.title")}</UnderlineGrow>
          </h2>
          <p className="text-lg md:text-2xl max-w-4xl mx-auto text-gray-600">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <article
              key={index}
              className="relative overflow-hidden rounded-3xl bg-white border border-violet-100/80 
                         shadow-[0_18px_45px_rgba(124,58,237,0.08)]
                         hover:shadow-[0_22px_60px_rgba(124,58,237,0.25)]
                         hover:border-violet-400/90 transition-all duration-300 group"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500" />

              <div className="flex flex-col items-center justify-center gap-3 px-4 py-7">
                <div className="relative">
                  <div
                    className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center 
                               ring-4 ring-violet-100 group-hover:ring-violet-300/80 
                               transition-all duration-300"
                  >
                    <stat.icon className="w-6 h-6 text-violet-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute inset-0 rounded-full blur-xl bg-violet-400/40 opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">
                  {stat.number}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 tracking-wide uppercase">
                  {t(stat.textKey)}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-[0.6fr_0.4fr] gap-10 items-center mb-16">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
              {t("about.trust.title")}
            </h3>
            <p className="text-gray-700 text-base md:text-lg mb-4">{t("about.trust.p1")}</p>
            <p className="text-gray-700 text-base md:text-lg mb-6">{t("about.trust.p2")}</p>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                {t("about.chips.quality")}
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                {t("about.chips.prices")}
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                {t("about.chips.service")}
              </span>
            </div>
          </div>

          {/* Gallery */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-xl border border-purple-100 bg-[#f5f7ff] flex items-center justify-center">
              <img
                src={storeImages[currentImageIndex]}
                alt={t("about.gallery.alt")}
                className="w-full max-h-[520px] md:max-h-[560px] object-contain rounded-3xl"
              />

              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-900 p-2 rounded-full shadow hover:bg-white"
                aria-label={t("about.gallery.prev")}
                title={t("about.gallery.prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-900 p-2 rounded-full shadow hover:bg-white"
                aria-label={t("about.gallery.next")}
                title={t("about.gallery.next")}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {storeImages.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full border ${
                      index === currentImageIndex
                        ? "bg-purple-500 border-purple-500"
                        : "bg-white border-gray-300"
                    }`}
                    aria-label={`${t("about.gallery.seeImage")} ${index + 1}`}
                    title={`${t("about.gallery.seeImage")} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-10">
            <UnderlineGrow>{t("about.services.title")}</UnderlineGrow>
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => {
              const serviceTitle = t(s.titleKey);

              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => alertMoreInfo(serviceTitle)}
                  className="relative overflow-hidden text-left rounded-3xl bg-white 
                             border border-violet-100/80 p-5
                             shadow-[0_18px_45px_rgba(15,23,42,0.08)]
                             hover:shadow-[0_22px_60px_rgba(124,58,237,0.30)]
                             hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 
                               bg-gradient-to-br from-violet-500/6 via-fuchsia-400/6 to-sky-400/6 
                               transition-opacity"
                  />

                  <div className="relative">
                    <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-violet-50 p-2 shadow-sm">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl 
                                    bg-gradient-to-br ${s.accent} text-white text-xl`}
                        aria-hidden="true"
                      >
                        {s.icon}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mb-2">{serviceTitle}</h4>
                    <p className="text-sm text-gray-600">{t(s.descKey)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NEXTDRIVE location block (ahora i18n) */}
        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 text-white px-6 py-10 md:px-10 md:py-12 shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-black/20 blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              {/* Text */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-1 text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-purple-100">
                  <MapPin className="w-4 h-4" />
                  {t("about.location.badge")}
                </span>

                <h3 className="mt-4 text-2xl md:text-3xl font-black leading-tight">
                  {t("about.location.title.pre")}{" "}
                  <span className="underline decoration-yellow-300">
                    {t("about.location.title.highlight")}
                  </span>
                </h3>

                <p className="mt-4 text-sm md:text-base text-purple-50/90 max-w-xl">
                  {t("about.location.p1")}
                </p>

                <p className="mt-3 text-sm md:text-base text-purple-50/90 max-w-xl">
                  {t("about.location.p2.pre")} <strong>{t("about.location.p2.address")}</strong>.{" "}
                  {t("about.location.p2.post")}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-xs md:text-sm font-semibold">
                    <Building2 className="w-4 h-4" />
                    {t("about.location.chip.showroom")}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-xs md:text-sm font-semibold">
                    ⚡ {t("about.location.chip.testRides")}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-xs md:text-sm font-semibold">
                    🛠 {t("about.location.chip.techService")}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="relative min-h-[220px] md:min-h-[300px] lg:min-h-[360px] flex items-center">
                <div className="w-full h-full rounded-3xl overflow-hidden border border-purple-200 bg-black/20 shadow-2xl flex items-center justify-center">
                  <img
                    src="/IMG/nextdrive-building.jpeg"
                    alt={t("about.location.imageAlt")}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src.endsWith("/fallback.png")) return;
                      target.src = "/fallback.png";
                    }}
                  />
                </div>

                <div className="absolute bottom-6 left-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-4 py-2 text-xs md:text-sm font-semibold border border-white/15">
                    <MapPin className="w-4 h-4 text-yellow-300" />
                    {t("about.location.imageBadge")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </section>
  );
};

export default About;
