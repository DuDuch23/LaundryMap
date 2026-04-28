import { useEffect, useRef, useState } from 'react';

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
  className,
  children,
  ariaLabel = "",
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      className={className}
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
  name,
  label,
  className,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  maxLength,
  children = null,
}) {
  const isCheckbox = type === 'checkbox';

  // Submit — className goes directly on the input element
  if (type === 'submit') {
    return (
      <input
        id={id}
        name={name || id}
        type="submit"
        value={value ?? ''}
        disabled={disabled}
        className={`py-3 px-6 text-white ${className ?? ''}`}
      />
    );
  }

  // Checkbox — layout horizontal : case à gauche, label à droite
  if (isCheckbox) {
    return (
      <div className={`flex items-start gap-2.5 ${className ?? ''}`}>
        <input
          id={id}
          name={name || id}
          type="checkbox"
          checked={!!value}
          onChange={onChange || undefined}
          disabled={disabled}
          required={required || undefined}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[#22ACE2]"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          {label && (
            <label htmlFor={id} className="cursor-pointer select-none text-sm leading-snug text-gray-700">
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-red-600"> *</span>}
            </label>
          )}
          {error && (
            <span id={`${id}-error`} role="alert" aria-live="polite" className="text-xs text-red-600">
              {error}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Champ texte standard (text, email, password, number…)
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-red-600"> *</span>}
        </label>
      )}

      <input
        id={id}
        name={name || id}
        type={type}
        {...(isCheckbox
          ? { checked: value === true || value === 'true' }
          : { value: value ?? '' })}
        className={`
          ${type === 'checkbox' ? 'w-4 h-4 accent-[#22ACE2]' : ''}
          ${type !== 'submit' && type !== 'checkbox' ? 'border border-solid rounded-lg bg-white p-4 w-full' : ''}
          ${type === 'submit' ? 'text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer' : ''}
          ${error ? 'bg-[#FADED7]! border-[#E3634C]' : ''}
          ${disabled && !isCheckbox ? 'opacity-60 cursor-not-allowed' : ''}
        max-w-[stretch]`}
        onChange={onChange || undefined}
        placeholder={placeholder || undefined}
        required={required || undefined}
        disabled={disabled}
        maxLength={maxLength}
        readOnly={!onChange && !isCheckbox}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={[
          'w-full max-w-[stretch] rounded-lg border bg-white px-3 py-2.5',
          'text-sm text-gray-900 placeholder:text-gray-400',
          'outline-none transition-all',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-[#22ACE2] focus:ring-2 focus:ring-[#22ACE2]/25',
          disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400 opacity-70' : '',
        ].filter(Boolean).join(' ')}
      />

      {error && (
        <span id={`${id}-error`} role="alert" aria-live="polite" className="text-sm text-red-600">
          {error}
        </span>
      )}
      {children}
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
}) {
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
