import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import RecordDetail from "@/pages/RecordDetail";
import MapPage from "@/pages/MapPage";
import FindMaster from "@/pages/FindMaster";
import PractitionerProfile from "@/pages/PractitionerProfile";
import DocumentHeritage from "@/pages/DocumentHeritage";
import Review from "@/pages/Review";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ArchiveLayout from "./components/ArchiveLayout";

function Router() {
  return (
    <ArchiveLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/record/:slug" component={RecordDetail} />
        <Route path="/map" component={MapPage} />
        <Route path="/masters" component={FindMaster} />
        <Route path="/master/:id" component={PractitionerProfile} />
        <Route path="/document" component={DocumentHeritage} />
        <Route path="/verify" component={Review} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </ArchiveLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
