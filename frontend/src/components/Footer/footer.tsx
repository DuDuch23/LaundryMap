import { BookOpen, FileText, Share2, Shield } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "LaundryMap", url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const links = [
    { to: "/cgu",                    label: t("main.footer.cgu"),                    Icon: FileText  },
    { to: "/mentions-legales",       label: t("main.footer.mentions_legales"),       Icon: Shield    },
    { to: "/propriete-intellectuelle", label: t("main.footer.propriete_intellectuelle"), Icon: BookOpen  },
  ];

  return (
    <footer
      className="w-full bg-[#22ACE2] text-white"
      aria-label={t("main.footer.aria_label")}
    >
      <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-6">

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Colonne gauche — marque */}
          <div className="flex flex-col gap-4">
            <a href="/" className="flex items-center gap-2.5 w-fit" aria-label="LaundryMap — Accueil">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 24 30" fill="none" aria-hidden="true">
                  <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.64375 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="white"/>
                </svg>
              </span>
              <span className="text-xl font-semibold tracking-tight">LaundryMap</span>
            </a>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              {t("main.footer.tagline")}
            </p>

            <button
              onClick={handleShare}
              className="mt-1 flex items-center gap-2 w-fit bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors rounded-xl px-4 py-2.5 text-sm font-medium"
              aria-label={t("main.footer.partager_aria")}
            >
              <Share2 size={15} aria-hidden="true" />
              {t("main.footer.partager")}
            </button>
          </div>

          {/* Colonne droite — liens */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              {t("main.footer.liens_utiles")}
            </p>
            <nav aria-label={t("main.footer.liens_utiles")}>
              <ul className="flex flex-col gap-3">
                {links.map(({ to, label, Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2.5 text-sm text-white/85 hover:text-white transition-colors"
                    >
                      <Icon size={15} className="shrink-0 text-white/50 group-hover:text-white/80 transition-colors" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Séparateur */}
        <hr className="border-white/15 mt-8 mb-4" />

        {/* Copyright */}
        <p className="text-white/50 text-xs">
          {t("main.footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
