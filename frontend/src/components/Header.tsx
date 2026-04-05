import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { getProfilUtilisateur, type ProfilUtilisateurData } from '../services/request';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const isAuthenticated = !!localStorage.getItem('token');
    const [profil, setProfil] = useState<ProfilUtilisateurData | null>(null);
    const isProfessionnel = profil?.isProfessionnel ?? false;


    useEffect(() => {
        if (isAuthenticated) {
            getProfilUtilisateur()
                .then(setProfil)
                .catch(() => setProfil(null));
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setProfil(null);
        setIsOpen(false);
        navigate('/');
    };

    const initiales = profil
        ? `${(profil.prenom ?? '').charAt(0)}${(profil.nom ?? '').charAt(0)}`.trim().toUpperCase() || 'U'
        : 'U';

    const nomComplet = profil
        ? `${profil.prenom ?? ''} ${profil.nom ?? ''}`.trim() || profil.email
        : '';

    return (
        <>
            <header className="fixed w-full z-50 bg-[#14A8DE]" role="banner" aria-label={t("main.header.aria_label")}>
                <nav className='flex items-center justify-between'>

                    <Link to="/" className='flex items-center gap-2'>
                        <svg className='bg-white logo-laundrymap' xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="none">
                            <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.64375 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="#22ACE2" />
                        </svg>
                        <span className='text-white text-xl font-semibold'>LaundryMap</span>
                    </Link>

                    {/* Navigation desktop */}
                    <ul className='hidden md:flex items-center gap-1'>
                        <li>
                            <NavLink to="/" end className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                                Accueil
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/inscription-pro" className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                                <span className='md:block xl:hidden'>Inscription Pro</span>
                                <span className='hidden xl:block'>Inscription Professionnel</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/inscription-utilisateur" className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                                Inscription Utilisateur
                            </NavLink>
                        </li>
                        {isAuthenticated ? (
                            <>
                                {isProfessionnel && (
                                    <li>
                                        <NavLink to="/nouvelle-laverie" className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                                            Nouvelle Laverie
                                        </NavLink>
                                    </li>
                                )}
                                <li>
                                    <NavLink to="/profil" className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/20 text-white font-bold' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                                        Profil
                                    </NavLink>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className='px-4 py-2 rounded-lg text-sm font-semibold text-red-500 bg-white cursor-pointer'
                                        onClick={handleLogout}
                                    >
                                        Déconnexion
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <NavLink to="/connexion" className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white text-[#14A8DE]' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                                    Connexion
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    {/* Bouton burger mobile */}
                    <button
                        className='md:hidden cursor-pointer header-icon-btn'
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={isOpen}
                        aria-controls="nav-mobile"
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
                            id="nav-mobile"
                            className='absolute top-full left-0 w-full bg-white shadow-2xl border-b border-gray-200 md:hidden z-50'
                        >
                            <ul role="list">
                                <li className="border-b border-gray-100">
                                    <NavLink
                                        to="/"
                                        end
                                        className={({ isActive }) => `block px-6 py-4 transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#14A8DE] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#14A8DE]'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Accueil
                                    </NavLink>
                                </li>
                                <li className="border-b border-gray-100">
                                    <NavLink
                                        to="/inscription-pro"
                                        className={({ isActive }) => `block px-6 py-4 transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#14A8DE] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#14A8DE]'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Inscription Professionnel
                                    </NavLink>
                                </li>
                                <li className="border-b border-gray-100">
                                    <NavLink
                                        to="/inscription-utilisateur"
                                        className={({ isActive }) => `block px-6 py-4 transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#14A8DE] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#14A8DE]'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Inscription Utilisateur
                                    </NavLink>
                                </li>
                            </ul>

                            {/* Trait séparateur + section profil */}
                            {isAuthenticated ? (
                                <div className="border-t-2 border-gray-200">
                                    <div className="flex items-center gap-3 px-6 py-4 bg-gray-50">
                                        <div className="w-10 h-10 rounded-full bg-[#14A8DE] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                            {initiales}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{nomComplet}</p>
                                            <p className="text-xs text-gray-500">{profil?.email ?? ''}</p>
                                        </div>
                                    </div>
                                    <NavLink
                                        to="/profil"
                                        className={({ isActive }) => `block px-6 py-4 border-t border-gray-100 transition-all duration-200 ${isActive ? 'bg-blue-50 text-[#14A8DE] font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-[#14A8DE]'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Profil
                                    </NavLink>
                                    <button
                                        type="button"
                                        className="block w-full text-left px-6 py-4 border-t border-gray-100 font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t-2 border-gray-200">
                                    <NavLink
                                        to="/connexion"
                                        className={({ isActive }) => `block px-6 py-4 font-semibold transition-colors ${isActive ? 'bg-blue-50 text-[#14A8DE]' : 'text-[#14A8DE] hover:bg-blue-50'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Connexion
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </header>
            <Outlet />
        </>
    );
}
