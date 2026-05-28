import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';

function getEmailFromToken(): string | null {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        return payload.username || payload.email || null;
    } catch {
        return null;
    }
}

export default function HeaderAdmin() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const adminEmail = getEmailFromToken();
    const initiales = adminEmail ? adminEmail.charAt(0).toUpperCase() : 'A';

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/');
    };

    const navLinks = [
        {
            to: '/admin/gestion-utilisateurs',
            label: 'Gestion des utilisateurs',
            labelShort: 'Utilisateurs',
            matchPaths: ['/admin/gestion-utilisateurs', '/admin/utilisateurs/'],
        },
        {
            to: '/admin/gestion-laveries',
            label: 'Gestion des laveries',
            labelShort: 'Laveries',
            matchPaths: ['/admin/gestion-laveries', '/admin/laveries/'],
        },
        {
            to: '/admin/mots-interdits',
            label: 'Mots interdits',
            labelShort: 'Mots interdits',
            matchPaths: ['/admin/mots-interdits'],
        },
        {
            to: '/admin/gestion-commentaires',
            label: 'Gestion des commentaires',
            labelShort: 'Commentaires',
            matchPaths: ['/admin/gestion-commentaires', '/admin/moderation-commentaires'],
        },
    ];

    const isLinkActive = (matchPaths: string[]) =>
        matchPaths.some(path => location.pathname === path || location.pathname.startsWith(path));

    return (
        <>
            <header className="fixed w-full z-4000 bg-[#14A8DE]">
                <nav className='flex items-center justify-between'>

                    <Link to="/" className='flex items-center gap-2'>
                        <svg className='bg-white logo-laundrymap' xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="none">
                            <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.46875 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="#22ACE2" />
                        </svg>
                        <div className='flex flex-col'>
                            <span className='text-white text-xl leading-none font-semibold'>LaundryMap</span>
                            <span className='text-white/70 text-xs font-semibold tracking-widest uppercase'>Admin</span>
                        </div>
                    </Link>

                    {/* Navigation desktop */}
                    <ul className='hidden md:flex items-center gap-1'>
                        {navLinks.map(({ to, label, labelShort, matchPaths }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isLinkActive(matchPaths)
                                            ? 'bg-white/20 text-white font-bold'
                                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <span className='md:block xl:hidden'>{labelShort || label}</span>
                                    <span className='hidden xl:block'>{label}</span>
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                className='px-4 py-2 rounded-lg text-sm font-semibold text-red-500 bg-white cursor-pointer'
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </button>
                        </li>
                    </ul>

                    {/* Bouton burger mobile */}
                    <button
                        className='md:hidden cursor-pointer header-icon-btn'
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={isOpen}
                        aria-controls="nav-mobile-admin"
                    >
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>

                    {/* Menu mobile */}
                    {isOpen && (
                        <div
                            id="nav-mobile-admin"
                            className='absolute top-full left-0 w-full bg-white shadow-2xl border-b border-gray-200 md:hidden z-50'
                        >
                            <ul role="list">
                                {navLinks.map(({ to, label, matchPaths }) => (
                                    <li key={to} className="border-b border-gray-100">
                                        <Link
                                            to={to}
                                            className={`block px-6 py-4 transition-all duration-200 ${
                                                isLinkActive(matchPaths) ? 'bg-blue-50 text-[#14A8DE] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#14A8DE]'
                                            }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Trait séparateur + section profil admin */}
                            <div className="border-t-2 border-gray-200">
                                <div className="flex items-center gap-3 px-6 py-4 bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-[#14A8DE] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                        {initiales}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{adminEmail ?? 'Administrateur'}</p>
                                        <p className="text-xs text-gray-500">Administrateur</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="block w-full text-left px-6 py-4 border-t border-gray-100 font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
            <Outlet />
        </>
    );
}
