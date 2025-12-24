import BiannualReport from './pages/BiannualReport';
import CEOMode from './pages/CEOMode';
import Calendar from './pages/Calendar';
import FocusMode from './pages/FocusMode';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import MigrateHabits from './pages/MigrateHabits';
import Rank from './pages/Rank';
import Rewards from './pages/Rewards';
import ScreenTime from './pages/ScreenTime';
import ScreenTimeManager from './pages/ScreenTimeManager';
import WinStreak from './pages/WinStreak';
import Dashboard from './pages/Dashboard';
import Pareto from './pages/Pareto';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BiannualReport": BiannualReport,
    "CEOMode": CEOMode,
    "Calendar": Calendar,
    "FocusMode": FocusMode,
    "Habits": Habits,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "MigrateHabits": MigrateHabits,
    "Rank": Rank,
    "Rewards": Rewards,
    "ScreenTime": ScreenTime,
    "ScreenTimeManager": ScreenTimeManager,
    "WinStreak": WinStreak,
    "Dashboard": Dashboard,
    "Pareto": Pareto,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};