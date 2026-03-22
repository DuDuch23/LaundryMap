import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';

export default function HeaderAdmin() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/');
    };

    const navLinks = [
        {
            to: '/admin/tableau-de-bord',
            label: 'Tableau de bord' },
        {
            to: '/admin/gestion-utilisateurs',
            label: 'Utilisateurs'
        },
    ];

    return (
        <>
            <header className="fixed w-full z-50 bg-slate-900">
                <nav className='flex items-center justify-between'>

                    <Link to="/admin/tableau-de-bord" className='flex items-center gap-2'>
                        <svg className='bg-white logo-laundrymap' xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="none">
                            <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.46875 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="#22ACE2" />
                        </svg>
                        <div className='flex flex-col'>
                            <span className='text-white text-xl leading-none'>LaundryMap</span>
                            <span className='text-[#22ACE2] text-xs font-semibold tracking-widest uppercase'>Admin</span>
                        </div>
                    </Link>

                    {/* <ul className='flex item-right gap-6'>
                        {navLinks.map(({ to, label }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-[#22ACE2] text-white font-bold'
                                                : 'text-white hover:text-white hover:bg-slate-700'
                                        }`
                                    }
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul> */}

                    <div className='flex items-center gap-4'>
                        <button
                            type="button"
                            className='text-white text-sm font-semibold hidden md:block cursor-pointer hover:text-[#22ACE2] transition-colors'
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>

                        <button
                            className='md:hidden cursor-pointer'
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            aria-expanded={isOpen}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 38 25" fill="none">
                                <path d="M0 24.6858H37.0286V20.5715H0V24.6858ZM0 14.4H37.0286V10.2857H0V14.4ZM0 0V4.11429H37.0286V0H0Z" fill="white" />
                            </svg>
                        </button>
                    </div>

                    {isOpen && (
                        <ul className='absolute top-full left-0 w-full flex flex-col bg-white shadow-2xl border-b border-gray-200 md:hidden z-50'>
                            {navLinks.map(({ to, label }) => (
                                <li key={to} className="border-b border-gray-100">
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) =>
                                            `block px-6 py-4 transition-all duration-300 hover:text-[#22ACE2] hover:bg-blue-50 hover:pl-8 ${isActive ? 'bg-blue-50/50 text-[#22ACE2] font-bold' : 'text-gray-700' }`
                                        }
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {label}
                                    </NavLink>
                                </li>
                            ))}
                            <li>
                                <button
                                    type="button"
                                    className="block w-full text-left px-6 py-5 font-bold text-[#22ACE2] transition-colors hover:bg-blue-50 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </button>
                            </li>
                        </ul>
                    )}
                </nav>
            </header>
            <Outlet />
        </>
    );
}