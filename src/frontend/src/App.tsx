import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { AdminLayout } from "./components/AdminLayout";
import { UserLayout } from "./components/UserLayout";
import { BinaryTreePage } from "./pages/BinaryTree";
import { DashboardPage } from "./pages/Dashboard";
import { HomePage } from "./pages/HomePage";
import { IncomePage } from "./pages/Income";
import { LoginPage } from "./pages/Login";
import { PlansPage } from "./pages/Plans";
import { ProfilePage } from "./pages/Profile";
import { RegisterPage } from "./pages/Register";
import { WalletPage } from "./pages/Wallet";
import { AdminDashboardPage } from "./pages/admin/AdminDashboard";
import { AdminIncomeReportsPage } from "./pages/admin/AdminIncomeReports";
import { AdminLoginPage } from "./pages/admin/AdminLogin";
import { AdminPaymentsPage } from "./pages/admin/AdminPayments";
import { AdminPlansPage } from "./pages/admin/AdminPlans";
import { AdminProductsPage } from "./pages/admin/AdminProducts";
import { AdminRegistrationsPage } from "./pages/admin/AdminRegistrations";
import { AdminSettingsPage } from "./pages/admin/AdminSettings";
import { AdminTreePage } from "./pages/admin/AdminTree";
import { AdminUsersPage } from "./pages/admin/AdminUsers";
import { AdminWithdrawalsPage } from "./pages/admin/AdminWithdrawals";

// Use hash history so ICP canister serves all routes from index.html
const hashHistory = createHashHistory();

// Root
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Homepage route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Auth routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

// User layout route
const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user-layout",
  component: UserLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const treeRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/tree",
  component: BinaryTreePage,
});

const incomeRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/income",
  component: IncomePage,
});

const walletRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/wallet",
  component: WalletPage,
});

const plansRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/plans",
  component: PlansPage,
});

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

// Admin layout route (protected)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
  beforeLoad: () => {
    const token = localStorage.getItem("guccora_admin_token");
    if (!token) {
      throw redirect({ to: "/admin/login" });
    }
  },
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminRegistrationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/registrations",
  component: AdminRegistrationsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

// /admin/payments → Payments Verification (registration approval)
const adminPaymentsVerifyRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/payments",
  component: AdminRegistrationsPage,
});

// /admin/payment-records → actual payment records
const adminPaymentRecordsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/payment-records",
  component: AdminPaymentsPage,
});

// /admin/withdraw and /admin/withdrawals both go to withdrawals page
const adminWithdrawRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/withdraw",
  component: AdminWithdrawalsPage,
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/withdrawals",
  component: AdminWithdrawalsPage,
});

const adminPlansRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/plans",
  component: AdminPlansPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/products",
  component: AdminProductsPage,
});

const adminTreeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/tree",
  component: AdminTreePage,
});

const adminIncomeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/income",
  component: AdminIncomeReportsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  adminLoginRoute,
  userLayoutRoute.addChildren([
    dashboardRoute,
    treeRoute,
    incomeRoute,
    walletRoute,
    plansRoute,
    profileRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminRegistrationsRoute,
    adminUsersRoute,
    adminPaymentsVerifyRoute,
    adminPaymentRecordsRoute,
    adminWithdrawRoute,
    adminWithdrawalsRoute,
    adminPlansRoute,
    adminProductsRoute,
    adminTreeRoute,
    adminIncomeRoute,
    adminSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
