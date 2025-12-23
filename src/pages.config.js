import BiannualReport from './pages/BiannualReport';
import CEOMode from './pages/CEOMode';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Pareto from './pages/Pareto';
import Rank from './pages/Rank';
import Rewards from './pages/Rewards';
import ScreenTime from './pages/ScreenTime';
import ScreenTimeManager from './pages/ScreenTimeManager';
import WinStreak from './pages/WinStreak';
import MigrateHabits from './pages/MigrateHabits';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BiannualReport": BiannualReport,
    "CEOMode": CEOMode,
    "Calendar": Calendar,
    "Dashboard": Dashboard,
    "FocusMode": FocusMode,
    "Habits": Habits,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Pareto": Pareto,
    "Rank": Rank,
    "Rewards": Rewards,
    "ScreenTime": ScreenTime,
    "ScreenTimeManager": ScreenTimeManager,
    "WinStreak": WinStreak,
    "MigrateHabits": MigrateHabits,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};