import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home, { LegalPage, LedgerPage, MethodologyPage, ResponsibleUsePage, TrialPage } from "./pages/Home";
import AdminValidation from "./pages/AdminValidation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ledger" component={LedgerPage} />
      <Route path="/trial" component={TrialPage} />
      <Route path="/methodology" component={MethodologyPage} />
      <Route path="/responsible-use" component={ResponsibleUsePage} />
      <Route path="/admin/validation" component={AdminValidation} />
      <Route path="/privacy"><LegalPage title="Privacy placeholder" eyebrow="LEGAL" /></Route>
      <Route path="/terms"><LegalPage title="Terms placeholder" eyebrow="LEGAL" /></Route>
      <Route component={Home} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
