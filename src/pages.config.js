import BiannualReport from './pages/BiannualReport';
import CEOMode from './pages/CEOMode';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import MigrateHabits from './pages/MigrateHabits';
import Pareto from './pages/Pareto';
import Rank from './pages/Rank';
import Rewards from './pages/Rewards';
import ScreenTime from './pages/ScreenTime';
import ScreenTimeManager from './pages/ScreenTimeManager';
import WinStreak from './pages/WinStreak';
import Settings from './pages/Settings';
import SettingsLanguage from './pages/SettingsLanguage';
import SettingsPrivacy from './pages/SettingsPrivacy';
import SettingsPermissions from './pages/SettingsPermissions';
import SettingsTerms from './pages/SettingsTerms';
import SettingsDeletion from './pages/SettingsDeletion';
import SettingsContact from './pages/SettingsContact';
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
    "MigrateHabits": MigrateHabits,
    "Pareto": Pareto,
    "Rank": Rank,
    "Rewards": Rewards,
    "ScreenTime": ScreenTime,
    "ScreenTimeManager": ScreenTimeManager,
    "WinStreak": WinStreak,
    "Settings": Settings,
    "SettingsLanguage": SettingsLanguage,
    "SettingsPrivacy": SettingsPrivacy,
    "SettingsPermissions": SettingsPermissions,
    "SettingsTerms": SettingsTerms,
    "SettingsDeletion": SettingsDeletion,
    "SettingsContact": SettingsContact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};