import BiannualReport from './pages/BiannualReport';
import BlockingDemo from './pages/BlockingDemo';
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
import Settings from './pages/Settings';
import SettingsContact from './pages/SettingsContact';
import SettingsDeletion from './pages/SettingsDeletion';
import SettingsLanguage from './pages/SettingsLanguage';
import SettingsPermissions from './pages/SettingsPermissions';
import SettingsPrivacy from './pages/SettingsPrivacy';
import SettingsTerms from './pages/SettingsTerms';
import WinStreak from './pages/WinStreak';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BiannualReport": BiannualReport,
    "BlockingDemo": BlockingDemo,
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
    "Settings": Settings,
    "SettingsContact": SettingsContact,
    "SettingsDeletion": SettingsDeletion,
    "SettingsLanguage": SettingsLanguage,
    "SettingsPermissions": SettingsPermissions,
    "SettingsPrivacy": SettingsPrivacy,
    "SettingsTerms": SettingsTerms,
    "WinStreak": WinStreak,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};