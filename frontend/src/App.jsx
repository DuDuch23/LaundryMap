import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import './App.css'
import { useTranslation} from 'react-i18next';
import ChangeLanguage from './components/ChangeLanguage';
import {AccessibleLayout} from './components/accessibility';
import Header from './components/Header';

// Pages
const Home = React.lazy(() => import('./pages/Home'));
const Profil = React.lazy(() => import('./pages/Profil'));

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <Suspense fallback="...loading">
      <Routes>
        <Route element={<Header />}>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profil />} />
        </Route>
      </Routes>
      <div>
        <h1>{t('main.header')}</h1>
        <ChangeLanguage />
        <AccessibleLayout />
      </div>
    </Suspense>

  );
}

export default App;