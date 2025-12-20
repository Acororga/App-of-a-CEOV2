import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import WinStreak from './pages/WinStreak';
import Rank from './pages/Rank';
import CEOMode from './pages/CEOMode';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "FocusMode": FocusMode,
    "WinStreak": WinStreak,
    "Rank": Rank,
    "CEOMode": CEOMode,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};