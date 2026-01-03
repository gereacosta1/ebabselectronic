import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import UnderlineGrow from "../components/UnderlineGrow";
import { useI18n } from "../i18n/I18nProvider";

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
}

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key] ?? ""))
    .join("&");

const Contact: React.FC<ContactProps> = ({ onPhoneCall, onWhatsApp, onEmail }) => {
  const { t } = useI18n();

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "info",
    message: "",
    ["bot-field"]: "",
  });

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = t("contact.errors.firstNameRequired");
    if (!formData.lastName.trim()) newErrors.lastName = t("contact.errors.lastNameRequired");

    if (!formData.email.trim()) newErrors.email = t("contact.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("contact.errors.emailInvalid");

    if (!formData.phone.trim()) newErrors.phone = t("contact.errors.phoneRequired");
    else if (!/^[0-9+\s()-]{10,20}$/.test(formData.phone))
      newErrors.phone = t("contact.errors.phoneInvalid");

    if (!formData.message.trim()) newErrors.message = t("contact.errors.messageRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForNetlify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus("sending");

    try {
      const payload = {
        "form-name": "contact",
        ...formData,
      };

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload as any),
      });

      setStatus("sent");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        reason: "info",
        message: "",
        ["bot-field"]: "",
      });
      setErrors({});
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3200);
    }
  };

  const contactInfo = [
    {
      id: "address",
      icon: MapPin,
      label: t("contact.info.address"),
      content: "811 NE 79th St, Miami, FL",
    },
    {
      id: "phone",
      icon: Phone,
      label: t("contact.info.phone"),
      content: "+1 786 968 1621",
    },
    {
      id: "email",
      icon: Mail,
      label: t("contact.info.email"),
      content: "ebabselectronic@gmail.com",
    },
    {
      id: "hours",
      icon: Clock,
      label: t("contact.info.hours"),
      content: t("contact.info.hoursValue"),
    },
  ];

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111] text-white border border-white/10 focus:border-[var(--primary)] outline-none";
  const errorText = "mt-1 text-sm text-red-300 font-semibold";

  return (
    <section id="contacto" className="pt-10 pb-24 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-[var(--primary)]">
            <UnderlineGrow>{t("contact.title")}</UnderlineGrow>
          </h2>
          <p className="text-xl font-semibold max-w-3xl mx-auto text-gray-300">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* INFO */}
          <div className="space-y-8">
            {contactInfo.map((info) => (
              <button
                key={info.id}
                type="button"
                onClick={() => {
                  if (info.id === "phone") onPhoneCall();
                  if (info.id === "email") onEmail();
                }}
                className="flex items-center gap-4 w-full text-left bg-[var(--dark)] rounded-2xl p-6 hover:bg-[#222] transition-colors border border-white/10"
              >
                <info.icon className="w-8 h-8 text-[var(--accent)]" />
                <div>
                  <p className="text-lg font-black">{info.label}</p>
                  <p className="text-md font-semibold text-gray-300 whitespace-pre-line">
                    {info.content}
                  </p>
                </div>
              </button>
            ))}

            {/* WhatsApp */}
            <button
              type="button"
              onClick={onWhatsApp}
              className="w-full bg-green-600 text-white py-4 rounded-xl text-xl font-black hover:bg-green-700 transition transform hover:scale-[1.03]"
            >
              {t("contact.whatsapp")}
            </button>
          </div>

          {/* FORM */}
          <div>
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmitForNetlify}
              className="space-y-6 bg-[var(--dark)] p-8 rounded-3xl border border-white/10"
            >
              <input type="hidden" name="form-name" value="contact" />

              {/* honeypot */}
              <p className="hidden">
                <label>
                  Don’t fill this out:
                  <input
                    name="bot-field"
                    value={(formData as any)["bot-field"]}
                    onChange={(e) => setFormData({ ...formData, ["bot-field"]: e.target.value })}
                  />
                </label>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-bold">{t("contact.form.firstName")}</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputBase}
                    placeholder={t("contact.form.firstName.placeholder")}
                    required
                  />
                  {errors.firstName && <div className={errorText}>{errors.firstName}</div>}
                </div>

                <div>
                  <label className="font-bold">{t("contact.form.lastName")}</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={inputBase}
                    placeholder={t("contact.form.lastName.placeholder")}
                    required
                  />
                  {errors.lastName && <div className={errorText}>{errors.lastName}</div>}
                </div>
              </div>

              <div>
                <label className="font-bold">{t("contact.email")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputBase}
                  placeholder="name@email.com"
                  required
                />
                {errors.email && <div className={errorText}>{errors.email}</div>}
              </div>

              <div>
                <label className="font-bold">{t("contact.form.phone")}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputBase}
                  placeholder={t("contact.form.phone.hint")}
                  required
                />
                {errors.phone && <div className={errorText}>{errors.phone}</div>}
              </div>

              {/* ✅ Reason select */}
              <div>
                <label className="font-bold">{t("contact.form.reason")}</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={inputBase}
                >
                  <option value="info">{t("contact.form.reason.info")}</option>
                  <option value="finance">{t("contact.form.reason.finance")}</option>
                  <option value="service">{t("contact.form.reason.service")}</option>
                  <option value="warranty">{t("contact.form.reason.warranty")}</option>
                  <option value="other">{t("contact.form.reason.other")}</option>
                </select>
              </div>

              <div>
                <label className="font-bold">{t("contact.form.message")}</label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={inputBase}
                  placeholder={t("contact.form.message.placeholder")}
                  required
                />
                {errors.message && <div className={errorText}>{errors.message}</div>}
              </div>

              <button
                type="submit"
                className="
                  w-full py-4 rounded-xl text-xl font-black
                  bg-[var(--primary)] text-white hover:bg-purple-700
                  transition transform hover:scale-[1.03]
                "
              >
                {status === "sending" ? t("contact.form.sending") : t("contact.form.submit")}
              </button>

              {/* feedback */}
              {status === "sent" && (
                <div className="text-green-300 font-semibold">{t("contact.form.success")}</div>
              )}
              {status === "error" && (
                <div className="text-red-300 font-semibold">{t("contact.form.error")}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
