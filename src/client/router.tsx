import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { Chatbot } from "./pages/Chatbot";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Dashboard route (index)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

// Chatbot route
const chatbotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chatbot",
  component: Chatbot,
});

// Route tree
const routeTree = rootRoute.addChildren([dashboardRoute, chatbotRoute]);

// Create router
export const router = createRouter({ routeTree });

// Type safety for router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
