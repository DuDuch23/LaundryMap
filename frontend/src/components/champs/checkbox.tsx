import React from 'react';

interface CaseACocherProps {
    label: string;
    nom: string;
    coche: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    erreur?: string;
}

export const CaseACocher = ({ label, nom, coche, onChange, erreur }: CaseACocherProps) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
            <input 
                type="checkbox" 
                name={nom}
                checked={coche}
                onChange={onChange}
                style={{ accentColor: '#22ACE2', width: '18px', height: '18px' }}
            />
            {label}
        </label>
        {erreur && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>{erreur}</span>}
    </div>
);