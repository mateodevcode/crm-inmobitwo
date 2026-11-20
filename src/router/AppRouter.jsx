// src/router/AppRouter.jsx — rutas del CRM
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RutaAdminOrg, RutaPrivada, RutaPublica, RutaSuperadmin } from "@/router/guards.jsx";
import CrmLayout from "@/layouts/CrmLayout.jsx";
import NotFound from "@/router/NotFound.jsx";
import { CargandoPagina } from "@/router/CargandoPagina.jsx";
import LoginPage from "@/features/auth/LoginPage.jsx";
const GoogleCallbackPage = lazy(() => import("@/features/auth/GoogleCallbackPage.jsx"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage.jsx"));
const PortadaPage = lazy(() => import("@/features/portada/PortadaPage.jsx"));
const AdminPage = lazy(() => import("@/features/admin/AdminPage.jsx"));
const DominiosPage = lazy(() => import("@/features/dominios/DominiosPage.jsx"));
const UsuariosPage = lazy(() => import("@/features/usuarios/UsuariosPage.jsx"));
const InmobiliariasPage = lazy(() => import("@/features/inmobiliaria/InmobiliariasPage.jsx"));
const MensajesPage = lazy(() => import("@/features/mensajes/MensajesPage.jsx"));
const WizardPage = lazy(() => import("@/features/propiedades/wizard/WizardPage.jsx"));
const InmobiliariaPage = lazy(() => import("@/features/inmobiliaria/InmobiliariaPage.jsx"));
const LeadsPage = lazy(() => import("@/features/leads/LeadsPage.jsx"));
const ContactosPage = lazy(() => import("@/features/contactos/ContactosPage.jsx"));
const ContactoDetallePage = lazy(() => import("@/features/contactos/ContactoDetallePage.jsx"));
const PipelinePage = lazy(() => import("@/features/pipeline/PipelinePage.jsx"));
const TareasPage = lazy(() => import("@/features/tareas/TareasPage.jsx"));
const AgendaPage = lazy(() => import("@/features/agenda/AgendaPage.jsx"));
const DemandasPage = lazy(() => import("@/features/demandas/DemandasPage.jsx"));
const CaptacionesPage = lazy(() => import("@/features/captaciones/CaptacionesPage.jsx"));
const FichaPage = lazy(() => import("@/features/propiedades/FichaPage.jsx"));
const BandejaPage = lazy(() => import("@/features/bandeja/BandejaPage.jsx"));
const PropiedadesPage = lazy(() => import("@/features/propiedades/PropiedadesPage.jsx"));
const EquipoPage = lazy(() => import("@/features/equipo/EquipoPage.jsx"));
const ReportesPage = lazy(() => import("@/features/reportes/ReportesPage.jsx"));
const ImportarPage = lazy(() => import("@/features/importacion/ImportarPage.jsx"));
const NotificacionesPage = lazy(() => import("@/features/notificaciones/NotificacionesPage.jsx"));
const HabeasDataPage = lazy(() => import("@/features/habeas/HabeasDataPage.jsx"));
const AjustesPage = lazy(() => import("@/features/ajustes/AjustesPage.jsx"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<CargandoPagina />}>
      <Routes>
        <Route
          path="/login"
          element={
            <RutaPublica>
              <LoginPage />
            </RutaPublica>
          }
        />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        {/* Ficha imprimible: con sesión pero sin el layout del CRM */}
        <Route
          path="/propiedades/:id/ficha"
          element={
            <RutaPrivada>
              <FichaPage />
            </RutaPrivada>
          }
        />
        <Route
          element={
            <RutaPrivada>
              <CrmLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="portada"
            element={
              <RutaSuperadmin>
                <PortadaPage />
              </RutaSuperadmin>
            }
          />
          <Route
            path="admin"
            element={
              <RutaSuperadmin>
                <AdminPage />
              </RutaSuperadmin>
            }
          />
          <Route
            path="dominios"
            element={
              <RutaSuperadmin>
                <DominiosPage />
              </RutaSuperadmin>
            }
          />
          <Route
            path="usuarios"
            element={
              <RutaSuperadmin>
                <UsuariosPage />
              </RutaSuperadmin>
            }
          />
          <Route
            path="inmobiliarias"
            element={
              <RutaSuperadmin>
                <InmobiliariasPage />
              </RutaSuperadmin>
            }
          />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="contactos" element={<ContactosPage />} />
          <Route path="contactos/:id" element={<ContactoDetallePage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="tareas" element={<TareasPage />} />
          <Route path="bandeja" element={<BandejaPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="demandas" element={<DemandasPage />} />
          <Route path="captaciones" element={<CaptacionesPage />} />
          <Route path="propiedades" element={<PropiedadesPage />} />
          <Route path="propiedades/nuevo" element={<WizardPage />} />
          <Route path="propiedades/:id/editar" element={<WizardPage />} />
          <Route
            path="equipo"
            element={
              <RutaAdminOrg>
                <EquipoPage />
              </RutaAdminOrg>
            }
          />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="importar" element={<ImportarPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="habeas-data" element={<HabeasDataPage />} />
          <Route path="ajustes" element={<AjustesPage />} />
          <Route path="mi-inmobiliaria" element={<InmobiliariaPage />} />
          <Route path="mensajes" element={<MensajesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
