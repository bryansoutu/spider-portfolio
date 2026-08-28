import { LOCALES, type Locale } from "@/lib/types";
import { useLocale } from "@/lib/locale";
import { ui } from "@/content/ui";

/**
 * O seletor de idioma.
 *
 * Dois botões lado a lado, e não um menu suspenso: com dois valores possíveis,
 * um menu esconde metade da informação atrás de um clique para economizar
 * 30 pixels. Aqui a pessoa vê ao mesmo tempo em que idioma está e qual é a
 * alternativa.
 *
 * O rótulo de cada botão é escrito no PRÓPRIO idioma dele ("PT" e "EN") —
 * ninguém procura "Inglês" quando não lê português.
 *
 * O botão ativo é preto sobre vermelho, não branco. Branco sobre este
 * vermelho dá 4.3:1 e reprova no mínimo da WCAG para texto pequeno; o preto
 * do fundo do site dá 4.8:1 no mesmo lugar.
 */
const SIGLA: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export function LocaleSwitch() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t(ui.locale.switchLabel)}
      className="flex shrink-0 items-center border border-border print:hidden"
    >
      {LOCALES.map((code) => {
        const ativo = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={ativo}
            onClick={() => setLocale(code)}
            className={`label-sm px-2.5 py-1.5 transition-colors ${
              ativo
                ? "bg-web text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {SIGLA[code]}
          </button>
        );
      })}
    </div>
  );
}
