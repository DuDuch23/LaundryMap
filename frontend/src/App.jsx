import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import './App.css'
import Header from './components/Header';
import Footer from './components/Footer/footer';
import HeaderAdmin from './components/HeaderAdmin';
import PageLoader from './components/PageLoader';
import { Toaster } from './components/ui/sonner';

// Pages
const Home = React.lazy(() => import('./pages/Home'));
const Profil = React.lazy(() => import('./pages/Profil'));
const InscriptionUtilisateur = React.lazy(() => import('./pages/InscriptionUtilisateur'));
const InscriptionPro = React.lazy(() => import('./pages/InscriptionProfessionnel'));
const Connexion = React.lazy(() => import('./pages/Connexion'));
const GestionUtilisateur = React.lazy(() => import('./pages/administration/GestionUtilisateur'));
// const TableauDeBord = React.lazy(() => import('./pages/administration/TableauDeBord'));
const DetailUtilisateur = React.lazy(() => import('./pages/administration/DetailUtilisateur'));
const GestionLaveries = React.lazy(() => import('./pages/administration/GestionLaveries'));
const DetailLaverie = React.lazy(() => import('./pages/administration/DetailLaverie'));
const EmailVerification = React.lazy(() => import('./pages/EmailVerification'));
const AjoutLaverie = React.lazy(() => import('./pages/AjoutLaverie/AjoutLaverie'));

const MesFavoris = React.lazy(() => import('./pages/MesFavoris'));
const FicheLaverie = React.lazy(() => import('./pages/FicheLaverie'));
const TermsOfUse = React.lazy(() => import('./pages/TermsOfUse'));
const LegalNotice = React.lazy(() => import('./pages/LegalNotice'));
const ProprieteIntellectuelle = React.lazy(() => import('./pages/ProprieteIntellectuelle'));
const TableauDeBordPro = React.lazy(() => import('./pages/professionnel/TableauDeBordPro'));
const ModifierLaveriePro = React.lazy(() => import('./pages/professionnel/ModifierLaveriePro'));
const ProRoute = React.lazy(() => import('./routes/ProRoute'));
const UserRoute = React.lazy(() => import('./routes/UserRoute'));

function AuthRoute({ children }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hash = location.hash?.startsWith('#') ? location.hash.slice(1) : location.hash;
  const hashParams = new URLSearchParams(hash || '');
  const tokenInUrl = hashParams.get('token') ?? searchParams.get('token');
  const oauthError = hashParams.get('error') ?? searchParams.get('error');

  if (tokenInUrl) {
    localStorage.setItem('token', tokenInUrl);
    return <Navigate to={location.pathname} replace />;
  }

  if (oauthError) {
    return <Navigate to="/connexion" replace />;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hash = location.hash?.startsWith('#') ? location.hash.slice(1) : location.hash;
  const hashParams = new URLSearchParams(hash || '');
  const tokenInUrl = hashParams.get('token') ?? searchParams.get('token');

  if (tokenInUrl) {
    localStorage.setItem('token', tokenInUrl);
    return <Navigate to={location.pathname} replace />;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}

function App() {
  // todo : rediriger vers la page de connexion si le token est expiré ou invalide (gérer ça dans une route protégée ?)
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className='bg-gray-50 w-full mx-auto flex flex-col items-center max-w-full lg:max-w-[1280px]'>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Header />}>
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<AuthRoute><Profil /></AuthRoute>} />
              <Route path="/inscription-utilisateur" element={<InscriptionUtilisateur />} />
              <Route path="/inscription-pro" element={<InscriptionPro />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/email-verifie" element={<EmailVerification />} />

              <Route path="/laveries/:id" element={<FicheLaverie />} />
              <Route path="/cgu" element={<TermsOfUse />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/propriete-intellectuelle" element={<ProprieteIntellectuelle />} />
              <Route element={<UserRoute />}>
                <Route path="/mes-favoris" element={<MesFavoris />} />
              </Route>

            </Route>

            <Route element={<RequireAdmin><HeaderAdmin /></RequireAdmin>}>
              {/* <Route path="/admin/tableau-de-bord" element={<TableauDeBord />} /> */}
              <Route path="/admin/gestion-utilisateurs" element={<GestionUtilisateur />} />
              <Route path="/admin/utilisateurs/:id" element={<DetailUtilisateur />} />
              <Route path="/admin/gestion-laveries" element={<GestionLaveries />} />
              <Route path="/admin/laveries/:id" element={<DetailLaverie />} />
            </Route>

            <Route element={<ProRoute />}>
              <Route path="/professionnel/tableau-de-bord" element={<TableauDeBordPro />} />
              <Route path="/professionnel/laveries/:id/modifier" element={<ModifierLaveriePro />} />
              <Route path="/professionnel/nouvelle-laverie" element={<AjoutLaverie />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

export default App;