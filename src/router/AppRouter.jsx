// src/router/AppRouter.jsx — rutas del CRM
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RutaAdminOrg, RutaPrivada, RutaPublica, RutaSuperadmin } from "@/router/guards.jsx";
import CrmLayout from "@/layouts/CrmLayout.jsx";
import NotFound from "@/router/NotFound.jsx";
import LoginPage from "@/features/auth/LoginPage.jsx";
import DashboardPage from "@/features/dashboard/DashboardPage.jsx";
import PortadaPage from "@/features/portada/PortadaPage.jsx";
import AdminPage from "@/features/admin/AdminPage.jsx";
import DominiosPage from "@/features/dominios/DominiosPage.jsx";
import InmobiliariaPage from "@/features/inmobiliaria/InmobiliariaPage.jsx";
import LeadsPage from "@/features/leads/LeadsPage.jsx";
import ContactosPage from "@/features/contactos/ContactosPage.jsx";
import ContactoDetallePage from "@/features/contactos/ContactoDetallePage.jsx";
import PipelinePage from "@/features/pipeline/PipelinePage.jsx";
import TareasPage from "@/features/tareas/TareasPage.jsx";
import PropiedadesPage from "@/features/propiedades/PropiedadesPage.jsx";
import EquipoPage from "@/features/equipo/EquipoPage.jsx";
import ReportesPage from "@/features/reportes/ReportesPage.jsx";
import AjustesPage from "@/features/ajustes/AjustesPage.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RutaPublica>
              <LoginPage />
            </RutaPublica>
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
          <Route path="leads" element={<LeadsPage />} />
          <Route path="contactos" element={<ContactosPage />} />
          <Route path="contactos/:id" element={<ContactoDetallePage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="tareas" element={<TareasPage />} />
          <Route path="propiedades" element={<PropiedadesPage />} />
          <Route
            path="equipo"
            element={
              <RutaAdminOrg>
                <EquipoPage />
              </RutaAdminOrg>
            }
          />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="ajustes" element={<AjustesPage />} />
          <Route path="mi-inmobiliaria" element={<InmobiliariaPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
