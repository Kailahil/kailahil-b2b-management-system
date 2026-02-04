/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIInsights from './pages/AIInsights';
import BusinessAnalytics from './pages/BusinessAnalytics';
import BusinessDetail from './pages/BusinessDetail';
import Businesses from './pages/Businesses';
import ClientChat from './pages/ClientChat';
import ClientDashboard from './pages/ClientDashboard';
import ClientInsights from './pages/ClientInsights';
import ClientLogin from './pages/ClientLogin';
import ClientReports from './pages/ClientReports';
import ClientSettings from './pages/ClientSettings';
import ClientSignup from './pages/ClientSignup';
import ClientSignupApprovals from './pages/ClientSignupApprovals';
import ClientWork from './pages/ClientWork';
import ContentItemDetail from './pages/ContentItemDetail';
import ContentPipeline from './pages/ContentPipeline';
import Dashboard from './pages/Dashboard';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeSignup from './pages/EmployeeSignup';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import GrowthPlanner from './pages/GrowthPlanner';
import Home from './pages/Home';
import MediaSpecialistChat from './pages/MediaSpecialistChat';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIInsights": AIInsights,
    "BusinessAnalytics": BusinessAnalytics,
    "BusinessDetail": BusinessDetail,
    "Businesses": Businesses,
    "ClientChat": ClientChat,
    "ClientDashboard": ClientDashboard,
    "ClientInsights": ClientInsights,
    "ClientLogin": ClientLogin,
    "ClientReports": ClientReports,
    "ClientSettings": ClientSettings,
    "ClientSignup": ClientSignup,
    "ClientSignupApprovals": ClientSignupApprovals,
    "ClientWork": ClientWork,
    "ContentItemDetail": ContentItemDetail,
    "ContentPipeline": ContentPipeline,
    "Dashboard": Dashboard,
    "EmployeeLogin": EmployeeLogin,
    "EmployeeSignup": EmployeeSignup,
    "ExecutiveDashboard": ExecutiveDashboard,
    "GrowthPlanner": GrowthPlanner,
    "Home": Home,
    "MediaSpecialistChat": MediaSpecialistChat,
    "Reviews": Reviews,
    "Settings": Settings,
    "Welcome": Welcome,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};