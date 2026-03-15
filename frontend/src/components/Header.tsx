import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import ChangeLanguage from './ChangeLanguage';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem('token'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/connexion');
    };

    return (
        <>
            <header className="relative z-50 bg-slate-900">
                <nav className='flex items-center justify-between'>
                    
                    <Link to="/" className='flex items-center gap-2'>
                        <svg className='bg-white logo-laundrymap' xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="none">
                            <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.64375 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="#22ACE2"/>
                        </svg>
                        <span className='text-white text-xl'>LaundryMap</span>
                    </Link>
                    <ChangeLanguage />
                    <div className='flex item-right gap-6'>
                        {isAuthenticated && (
                            <button
                                type="button"
                                className='text-white font-semibold hidden md:block cursor-pointer'
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </button>
                        )}

                        <button 
                            className=''
                            aria-controls="search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path className='fill-white' d="M15.7549 14.255H14.9649L14.6849 13.985C15.6649 12.845 16.2549 11.365 16.2549 9.755C16.2549 6.165 13.3449 3.255 9.75488 3.255C6.16488 3.255 3.25488 6.165 3.25488 9.755C3.25488 13.345 6.16488 16.255 9.75488 16.255C11.3649 16.255 12.8449 15.665 13.9849 14.685L14.2549 14.965V15.755L19.2549 20.745L20.7449 19.255L15.7549 14.255ZM9.75488 14.255C7.26488 14.255 5.25488 12.245 5.25488 9.755C5.25488 7.26501 7.26488 5.255 9.75488 5.255C12.2449 5.255 14.2549 7.26501 14.2549 9.755C14.2549 12.245 12.2449 14.255 9.75488 14.255Z" fill="black"/>
                            </svg>
                        </button>
                        
                        <button 
                            className='md:hidden cursor-pointer'
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            aria-expanded={isOpen}
                            aria-controls="nav-mobile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 38 25" fill="none">
                                <path d="M0 24.6858H37.0286V20.5715H0V24.6858ZM0 14.4H37.0286V10.2857H0V14.4ZM0 0V4.11429H37.0286V0H0Z" fill="white"/>
                            </svg>
                        </button>
                    </div>

                    {isOpen && (
                        <ul
                            id="nav-mobile"
                            className='absolute top-full left-0 w-full flex flex-col bg-white shadow-2xl border-b border-gray-200 md:hidden z-50'
                            role="list"
                        >
                            <li className="border-b border-gray-100">
                                <NavLink 
                                    to="/" 
                                    end
                                    className={({ isActive }) => `block px-6 py-4 transition-all duration-300 hover:text-[#22ACE2] hover:bg-blue-50 hover:pl-8 ${isActive ? 'bg-blue-50/50 text-[#22ACE2] font-bold' : 'text-gray-700'}`} 
                                    onClick={() => setIsOpen(false)}
                                >
                                    Accueil
                                </NavLink>
                            </li>
                            <li className="border-b border-gray-100">
                                <NavLink 
                                    to="/profil" 
                                    className={({ isActive }) => `block px-6 py-4 transition-all duration-300 hover:text-[#22ACE2] hover:bg-blue-50 hover:pl-8 ${isActive ? 'bg-blue-50/50 text-[#22ACE2] font-bold' : 'text-gray-700'}`} 
                                    onClick={() => setIsOpen(false)}
                                >
                                    Profil
                                </NavLink>
                            </li>
                            <li className="border-b border-gray-100">
                                <NavLink 
                                    to="/inscription-pro" 
                                    className={({ isActive }) => `block px-6 py-4 transition-all duration-300 hover:text-[#22ACE2] hover:bg-blue-50 hover:pl-8 ${isActive ? 'bg-blue-50/50 text-[#22ACE2] font-bold' : 'text-gray-700'}`} 
                                    onClick={() => setIsOpen(false)}
                                >
                                    Inscription Pro
                                </NavLink>
                            </li>
                            <li className="border-b border-gray-100">
                                <NavLink 
                                    to="/inscription-utilisateur" 
                                    className={({ isActive }) => `block px-6 py-4 transition-all duration-300 hover:text-[#22ACE2] hover:bg-blue-50 hover:pl-8 ${isActive ? 'bg-blue-50/50 text-[#22ACE2] font-bold' : 'text-gray-700'}`} 
                                    onClick={() => setIsOpen(false)}
                                >
                                    Inscription Utilisateur
                                </NavLink>
                            </li>
                            <li>
                                {isAuthenticated ? (
                                    <button
                                        type="button"
                                        className="block w-full text-left px-6 py-5 font-bold text-[#22ACE2] transition-colors hover:bg-blue-50 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        Déconnexion
                                    </button>
                                ) : (
                                    <NavLink 
                                        to="/connexion" 
                                        className={({ isActive }) => `block px-6 py-5 font-bold transition-colors hover:bg-blue-50 ${isActive ? 'bg-blue-50/50 text-blue-600' : 'text-[#22ACE2]'}`} 
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Connexion
                                    </NavLink>
                                )}
                            </li>
                        </ul>
                    )}
                </nav>
            </header>
            <Outlet />
        </>
    );
}