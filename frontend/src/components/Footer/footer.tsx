import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LaundryMap",
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <footer className="bg-[#22ACE2] px-6 pt-10 pb-6 flex flex-col gap-8 text-left">
      <div className="footer__content">
      {/* Logo */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2"
            aria-label="LaundryMap - Home"
          >
            <svg
              className="bg-white logo-laundrymap"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="30"
              viewBox="0 0 24 30"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.64375 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z"
                fill="#22ACE2"
              />
            </svg>
            <span className="text-white text-xl">LaundryMap</span>
          </a>
        </div>

        {/* Navigation links */}
        <nav aria-label="Liens du footer">
          <ul className="flex flex-col gap-5">
            <li>
              <Link
                to="/cgu"
                className="!text-white text-lg underline underline-offset-2"
              >
                {t("main.footer.cgu")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="!text-white text-lg underline underline-offset-2"
              >
                {t("main.footer.contact")}
              </Link>
            </li>
            <li>
              <Link
                to="/mentions-legales"
                className="!text-white text-lg font-semibold underline underline-offset-2"
              >
                {t("main.footer.mentions_legales")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-3 bg-[#1B3A8C] text-white text-lg font-medium py-3 px-4 rounded-xl active:opacity-80 transition-opacity"
          aria-label={t("main.footer.partager_aria")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {t("main.footer.partager")}
        </button>
      </div>
    </footer>
  );
}
