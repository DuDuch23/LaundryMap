import React from 'react';

interface BoutonBleuProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const BoutonBleu = ({ children, onClick, type = "button", disabled = false }: BoutonBleuProps) => (
    <button 
        type={type} 
        onClick={onClick}
        disabled={disabled}
        style={{
            backgroundColor: disabled ? '#A0D8EF' : '#22ACE2',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: disabled ? 'not-allowed' : 'pointer',
            width: '100%',
            transition: 'background-color 0.3s'
        }}
    >
        {children}
    </button>
);