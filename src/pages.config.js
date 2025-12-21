import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import WinStreak from './pages/WinStreak';
import Rank from './pages/Rank';
import CEOMode from './pages/CEOMode';
import Habits from './pages/Habits';
import Pareto from './pages/Pareto';
import ScreenTime from './pages/ScreenTime';
import Rewards from './pages/Rewards';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import ScreenTimeManager from './pages/ScreenTimeManager';
import BiannualReport from './pages/BiannualReport';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "FocusMode": FocusMode,
    "WinStreak": WinStreak,
    "Rank": Rank,
    "CEOMode": CEOMode,
    "Habits": Habits,
    "Pareto": Pareto,
    "ScreenTime": ScreenTime,
    "Rewards": Rewards,
    "Calendar": Calendar,
    "Leaderboard": Leaderboard,
    "ScreenTimeManager": ScreenTimeManager,
    "BiannualReport": BiannualReport,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};