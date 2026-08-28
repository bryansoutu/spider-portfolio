import type { Profile } from "@/lib/types";

/**
 * Marcador de dado ainda não fornecido.
 *
 * `npm run check:pending` falha se este marcador sobreviver até o build de
 * produção — é o que impede o site de ir ao ar com link quebrado.
 */
export const PENDING = "__PENDENTE__";

export const profile: Profile = {
  name: "Bryan Williams Souto Silva",
  shortName: "Bryan Souto",
  headline: {
    "pt-BR":
      "Desenvolvedor full-stack. Construo produtos e coloco no ar — com cliente real do outro lado.",
    en: "Full-stack developer. I build products and ship them — with real clients on the other end.",
  },
  location: "Bauru, SP — Brasil",
  email: "bryanwilliams.s.silva@gmail.com",
  phone: "+55 14 98837-2000",
  links: [
    {
      id: "email",
      label: "E-mail",
      href: "mailto:bryanwilliams.s.silva@gmail.com",
      display: "bryanwilliams.s.silva@gmail.com",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/bryansouto/",
      display: "linkedin.com/in/bryansouto",
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/bryansoutu",
      display: "github.com/bryansoutu",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/5514988372000",
      display: "(14) 98837-2000",
    },
  ],
};
