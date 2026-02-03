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
import BusinessDetail from './pages/BusinessDetail';
import Businesses from './pages/Businesses';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Setup from './pages/Setup';
import BusinessAnalytics from './pages/BusinessAnalytics';
import ContentPipeline from './pages/ContentPipeline';
import ContentItemDetail from './pages/ContentItemDetail';
import Reviews from './pages/Reviews';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BusinessDetail": BusinessDetail,
    "Businesses": Businesses,
    "Dashboard": Dashboard,
    "Settings": Settings,
    "Setup": Setup,
    "BusinessAnalytics": BusinessAnalytics,
    "ContentPipeline": ContentPipeline,
    "ContentItemDetail": ContentItemDetail,
    "Reviews": Reviews,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};