import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import RootLayout from "@/components/RootLayout";
import Home from "@/pages/Home";

// Tunge ruter lazy-loades — landing-siden er fortsatt det folk treffer
// først, og den må være under 100 kB gzipped for å holde Lighthouse
// Performance >90.
const Scanner = lazy(() => import("@/pages/Scanner"));
const Result = lazy(() => import("@/pages/Result"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route
            path="sjekker"
            element={
              <Suspense fallback={null}>
                <Scanner />
              </Suspense>
            }
          />
          <Route
            path="resultat"
            element={
              <Suspense fallback={null}>
                <Result />
              </Suspense>
            }
          />
          <Route
            path="personvern"
            element={
              <Suspense fallback={null}>
                <Privacy />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border border-border text-foreground shadow-lg rounded-xl",
          },
        }}
      />
    </>
  );
}
