export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      // Style inline pour l'exemple, à mettre dans ton CSS
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#0057b8',
        color: '#fff',
        padding: '8px 16px',
        zIndex: 9999,
        borderRadius: '0 0 4px 0',
        // Apparaît uniquement au focus clavier
        transition: 'top 0.2s',
      }}
      onFocus={(e) => (e.target.style.top = '0')}
      onBlur={(e) => (e.target.style.top = '-40px')}
    >
      Aller au contenu principal
    </a>
  );
}

// ─────────────────────────────────────────────
// 2. LAYOUT PRINCIPAL — structure sémantique
// ─────────────────────────────────────────────
export function AccessibleLayout({ children }) {
  return (
    <>
      <SkipLink />

      {/* Header avec role banner */}
      <header role="banner" aria-label="En-tête du site">
        <nav role="navigation" aria-label="Navigation principale">
        </nav>
      </header>

      {/* Contenu principal — id ciblé par le skip link */}
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer role="contentinfo" aria-label="Pied de page">
        {/* Contenu footer ici */}
      </footer>
    </>
  );
}

// ─────────────────────────────────────────────
// 3. BOUTON ACCESSIBLE
// ─────────────────────────────────────────────
export function AccessibleButton({
  onClick,
  children,
  ariaLabel,
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel} // si le texte du bouton n'est pas assez explicite
      aria-disabled={disabled}
      // focus visible géré en CSS avec :focus-visible
    >
      {children}
    </button>
  );
}

export function AccessibleInput({
  id,
  label,
  className,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) {
  return (
    <div role="group" className={className}>
      <label htmlFor={id}
      className='w-auto max-w-fit px-4 bg-white text-black rounded-lg relative top-2 -right-3'
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: 'red' }}>
            {' '}*
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        className='border border-solid rounded-10 bg-white p-4'
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
      />

      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          aria-live="polite"
          style={{ color: 'red', fontSize: '0.875rem' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export function checkBoxAccessibility({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}){
  return (
    <>
      <div>
        <label htmlFor={id}>
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: 'red' }}>
              {' '}*
            </span>
          )}
        </label>
        <input
          type="checkbox"
          name="vehicle"
          value="Bike"
        />

        {error && (
          <span
            id={`${id}-error`}
            role="alert"
            aria-live="polite"
            style={{ color: 'red', fontSize: '0.875rem' }}
          >
            {error}
          </span>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 5. IMAGE ACCESSIBLE
// ─────────────────────────────────────────────
export function AccessibleImage({ src, alt, decorative = false }) {
  return (
    <img
      src={src}
      // Si l'image est décorative, alt vide + aria-hidden
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
    />
  );
}

// ─────────────────────────────────────────────
// 6. ICÔNE ACCESSIBLE
// ─────────────────────────────────────────────
export function AccessibleIcon({ icon: Icon, label, decorative = false }) {
  if (decorative) {
    // Icône purement décorative : cachée aux lecteurs d'écran
    return <Icon aria-hidden="true" focusable="false" />;
  }
  // Icône porteuse de sens : label visible pour les lecteurs d'écran
  return (
    <>
      <Icon aria-hidden="true" focusable="false" />
      <span className="sr-only">{label}</span>
    </>
  );
}

// ─────────────────────────────────────────────
// 7. MODAL ACCESSIBLE
// ─────────────────────────────────────────────
import { useEffect, useRef } from 'react';

export function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Mémorise l'élément qui avait le focus avant l'ouverture
      previousFocusRef.current = document.activeElement;
      // Place le focus sur la modal à l'ouverture
      modalRef.current?.focus();
    } else {
      // Remet le focus sur l'élément d'origine à la fermeture
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Ferme la modal avec Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();

    // Piège le focus dans la modal (tab cycling)
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    // Overlay — aria-hidden sur le reste du contenu quand la modal est ouverte
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '100%' }}
      >
        <h2 id="modal-title">{title}</h2>

        {children}

        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          style={{ marginTop: '1rem' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. NAVIGATION PAR TABS (clavier)
// ─────────────────────────────────────────────
import { useState } from 'react';

export function AccessibleTabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e, index) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        // Tab suivant
        newIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        // Tab précédent
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        // Premier tab
        newIndex = 0;
        break;
      case 'End':
        // Dernier tab
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
    // Place le focus sur le tab actif
    document.getElementById(`tab-${newIndex}`)?.focus();
  };

  return (
    <div>
      {/* Liste des onglets */}
      <div role="tablist" aria-label="Navigation par onglets">
        {tabs.map((tab, index) => (
          <button
            key={index}
            id={`tab-${index}`}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`tabpanel-${index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              padding: '8px 16px',
              background: activeIndex === index ? '#0057b8' : '#eee',
              color: activeIndex === index ? '#fff' : '#000',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeIndex === index ? '2px solid #0057b8' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {tabs.map((tab, index) => (
        <div
          key={index}
          id={`tabpanel-${index}`}
          role="tabpanel"
          aria-labelledby={`tab-${index}`}
          // Caché si pas actif mais reste dans le DOM
          hidden={activeIndex !== index}
          tabIndex={0}
          style={{ padding: '1rem', border: '1px solid #eee' }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. LISTE DE RÉSULTATS ACCESSIBLE (laveries)
// ─────────────────────────────────────────────
export function AccessibleList({ items, renderItem, label }) {
  return (
    <ul
      role="list"
      aria-label={label}
      style={{ listStyle: 'none', padding: 0 }}
    >
      {items.length === 0 ? (
        <li role="status" aria-live="polite">
          Aucun résultat trouvé
        </li>
      ) : (
        items.map((item, index) => (
          <li key={index} role="listitem">
            {renderItem(item)}
          </li>
        ))
      )}
    </ul>
  );
}

// ─────────────────────────────────────────────
// 10. NOTIFICATION / TOAST ACCESSIBLE
// ─────────────────────────────────────────────
export function AccessibleToast({ message, type = 'info' }) {
  // aria-live="polite" : annoncé à la fin de ce que lit le lecteur d'écran
  // aria-live="assertive" : annoncé immédiatement (pour les erreurs critiques)
  return (
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      style={{
        padding: '12px 16px',
        background: type === 'error' ? '#d32f2f' : '#388e3c',
        color: '#fff',
        borderRadius: '4px',
      }}
    >
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────
// CSS À AJOUTER DANS TON index.css
// ─────────────────────────────────────────────
/*

// Classe utilitaire pour cacher visuellement mais garder accessible
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Focus visible pour la navigation clavier
:focus-visible {
  outline: 3px solid #0057b8;
  outline-offset: 2px;
  border-radius: 2px;
}

// Supprime l'outline uniquement pour la souris
:focus:not(:focus-visible) {
  outline: none;
}

*/
