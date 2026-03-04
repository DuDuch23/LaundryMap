import React from 'react';

interface ChampSaisieProps {
    label: string;
    nom: string;
    type?: React.HTMLInputTypeAttribute;//AUTOCOMPLETATION
    valeur: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    erreur?: string;
}

export const ChampSaisie = ({ label, nom, type = "text", valeur, onChange, erreur }: ChampSaisieProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        <label htmlFor={nom} style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
            {label}
        </label>
        <input 
            id={nom}
            name={nom}
            type={type}
            value={valeur}
            onChange={onChange}
            style={{
                padding: '12px',
                borderRadius: '8px',
                border: erreur ? '1px solid red' : '1px solid #ccc',
                outlineColor: '#22ACE2',
                fontSize: '16px'
            }}
        />
        {erreur && <span style={{ color: 'red', fontSize: '12px', marginTop: '2px' }}>{erreur}</span>}
    </div>
);