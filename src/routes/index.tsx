import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Home,
  TrendingUp,
  Target,
  Activity,
  Settings,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  Bell,
  Lock,
  Crown,
  Users,
  DollarSign,
  PiggyBank,
  CreditCard,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  LogOut,
  LogIn,
  X,
  Download,
  Search,
  Filter,
  Moon,
  Sun,
  PieChart,
  LineChart,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Trash2,
  Edit2,
  Receipt,
  Repeat,
  Calculator,
  Zap,
  FileText,
  Mail,
  Copy,
  Clock,
  Share2,
  MessageCircle,
  Lightbulb,
  Gift,
  TrendingUp as TrendingUpIcon,
  ArrowRight,
  RefreshCw,
  Star,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Menu,
  Power,
  RotateCcw,
  UserCog
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserORM, type UserModel } from "@/components/data/orm/orm_user";
import { CoupleORM, CoupleStatus, type CoupleModel } from "@/components/data/orm/orm_couple";
import { TransactionORM, TransactionType, type TransactionModel } from "@/components/data/orm/orm_transaction";
import { UserSubscriptionORM, UserSubscriptionTier, type UserSubscriptionModel } from "@/components/data/orm/orm_user_subscription";

export const Route = createFileRoute("/")({
  component: App,
});

// Categories for transactions - organized by type
const EXPENSE_CATEGORIES = [
  { value: "food-dining", label: "Food & Dining", icon: "utensils" },
  { value: "groceries", label: "Groceries", icon: "shopping-cart" },
  { value: "rent", label: "Rent/Mortgage", icon: "home" },
  { value: "utilities", label: "Utilities", icon: "zap" },
  { value: "transportation", label: "Transportation", icon: "car" },
  { value: "entertainment", label: "Entertainment", icon: "film" },
  { value: "shopping", label: "Shopping", icon: "shopping-bag" },
  { value: "healthcare", label: "Healthcare", icon: "heart" },
  { value: "subscriptions", label: "Subscriptions", icon: "repeat" },
  { value: "insurance", label: "Insurance", icon: "shield" },
  { value: "personal", label: "Personal Care", icon: "user" },
  { value: "education", label: "Education", icon: "book" },
  { value: "travel", label: "Travel", icon: "plane" },
  { value: "gifts", label: "Gifts & Donations", icon: "gift" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

// Simple category list for backwards compatibility
const CATEGORIES = EXPENSE_CATEGORIES.map(c => c.label);

// Split modes
const SPLIT_MODES = [
  { value: "50-50", label: "50/50 Split" },
  { value: "income-based", label: "Income-based" },
  { value: "custom", label: "Custom %" },
  { value: "one-person", label: "This one's on me" }
];

type ViewMode = "loading" | "auth" | "onboarding" | "pairing" | "dashboard" | "tutorial";
type DashboardTab = "home" | "budget" | "goals" | "activity" | "settings";

function App() {
  // Auth state - start with loading to prevent flash of login screen
  const [viewMode, setViewMode] = useState<ViewMode>("loading");
  const [isLogin, setIsLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [currentCouple, setCurrentCouple] = useState<CoupleModel | null>(null);
  const [partner, setPartner] = useState<UserModel | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Transaction form
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txDate, setTxDate] = useState<Date>(new Date());
  const [txSplitMode, setTxSplitMode] = useState("50-50");
  const [txCustomSplit, setTxCustomSplit] = useState("50");
  const [txIsPrivate, setTxIsPrivate] = useState(false);

  // Budget form
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgets, setBudgets] = useState<Array<{ category: string; limit: number }>>([]);

  // Goals form
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState<Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: Date;
    user1Contrib: number;
    user2Contrib: number;
  }>>([]);

  // Bills
  const [bills, setBills] = useState<Array<{
    name: string;
    amount: number;
    dueDay: number;
    assignedTo: "user1" | "user2" | "shared";
    category: string;
  }>>([]);

  // Notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: "overspending" | "goal" | "bill" | "insight";
    message: string;
    isRead: boolean;
    date: Date;
  }>>([]);

  // New feature states
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("together_dark_mode") === "true";
  });

  // Settings state
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("together_currency") || "USD";
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showProfileSaved, setShowProfileSaved] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<{
    budgetAlerts: boolean;
    goalProgress: boolean;
    billReminders: boolean;
    weeklyInsights: boolean;
    partnerActivity: boolean;
  }>(() => {
    const saved = localStorage.getItem("together_notification_prefs");
    return saved ? JSON.parse(saved) : {
      budgetAlerts: true,
      goalProgress: true,
      billReminders: true,
      weeklyInsights: true,
      partnerActivity: true
    };
  });
  const [showExportData, setShowExportData] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showSettleBalance, setShowSettleBalance] = useState(false);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState<Date>(new Date());
  const [showCharts, setShowCharts] = useState(false);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem("together_tutorial_completed") === "true";
  });

  // Post-tutorial guided mode - shows interactive prompts for first-time actions
  const [showGuidedMode, setShowGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("together_guided_steps");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Track if user just signed up (for post-tutorial flow)
  const [isNewSignup, setIsNewSignup] = useState(false);

  // Reset all financial data to zero/empty for new users
  const resetAllFinancialData = () => {
    // Reset transactions (will be empty for new couple)
    setTransactions([]);

    // Reset budgets to empty
    setBudgets([]);

    // Reset goals to empty
    setGoals([]);

    // Reset bills to empty
    setBills([]);

    // Reset notifications to empty
    setNotifications([]);

    // Reset milestones to unachieved state
    setMilestones([
      { id: "1", title: "First Expense Tracked", description: "Added your first shared expense", achieved: false, type: "spending" },
      { id: "2", title: "Budget Master", description: "Set up 3 budget categories", achieved: false, type: "budget" },
      { id: "3", title: "Goal Setter", description: "Created your first savings goal", achieved: false, type: "savings" },
      { id: "4", title: "Savings Star", description: "Saved $100 towards a goal", achieved: false, type: "savings" },
      { id: "5", title: "Under Budget", description: "Stayed under budget for a full month", achieved: false, type: "budget" },
      { id: "6", title: "Bill Tracker", description: "Set up recurring bills tracking", achieved: false, type: "spending" }
    ]);

    // Reset guided steps
    setCompletedGuidedSteps(new Set());
    localStorage.removeItem("together_guided_steps");

    // Reset tutorial state
    setHasSeenTutorial(false);
    localStorage.removeItem("together_tutorial_completed");
  };

  // Load initial data
  useEffect(() => {
    loadUserData();
  }, []);

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem("together_dark_mode", darkMode.toString());
    // Apply dark mode to document root for potential CSS var changes
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Persist currency preference
  useEffect(() => {
    localStorage.setItem("together_currency", currency);
  }, [currency]);

  // Persist notification preferences
  useEffect(() => {
    localStorage.setItem("together_notification_prefs", JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  // Show tutorial when user enters tutorial mode or dashboard (for returning users)
  // When tutorial starts, reset all financial data to 0 so users start fresh
  useEffect(() => {
    if (viewMode === "tutorial") {
      setShowTutorial(true);
      // Reset all data when entering tutorial mode
      resetAllFinancialData();
    } else if (viewMode === "dashboard" && !hasSeenTutorial) {
      setShowTutorial(true);
      // Reset all data for users seeing the tutorial for the first time
      resetAllFinancialData();
    }
  }, [viewMode, hasSeenTutorial]);

  const loadUserData = async () => {
    try {
      const userOrm = UserORM.getInstance();
      const [users] = await userOrm.listUser();
      if (users && users.length > 0) {
        const user = users[0];
        setCurrentUser(user);

        // Reset all local financial data to 0 for a fresh start
        // This ensures users always see clean 0 values when the app loads
        resetAllFinancialData();

        await loadCoupleData(user.id);
      } else {
        // No existing user found, show auth screen
        setViewMode("auth");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // On error, show auth screen
      setViewMode("auth");
    }
  };

  const loadCoupleData = async (userId: string) => {
    try {
      const coupleOrm = CoupleORM.getInstance();
      const [couples] = await coupleOrm.listCouple();
      if (couples && couples.length > 0) {
        const couple = couples[0];
        setCurrentCouple(couple);

        // Load partner data
        const partnerId = couple.partner_one_id === userId ? couple.partner_two_id : couple.partner_one_id;
        const userOrm = UserORM.getInstance();
        const allUsers = await userOrm.getAllUser();
        const partnerData = allUsers.find(u => u.id === partnerId);
        if (partnerData) {
          setPartner(partnerData);
        }

        // Load transactions
        await loadTransactions(couple.id);

        // Check subscription
        await checkSubscription(userId);

        setViewMode("dashboard");
      } else {
        setViewMode("pairing");
      }
    } catch (error) {
      console.error("Error loading couple data:", error);
      setViewMode("pairing");
    }
  };

  const loadTransactions = async (coupleId: string) => {
    try {
      const txOrm = TransactionORM.getInstance();
      const [txList] = await txOrm.listTransaction();
      // Filter transactions by couple_id on client side
      const filtered = txList.filter(tx => tx.couple_id === coupleId);
      setTransactions(filtered);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const checkSubscription = async (userId: string) => {
    try {
      const subOrm = UserSubscriptionORM.getInstance();
      const [subs] = await subOrm.listUserSubscription();
      const activeSub = subs.find(s => s.user_id === userId && s.is_active);
      if (activeSub) {
        setIsPremium(activeSub.tier === UserSubscriptionTier.Premium);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSignup = async () => {
    // Clear previous errors
    setAuthError("");

    // Validation
    if (!email || !password || !name) {
      setAuthError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setAuthError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const userOrm = UserORM.getInstance();

      // Check if email already exists
      const [existingUsers] = await userOrm.listUser();
      if (existingUsers.find(u => u.email === email)) {
        setAuthError("An account with this email already exists. Please login instead.");
        setIsLogin(true);
        setIsLoading(false);
        return;
      }

      const newUsers = await userOrm.insertUser([{
        email,
        password,
        name,
        currency_preference: "USD"
      }] as any);

      if (newUsers && newUsers.length > 0) {
        setCurrentUser(newUsers[0]);
        // Clear form
        setEmail("");
        setPassword("");
        setName("");
        setAuthError("");

        // Reset all financial data to 0 for new user
        resetAllFinancialData();

        // Mark as new signup and go straight to tutorial
        setIsNewSignup(true);
        setViewMode("tutorial");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setAuthError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setAuthError("");

    // Validation
    if (!email || !password) {
      setAuthError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const userOrm = UserORM.getInstance();
      const [users] = await userOrm.listUser();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        setCurrentUser(user);
        // Clear form
        setEmail("");
        setPassword("");
        setAuthError("");

        // Reset all financial data to 0 for a fresh start on login
        // This ensures users see clean 0 values when they log in
        resetAllFinancialData();

        await loadCoupleData(user.id);
      } else {
        setAuthError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setAuthError("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePairingCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const handleCreateCouple = async () => {
    if (!currentUser) return;

    try {
      const coupleOrm = CoupleORM.getInstance();
      const newCouples = await coupleOrm.insertCouple([{
        partner_one_id: currentUser.id,
        partner_two_id: "", // Will be filled when partner joins
        status: CoupleStatus.Pending
      }] as any);
      if (newCouples && newCouples.length > 0) {
        setCurrentCouple(newCouples[0]);
        generatePairingCode();
      }
    } catch (error) {
      console.error("Error creating couple:", error);
    }
  };

  const handleJoinCouple = async () => {
    // In a real app, this would look up the couple by pairing code
    // For now, we'll just move to dashboard
    setViewMode("dashboard");
    // Start guided mode if not completed
    if (completedGuidedSteps.size < guidedSteps.length) {
      setShowGuidedMode(true);
      // Find first incomplete step
      const firstIncompleteIndex = guidedSteps.findIndex(s => !completedGuidedSteps.has(s.id));
      setGuidedStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentCouple(null);
    setPartner(null);
    setTransactions([]);
    setIsPremium(false);
    setViewMode("auth");
    setShowExitMenu(false);
    setShowMainMenu(false);
  };

  // Handle full restart - resets all data and goes back to login
  const handleFullRestart = () => {
    // Reset all financial data
    resetAllFinancialData();

    // Reset user session
    setCurrentUser(null);
    setCurrentCouple(null);
    setPartner(null);
    setIsPremium(false);

    // Reset view state
    setViewMode("auth");
    setShowRestartConfirm(false);
    setShowMainMenu(false);

    // Clear any local storage
    localStorage.removeItem("together_tutorial_completed");
    localStorage.removeItem("together_guided_steps");
  };

  // Handle restart just the financial data (keep account)
  const handleRestartFinancialData = () => {
    resetAllFinancialData();
    setShowRestartConfirm(false);
    setShowMainMenu(false);

    // Show notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: "All financial data has been reset. You're starting fresh!",
      isRead: false,
      date: new Date()
    }, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleAddTransaction = async () => {
    if (!currentCouple || !currentUser) return;

    try {
      const txOrm = TransactionORM.getInstance();
      await txOrm.insertTransaction([{
        couple_id: currentCouple.id,
        amount: parseFloat(txAmount),
        currency: "USD",
        category: txCategory,
        description: txDescription,
        transaction_date: format(txDate, "yyyy-MM-dd"),
        type: TransactionType.Expense
      }] as any);

      await loadTransactions(currentCouple.id);
      setShowAddTransaction(false);

      // Reset form
      setTxAmount("");
      setTxCategory("");
      setTxDescription("");
      setTxDate(new Date());
      setTxSplitMode("50-50");
      setTxCustomSplit("50");
      setTxIsPrivate(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const calculateBalance = () => {
    if (!currentUser || !partner || transactions.length === 0) return { user1Owes: 0, user2Owes: 0 };

    let user1Total = 0;
    let user2Total = 0;

    transactions.forEach(tx => {
      const amount = tx.amount / 2; // Simple 50/50 split for now
      if (tx.data_creator === currentUser.id) {
        user2Total += amount;
      } else {
        user1Total += amount;
      }
    });

    return {
      user1Owes: user1Total,
      user2Owes: user2Total
    };
  };

  const calculateHealthScore = () => {
    // Simple health score calculation
    let score = 100;

    // Deduct for overspending (auto-calculated from transactions)
    budgets.forEach(budget => {
      const spent = getSpentForCategory(budget.category);
      if (spent > budget.limit) {
        score -= 10;
      }
    });

    // Add for goal progress (only if there are goals)
    if (goals.length > 0) {
      const avgGoalProgress = goals.reduce((acc, goal) => {
        if (goal.target > 0) {
          return acc + (goal.current / goal.target);
        }
        return acc;
      }, 0) / goals.length;
      score += avgGoalProgress * 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getTotalMonthlySpending = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    return transactions
      .filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Calculate spent amount for a budget category from transactions (auto-calculation)
  const getSpentForCategory = (category: string) => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    return transactions
      .filter(tx => {
        const txDate = new Date(tx.transaction_date);
        return tx.category === category &&
               txDate.getMonth() === thisMonth &&
               txDate.getFullYear() === thisYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Get budgets with calculated spent amounts
  const getBudgetsWithSpent = () => {
    return budgets.map(budget => ({
      ...budget,
      spent: getSpentForCategory(budget.category)
    }));
  };

  // New feature handlers
  const handleSettleBalance = () => {
    // In a real app, this would process payment
    alert("Balance settlement initiated! You would be redirected to payment processing.");
    setShowSettleBalance(false);
  };

  const handleAddContribution = () => {
    if (!selectedGoalId || !contributionAmount) return;

    setGoals(prev =>
      prev.map(goal => {
        if (goal.id === selectedGoalId && currentUser) {
          return {
            ...goal,
            current: goal.current + parseFloat(contributionAmount),
            user1Contrib: goal.user1Contrib + parseFloat(contributionAmount)
          };
        }
        return goal;
      })
    );

    // Add success notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "goal",
      message: `You added $${contributionAmount} to your savings goal!`,
      isRead: false,
      date: new Date()
    }, ...prev]);

    setShowAddContribution(false);
    setContributionAmount("");
    setSelectedGoalId("");
  };

  const handleAddBudgetSubmit = () => {
    if (!budgetCategory || !budgetLimit) return;

    const limitAmount = parseFloat(budgetLimit);
    if (isNaN(limitAmount) || limitAmount <= 0) return;

    setBudgets(prev => [...prev, {
      category: budgetCategory,
      limit: limitAmount
    }]);

    // Add notification for new budget
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: `New budget created: ${budgetCategory} - $${limitAmount.toFixed(2)}/month`,
      isRead: false,
      date: new Date()
    }, ...prev]);

    setShowAddBudget(false);
    setBudgetCategory("");
    setBudgetLimit("");
  };

  const handleAddGoalSubmit = () => {
    if (!goalName || !goalTarget) return;

    const targetAmount = parseFloat(goalTarget);
    if (isNaN(targetAmount) || targetAmount <= 0) return;

    const newGoal = {
      id: Date.now().toString(),
      name: goalName,
      target: targetAmount,
      current: 0,
      deadline: goalDeadline,
      user1Contrib: 0,
      user2Contrib: 0
    };

    setGoals(prev => [...prev, newGoal]);

    // Add a notification for the new goal
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "goal" as const,
      message: `New goal created: ${goalName} - Target $${targetAmount.toFixed(2)}`,
      isRead: false,
      date: new Date()
    }, ...prev]);

    setShowAddGoal(false);
    setGoalName("");
    setGoalTarget("");
    setGoalDeadline(new Date());
  };

  const handleExportReport = () => {
    // Generate CSV report
    const csvContent = [
      ["Date", "Category", "Description", "Amount"],
      ...transactions.map(tx => [
        format(new Date(tx.transaction_date), "yyyy-MM-dd"),
        tx.category,
        tx.description || "",
        tx.amount.toString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webalance-report-${format(new Date(), "yyyy-MM")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      const matchesSearch = searchQuery === "" ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === "all" || tx.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const getCategorySpending = () => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // NEW FEATURE HANDLERS

  // Profile update handler
  const handleSaveProfile = async () => {
    if (!currentUser || !editName.trim()) return;

    try {
      const userOrm = UserORM.getInstance();
      // Use setUserById which requires the full UserModel object
      const updatedUser: UserModel = {
        ...currentUser,
        name: editName.trim(),
        email: editEmail.trim() || currentUser.email
      };
      await userOrm.setUserById(currentUser.id, updatedUser);

      // Update local state
      setCurrentUser(updatedUser);

      setEditingProfile(false);
      setShowProfileSaved(true);
      setTimeout(() => setShowProfileSaved(false), 3000);

      // Add notification
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: "insight" as const,
        message: "Profile updated successfully!",
        isRead: false,
        date: new Date()
      }, ...prev]);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Export all data handler
  const handleExportAllData = () => {
    const allData = {
      exportDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      user: {
        name: currentUser?.name,
        email: currentUser?.email
      },
      partner: {
        name: partner?.name,
        email: partner?.email
      },
      transactions: transactions.map(tx => ({
        date: tx.transaction_date,
        category: tx.category,
        description: tx.description,
        amount: tx.amount,
        currency: tx.currency
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        limit: b.limit,
        spent: getSpentForCategory(b.category)
      })),
      goals: goals.map(g => ({
        name: g.name,
        target: g.target,
        current: g.current,
        deadline: format(g.deadline, "yyyy-MM-dd"),
        user1Contrib: g.user1Contrib,
        user2Contrib: g.user2Contrib
      })),
      bills: bills.map(b => ({
        name: b.name,
        amount: b.amount,
        dueDay: b.dueDay,
        category: b.category,
        assignedTo: b.assignedTo
      })),
      settings: {
        currency,
        darkMode,
        notificationPrefs
      },
      milestones: milestones.filter(m => m.achieved).map(m => ({
        title: m.title,
        achievedDate: m.achievedDate ? format(m.achievedDate, "yyyy-MM-dd") : null
      }))
    };

    const jsonContent = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `together-full-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setShowExportData(false);

    // Add notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: "All your data has been exported successfully!",
      isRead: false,
      date: new Date()
    }, ...prev]);
  };

  // Clear all data handler (keeps account)
  const handleClearAllData = () => {
    resetAllFinancialData();
    setShowClearDataConfirm(false);

    // Add notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: "All financial data has been cleared. Starting fresh!",
      isRead: false,
      date: new Date()
    }, ...prev]);
  };

  // Format currency based on preference
  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
      JPY: "¥",
      INR: "₹"
    };
    return `${symbols[currency] || "$"}${amount.toFixed(2)}`;
  };

  // 1. Recurring Bills Management
  const handleAddBill = () => {
    if (!billName || !billAmount || !billCategory) return;

    const newBill = {
      name: billName,
      amount: parseFloat(billAmount),
      dueDay: parseInt(billDueDay),
      assignedTo: billAssignedTo,
      category: billCategory
    };

    setBills(prev => [...prev, newBill]);

    // Add notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "bill" as const,
      message: `New recurring bill added: ${billName} - $${parseFloat(billAmount).toFixed(2)} due on the ${billDueDay}${getOrdinalSuffix(parseInt(billDueDay))}`,
      isRead: false,
      date: new Date()
    }, ...prev]);

    // Check for milestone
    if (bills.length === 0) {
      checkAndAwardMilestone("6"); // Bill Tracker milestone
    }

    // Reset form
    setBillName("");
    setBillAmount("");
    setBillDueDay("1");
    setBillCategory("");
    setBillAssignedTo("shared");
    setShowAddBill(false);
  };

  const handleEditBill = () => {
    if (editingBillIndex === null || !billName || !billAmount || !billCategory) return;

    setBills(prev => prev.map((bill, idx) =>
      idx === editingBillIndex
        ? {
            name: billName,
            amount: parseFloat(billAmount),
            dueDay: parseInt(billDueDay),
            assignedTo: billAssignedTo,
            category: billCategory
          }
        : bill
    ));

    // Reset form
    setBillName("");
    setBillAmount("");
    setBillDueDay("1");
    setBillCategory("");
    setBillAssignedTo("shared");
    setEditingBillIndex(null);
    setShowEditBill(false);
  };

  const handleDeleteBill = (index: number) => {
    setBills(prev => prev.filter((_, idx) => idx !== index));
  };

  const openEditBill = (index: number) => {
    const bill = bills[index];
    setBillName(bill.name);
    setBillAmount(bill.amount.toString());
    setBillDueDay(bill.dueDay.toString());
    setBillCategory(bill.category);
    setBillAssignedTo(bill.assignedTo);
    setEditingBillIndex(index);
    setShowEditBill(true);
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const getUpcomingBills = () => {
    const today = new Date().getDate();
    return bills
      .map(bill => {
        let daysUntil = bill.dueDay - today;
        if (daysUntil < 0) {
          // Bill is next month
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          daysUntil = daysInMonth - today + bill.dueDay;
        }
        return { ...bill, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  // 2. Transaction History Management
  const getFilteredHistoryTransactions = () => {
    const now = new Date();
    return transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);

      // Search filter
      const matchesSearch = historySearchQuery === "" ||
        tx.category.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(historySearchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = historyFilterCategory === "all" || tx.category === historyFilterCategory;

      // Date range filter
      let matchesDateRange = true;
      if (historyDateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDateRange = txDate >= weekAgo;
      } else if (historyDateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDateRange = txDate >= monthAgo;
      } else if (historyDateRange === "year") {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        matchesDateRange = txDate >= yearAgo;
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    }).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || !currentCouple) return;

    try {
      const txOrm = TransactionORM.getInstance();
      await txOrm.deleteTransactionById(transactionToDelete);
      await loadTransactions(currentCouple.id);
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);

      // Add notification
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: "insight" as const,
        message: "Transaction deleted successfully",
        isRead: false,
        date: new Date()
      }, ...prev]);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // 3. Quick Split Calculator
  const calculateQuickSplit = () => {
    const amount = parseFloat(quickSplitAmount) || 0;
    const tipAmount = amount * (quickSplitTip / 100);
    const totalWithTip = amount + tipAmount;

    if (quickSplitMode === "equal") {
      const perPerson = totalWithTip / quickSplitPeople;
      return Array(quickSplitPeople).fill(perPerson);
    } else {
      // Custom percentage split
      return quickSplitCustom.map(pct => (totalWithTip * pct) / 100);
    }
  };

  const handleQuickSplitToExpense = () => {
    const amounts = calculateQuickSplit();
    if (amounts.length >= 2 && currentUser) {
      setTxAmount(amounts[0].toFixed(2));
      setTxDescription(quickSplitNote || "Split expense");
      setTxSplitMode("custom");
      setTxCustomSplit(quickSplitCustom[0].toString());
      setShowQuickSplit(false);
      setShowAddTransaction(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: "Copied to clipboard!",
      isRead: false,
      date: new Date()
    }, ...prev]);
  };

  // 4. Generate Spending Insights (computed inline to avoid circular dependency with categorySpending)
  const generateInsights = useMemo(() => {
    const insights: typeof insightsGenerated = [];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    // Calculate current month spending
    const monthlyTxs = transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear;
    });
    const currentMonthSpending = monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate category spending locally to avoid circular dependency
    const localCategoryTotals: Record<string, number> = {};
    transactions.forEach(tx => {
      localCategoryTotals[tx.category] = (localCategoryTotals[tx.category] || 0) + tx.amount;
    });
    const localCategorySpending = Object.entries(localCategoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Calculate last month spending for comparison
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
    });
    const lastMonthSpending = lastMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);

    // Spending trend insight
    if (lastMonthSpending > 0) {
      const changePercent = ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100;
      if (changePercent > 20) {
        insights.push({
          id: "trend-up",
          type: "warning",
          title: "Spending Increasing",
          message: `Your spending is up ${changePercent.toFixed(0)}% compared to last month. Consider reviewing your expenses.`,
          priority: 1
        });
      } else if (changePercent < -10) {
        insights.push({
          id: "trend-down",
          type: "achievement",
          title: "Great Savings!",
          message: `You've reduced spending by ${Math.abs(changePercent).toFixed(0)}% compared to last month. Keep it up!`,
          priority: 2
        });
      }
    }

    // Budget insights
    budgets.forEach(budget => {
      const spent = getSpentForCategory(budget.category);
      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 90 && percentage < 100) {
        insights.push({
          id: `budget-warn-${budget.category}`,
          type: "warning",
          title: `${budget.category} Budget Alert`,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Only $${(budget.limit - spent).toFixed(2)} remaining.`,
          priority: 1
        });
      } else if (percentage < 50 && spent > 0) {
        insights.push({
          id: `budget-good-${budget.category}`,
          type: "tip",
          title: `${budget.category} On Track`,
          message: `You're doing well! Only ${percentage.toFixed(0)}% of your ${budget.category} budget used so far.`,
          priority: 3
        });
      }
    });

    // Top spending category insight
    if (localCategorySpending.length > 0) {
      const topCategory = localCategorySpending[0];
      const topPercentage = (topCategory[1] / currentMonthSpending) * 100;
      if (topPercentage > 40) {
        insights.push({
          id: "top-category",
          type: "trend",
          title: "Top Spending Category",
          message: `${topCategory[0]} makes up ${topPercentage.toFixed(0)}% of your monthly spending. Consider if this aligns with your priorities.`,
          priority: 2
        });
      }
    }

    // Goals progress insight
    goals.forEach(goal => {
      const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      const daysRemaining = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (progress >= 75 && progress < 100) {
        insights.push({
          id: `goal-close-${goal.id}`,
          type: "achievement",
          title: `Almost There!`,
          message: `Your "${goal.name}" goal is ${progress.toFixed(0)}% complete. Only $${(goal.target - goal.current).toFixed(2)} to go!`,
          priority: 1
        });
      } else if (daysRemaining <= 30 && progress < 50) {
        insights.push({
          id: `goal-behind-${goal.id}`,
          type: "warning",
          title: "Goal Deadline Approaching",
          message: `Your "${goal.name}" goal is due in ${daysRemaining} days but only ${progress.toFixed(0)}% funded. Consider boosting contributions.`,
          priority: 1
        });
      }
    });

    // Bill reminder insight
    const upcomingBills = getUpcomingBills();
    const billsDueSoon = upcomingBills.filter(b => b.daysUntil <= 3);
    if (billsDueSoon.length > 0) {
      insights.push({
        id: "bills-due",
        type: "tip",
        title: "Bills Due Soon",
        message: `${billsDueSoon.length} bill${billsDueSoon.length > 1 ? "s" : ""} due in the next 3 days: ${billsDueSoon.map(b => b.name).join(", ")}`,
        priority: 1
      });
    }

    // Smart saving tip
    if (currentMonthSpending > 0 && goals.length > 0) {
      const avgDailySpending = currentMonthSpending / new Date().getDate();
      const daysRemaining = new Date(thisYear, thisMonth + 1, 0).getDate() - new Date().getDate();
      const projectedMonthlySpending = currentMonthSpending + (avgDailySpending * daysRemaining);
      const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

      if (totalBudget > 0 && projectedMonthlySpending < totalBudget) {
        const potentialSavings = totalBudget - projectedMonthlySpending;
        insights.push({
          id: "potential-savings",
          type: "tip",
          title: "Savings Opportunity",
          message: `At your current pace, you could save an extra $${potentialSavings.toFixed(2)} this month. Consider adding it to a goal!`,
          priority: 2
        });
      }
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }, [transactions, budgets, goals, bills]);

  // 5. Monthly Report Data
  const getMonthlyReportData = () => {
    const monthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate.getMonth() === reportMonth && txDate.getFullYear() === reportYear;
    });

    const totalSpent = monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const categoryBreakdown: Record<string, number> = {};
    monthTxs.forEach(tx => {
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
    });

    const budgetStatus = budgets.map(budget => {
      const spent = monthTxs.filter(tx => tx.category === budget.category).reduce((sum, tx) => sum + tx.amount, 0);
      return {
        category: budget.category,
        limit: budget.limit,
        spent,
        remaining: budget.limit - spent,
        status: spent > budget.limit ? "over" : spent > budget.limit * 0.8 ? "warning" : "good"
      };
    });

    const goalProgress = goals.map(goal => ({
      name: goal.name,
      target: goal.target,
      current: goal.current,
      progress: goal.target > 0 ? (goal.current / goal.target) * 100 : 0
    }));

    return {
      month: new Date(reportYear, reportMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      totalSpent,
      transactionCount: monthTxs.length,
      categoryBreakdown: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]),
      budgetStatus,
      goalProgress,
      topCategory: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0] || ["None", 0],
      avgPerTransaction: monthTxs.length > 0 ? totalSpent / monthTxs.length : 0
    };
  };

  const handleExportMonthlyReport = () => {
    const data = getMonthlyReportData();
    const reportContent = `
TOGETHER - MONTHLY FINANCIAL REPORT
${data.month}
======================================

SUMMARY
-------
Total Spent: $${data.totalSpent.toFixed(2)}
Total Transactions: ${data.transactionCount}
Average per Transaction: $${data.avgPerTransaction.toFixed(2)}
Top Spending Category: ${data.topCategory[0]} ($${(data.topCategory[1] as number).toFixed(2)})

SPENDING BY CATEGORY
--------------------
${data.categoryBreakdown.map(([cat, amount]) => `${cat}: $${(amount as number).toFixed(2)}`).join("\n")}

BUDGET STATUS
-------------
${data.budgetStatus.map(b => `${b.category}: $${b.spent.toFixed(2)} / $${b.limit.toFixed(2)} (${b.status.toUpperCase()})`).join("\n")}

SAVINGS GOALS
-------------
${data.goalProgress.map(g => `${g.name}: $${g.current.toFixed(2)} / $${g.target.toFixed(2)} (${g.progress.toFixed(0)}%)`).join("\n")}

Generated by WeBalance - Love your money, love each other
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webalance-report-${data.month.replace(" ", "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // 6. Partner Notes
  const handleSendNote = () => {
    if (!newNote.trim() || !currentUser) return;

    const note = {
      id: Date.now().toString(),
      from: currentUser.name,
      message: newNote.trim(),
      date: new Date(),
      isRead: false
    };

    setPartnerNotes(prev => [note, ...prev]);
    setNewNote("");

    // Add notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: "insight" as const,
      message: `Message sent to ${partner?.name || "Partner"}`,
      isRead: false,
      date: new Date()
    }, ...prev]);
  };

  // 7. Milestones Check
  const checkAndAwardMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.map(m =>
      m.id === milestoneId && !m.achieved
        ? { ...m, achieved: true, achievedDate: new Date() }
        : m
    ));

    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone && !milestone.achieved) {
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: "goal" as const,
        message: `Milestone achieved: ${milestone.title}! ${milestone.description}`,
        isRead: false,
        date: new Date()
      }, ...prev]);
    }
  };

  // Check milestones based on app state
  useEffect(() => {
    // First expense milestone
    if (transactions.length > 0 && !milestones.find(m => m.id === "1")?.achieved) {
      checkAndAwardMilestone("1");
    }
    // Budget master milestone
    if (budgets.length >= 3 && !milestones.find(m => m.id === "2")?.achieved) {
      checkAndAwardMilestone("2");
    }
    // Goal setter milestone
    if (goals.length > 0 && !milestones.find(m => m.id === "3")?.achieved) {
      checkAndAwardMilestone("3");
    }
    // Savings star milestone
    const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
    if (totalSaved >= 100 && !milestones.find(m => m.id === "4")?.achieved) {
      checkAndAwardMilestone("4");
    }
    // Under budget milestone
    const allUnderBudget = budgets.length > 0 && budgets.every(b => getSpentForCategory(b.category) <= b.limit);
    if (allUnderBudget && new Date().getDate() >= 28 && !milestones.find(m => m.id === "5")?.achieved) {
      checkAndAwardMilestone("5");
    }
  }, [transactions.length, budgets.length, goals]);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      title: "Welcome to WeBalance!",
      description: "Let's take a quick tour to help you and your partner manage finances together. This will only take a minute!",
      icon: Heart,
      highlight: null,
      action: null
    },
    {
      title: "Add Your First Expense",
      description: "Start by adding expenses as they happen. Click 'Add Expense' to record shared purchases. Each expense can be split between you and your partner.",
      icon: Plus,
      highlight: "add-expense",
      action: null
    },
    {
      title: "Set Up Budgets",
      description: "Create monthly budgets for different categories like Food, Entertainment, or Groceries. The app will automatically track your spending against these limits.",
      icon: TrendingUp,
      highlight: "budget-tab",
      action: () => setActiveTab("budget")
    },
    {
      title: "Create Savings Goals",
      description: "Plan for the future together! Create savings goals for vacations, emergency funds, or big purchases. Track contributions from both partners.",
      icon: Target,
      highlight: "goals-tab",
      action: () => setActiveTab("goals")
    },
    {
      title: "Track Recurring Bills",
      description: "Never miss a payment! Set up your recurring bills like rent, utilities, and subscriptions. Get reminders before they're due.",
      icon: Repeat,
      highlight: "bills",
      action: () => setActiveTab("activity")
    },
    {
      title: "Quick Split Calculator",
      description: "Use the split calculator for on-the-spot expense splitting. Add tips, split by percentage, and convert directly to expenses.",
      icon: Calculator,
      highlight: "quick-split",
      action: () => setActiveTab("home")
    },
    {
      title: "Smart Insights",
      description: "Get personalized tips based on your spending patterns. The app analyzes your habits and suggests ways to save more together.",
      icon: Lightbulb,
      highlight: "insights",
      action: () => setActiveTab("activity")
    },
    {
      title: "Monthly Reports",
      description: "Generate detailed monthly reports to review your progress. Export them as files to share or keep for your records.",
      icon: FileText,
      highlight: "reports",
      action: () => setActiveTab("activity")
    },
    {
      title: "Track Your Balance",
      description: "The app automatically calculates who owes whom. Use 'Settle Up' when you want to balance out shared expenses.",
      icon: Wallet,
      highlight: "settle-up",
      action: () => setActiveTab("home")
    },
    {
      title: "Earn Milestones",
      description: "Complete achievements as you use the app! Track your first expense, set up budgets, and reach savings goals to unlock milestones.",
      icon: Star,
      highlight: "milestones",
      action: () => setActiveTab("settings")
    },
    {
      title: "You're All Set!",
      description: "Start by adding your first expense or creating a budget. Everything will calculate automatically - no manual math needed!",
      icon: Sparkles,
      highlight: null,
      action: () => setActiveTab("home")
    }
  ];

  const handleTutorialNext = () => {
    const currentStep = tutorialSteps[tutorialStep];
    if (currentStep.action) {
      currentStep.action();
    }
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      handleTutorialComplete();
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem("together_tutorial_completed", "true");
    setActiveTab("home");

    // For new signups, go to pairing first, then guided mode will show on dashboard
    if (isNewSignup && !currentCouple) {
      setViewMode("pairing");
      setIsNewSignup(false);
    } else {
      // For existing users or after pairing, go to dashboard with guided mode
      setViewMode("dashboard");
      // Start guided mode after tutorial
      if (completedGuidedSteps.size === 0) {
        setShowGuidedMode(true);
        setGuidedStep(0);
      }
    }
  };

  const handleTutorialSkip = () => {
    handleTutorialComplete();
  };

  const restartTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
    setActiveTab("home");
  };

  // Guided mode steps - these are the interactive prompts shown after the tutorial
  const guidedSteps = [
    {
      id: "first-expense",
      title: "Add Your First Expense",
      description: "Start tracking by adding your first shared expense. Click the button below!",
      action: () => setShowAddTransaction(true),
      buttonText: "Add Expense",
      icon: Plus,
      color: "pink"
    },
    {
      id: "first-budget",
      title: "Set Up a Budget",
      description: "Create a monthly spending limit for a category to stay on track.",
      action: () => {
        setActiveTab("budget");
        setTimeout(() => setShowAddBudget(true), 300);
      },
      buttonText: "Create Budget",
      icon: TrendingUp,
      color: "blue"
    },
    {
      id: "first-goal",
      title: "Create a Savings Goal",
      description: "Plan for something special together - a vacation, emergency fund, or big purchase!",
      action: () => {
        setActiveTab("goals");
        setTimeout(() => setShowAddGoal(true), 300);
      },
      buttonText: "Create Goal",
      icon: Target,
      color: "purple"
    }
  ];

  const markGuidedStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedGuidedSteps);
    newCompleted.add(stepId);
    setCompletedGuidedSteps(newCompleted);
    localStorage.setItem("together_guided_steps", JSON.stringify([...newCompleted]));

    // Move to next step or close guided mode
    const currentIndex = guidedSteps.findIndex(s => s.id === stepId);
    if (currentIndex < guidedSteps.length - 1) {
      setGuidedStep(currentIndex + 1);
    } else {
      setShowGuidedMode(false);
      // Show congrats when all steps are done
      setShowCongrats(true);
    }
  };

  const skipGuidedMode = () => {
    setShowGuidedMode(false);
  };

  // Show congratulations modal when all guided steps are completed
  const [showCongrats, setShowCongrats] = useState(false);

  // Exit Menu and Restart Menu state
  const [showExitMenu, setShowExitMenu] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);

  // New Feature States
  // 1. Recurring Bills Management
  const [showAddBill, setShowAddBill] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDay, setBillDueDay] = useState("1");
  const [billCategory, setBillCategory] = useState("");
  const [billAssignedTo, setBillAssignedTo] = useState<"user1" | "user2" | "shared">("shared");
  const [billReminder, setBillReminder] = useState(true);
  const [showEditBill, setShowEditBill] = useState(false);
  const [editingBillIndex, setEditingBillIndex] = useState<number | null>(null);

  // 2. Transaction History Sheet
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyFilterCategory, setHistoryFilterCategory] = useState<string>("all");
  const [historyDateRange, setHistoryDateRange] = useState<"all" | "week" | "month" | "year">("all");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 3. Quick Split Calculator
  const [showQuickSplit, setShowQuickSplit] = useState(false);
  const [quickSplitAmount, setQuickSplitAmount] = useState("");
  const [quickSplitPeople, setQuickSplitPeople] = useState(2);
  const [quickSplitCustom, setQuickSplitCustom] = useState([50, 50]);
  const [quickSplitMode, setQuickSplitMode] = useState<"equal" | "custom" | "percentage">("equal");
  const [quickSplitTip, setQuickSplitTip] = useState(0);
  const [quickSplitNote, setQuickSplitNote] = useState("");

  // 4. Spending Insights
  const [showInsights, setShowInsights] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState<Array<{
    id: string;
    type: "tip" | "warning" | "achievement" | "trend";
    title: string;
    message: string;
    priority: number;
  }>>([]);

  // 5. Monthly Report
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [showShareReport, setShowShareReport] = useState(false);

  // 6. Partner Messages/Notes
  const [partnerNotes, setPartnerNotes] = useState<Array<{
    id: string;
    from: string;
    message: string;
    date: Date;
    isRead: boolean;
  }>>([]);
  const [showPartnerNotes, setShowPartnerNotes] = useState(false);
  const [newNote, setNewNote] = useState("");

  // 7. Financial Milestones
  const [milestones, setMilestones] = useState<Array<{
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    achievedDate?: Date;
    type: "savings" | "budget" | "spending" | "streak";
  }>>([
    { id: "1", title: "First Expense Tracked", description: "Added your first shared expense", achieved: false, type: "spending" },
    { id: "2", title: "Budget Master", description: "Set up 3 budget categories", achieved: false, type: "budget" },
    { id: "3", title: "Goal Setter", description: "Created your first savings goal", achieved: false, type: "savings" },
    { id: "4", title: "Savings Star", description: "Saved $100 towards a goal", achieved: false, type: "savings" },
    { id: "5", title: "Under Budget", description: "Stayed under budget for a full month", achieved: false, type: "budget" },
    { id: "6", title: "Bill Tracker", description: "Set up recurring bills tracking", achieved: false, type: "spending" }
  ]);
  const [showMilestones, setShowMilestones] = useState(false);

  const resetGuidedMode = () => {
    setCompletedGuidedSteps(new Set());
    localStorage.removeItem("together_guided_steps");
    setGuidedStep(0);
    setShowGuidedMode(true);
  };

  // Check if user completed an action that matches a guided step
  useEffect(() => {
    if (showGuidedMode && guidedSteps[guidedStep]) {
      const currentStep = guidedSteps[guidedStep];

      // Check if the action was completed
      if (currentStep.id === "first-expense" && transactions.length > 0 && !completedGuidedSteps.has("first-expense")) {
        markGuidedStepComplete("first-expense");
      } else if (currentStep.id === "first-budget" && budgets.length > 0 && !completedGuidedSteps.has("first-budget")) {
        markGuidedStepComplete("first-budget");
      } else if (currentStep.id === "first-goal" && goals.length > 0 && !completedGuidedSteps.has("first-goal")) {
        markGuidedStepComplete("first-goal");
      }
    }
  }, [transactions.length, budgets.length, goals.length, showGuidedMode, guidedStep]);

  // Loading View - shown while checking for existing user session
  if (viewMode === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
            <Heart className="h-10 w-10 text-white animate-pulse" fill="white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
            WeBalance
          </h1>
          <p className="text-muted-foreground mb-4">Setting up your financial dashboard...</p>
          <div className="flex items-center justify-center gap-1">
            <div className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // Authentication View
  if (viewMode === "auth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              WeBalance
            </CardTitle>
            <CardDescription>Love your money, love each other</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => {
              setIsLogin(v === "login");
              setAuthError("");
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {authError && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError("");
                      }}
                      autoComplete="email"
                      autoFocus
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError("");
                      }}
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {authError && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAuthError("");
                      }}
                      autoComplete="name"
                      autoFocus
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError("");
                      }}
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError("");
                      }}
                      autoComplete="new-password"
                      minLength={6}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tutorial View - Shows tutorial overlay on top of a preview of the app
  if (viewMode === "tutorial") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Preview of dashboard in background (blurred) */}
        <div className="opacity-50 blur-sm pointer-events-none">
          {/* Simplified dashboard preview */}
          <div className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" fill="white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">WeBalance</h1>
                  <p className="text-xs text-muted-foreground">{currentUser?.name} & Partner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview cards */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold text-green-600">100</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-pink-500">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">You Owe</p>
                  <p className="text-2xl font-bold text-pink-600">$0.00</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">$0.00</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="text-2xl font-bold text-purple-600">$0</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Financial Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green-600 mb-4">100</div>
                  <Progress value={100} className="h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-pink-600" />
                    Balance with Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-pink-600">$0.00</p>
                  <p className="text-sm text-muted-foreground">All balanced up!</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom nav preview */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-5 gap-2 py-2">
                {[Home, TrendingUp, Target, Activity, Settings].map((Icon, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 py-2">
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{["Home", "Budget", "Goals", "Activity", "Settings"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Overlay - defined at the end of the component */}
        {showTutorial && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center gap-1.5 mb-4">
                    {tutorialSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          idx === tutorialStep
                            ? "w-6 bg-gradient-to-r from-pink-500 to-purple-600"
                            : idx < tutorialStep
                            ? "w-1.5 bg-pink-300"
                            : "w-1.5 bg-gray-200"
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center",
                      tutorialStep === 0 || tutorialStep === tutorialSteps.length - 1
                        ? "bg-gradient-to-br from-pink-400 to-purple-500"
                        : "bg-gradient-to-br from-blue-400 to-purple-500"
                    )}>
                      {(() => {
                        const IconComponent = tutorialSteps[tutorialStep].icon;
                        return <IconComponent className="h-8 w-8 text-white" />;
                      })()}
                    </div>
                  </div>

                  <CardTitle className="text-xl">
                    {tutorialSteps[tutorialStep].title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {tutorialSteps[tutorialStep].description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  {tutorialStep === 1 && (
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 text-sm">
                      <p className="font-medium text-pink-700 mb-2">Quick Tip:</p>
                      <ul className="list-disc list-inside text-pink-600 space-y-1">
                        <li>Choose between 50/50 split, income-based, or custom %</li>
                        <li>Add a description to remember what it was for</li>
                        <li>Mark as private if you don't want to share it</li>
                      </ul>
                    </div>
                  )}

                  {tutorialStep === 2 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                      <p className="font-medium text-blue-700 mb-2">Budget Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Food & Dining", "Groceries", "Entertainment", "Transportation"].map(cat => (
                          <Badge key={cat} variant="secondary" className="bg-blue-100 text-blue-700">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tutorialStep === 3 && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                      <p className="font-medium text-purple-700 mb-2">Goal Ideas:</p>
                      <ul className="list-disc list-inside text-purple-600 space-y-1">
                        <li>Vacation Fund</li>
                        <li>Emergency Savings</li>
                        <li>New Car / Home Down Payment</li>
                        <li>Wedding Fund</li>
                      </ul>
                    </div>
                  )}

                  {tutorialStep === 4 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm">
                      <p className="font-medium text-green-700 mb-2">Auto-Calculations:</p>
                      <p className="text-green-600">
                        The app tracks who paid for what and calculates the balance automatically.
                        No need to do any math!
                      </p>
                    </div>
                  )}

                  {tutorialStep === tutorialSteps.length - 1 && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 text-sm">
                      <p className="font-medium text-purple-700 mb-2">Getting Started:</p>
                      <div className="space-y-2 text-purple-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>All values start at $0.00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Add expenses as you spend</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Everything updates automatically</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="px-6 pb-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    {tutorialStep > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTutorialPrev}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {tutorialStep < tutorialSteps.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTutorialSkip}
                      >
                        Skip Tutorial
                      </Button>
                    )}
                    <Button
                      onClick={handleTutorialNext}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {tutorialStep === tutorialSteps.length - 1 ? (
                        <>
                          Get Started
                          <Sparkles className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Onboarding View
  if (viewMode === "onboarding") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle>Welcome to WeBalance! 🎉</CardTitle>
            <CardDescription>Let's get you set up with your partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Account Created
                </h3>
                <p className="text-sm text-muted-foreground">Your account is ready to go!</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Next Step: Pair with Your Partner
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Share finances together by creating or joining a couple account
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                  onClick={() => setViewMode("pairing")}
                >
                  Continue to Pairing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pairing View
  if (viewMode === "pairing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle>Connect with Your Partner</CardTitle>
            <CardDescription>Create or join a shared money account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Account</TabsTrigger>
                <TabsTrigger value="join">Join Partner</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <h3 className="font-semibold mb-2">Start a Couple Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a unique code to share with your partner
                  </p>

                  {generatedCode ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-lg border-2 border-dashed border-pink-300 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Your Pairing Code</p>
                        <p className="text-3xl font-bold tracking-wider text-pink-600">{generatedCode}</p>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Share this code with your partner so they can join
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setViewMode("dashboard");
                          // Start guided mode if not completed
                          if (completedGuidedSteps.size < guidedSteps.length) {
                            setShowGuidedMode(true);
                            const firstIncompleteIndex = guidedSteps.findIndex(s => !completedGuidedSteps.has(s.id));
                            setGuidedStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
                          }
                        }}
                      >
                        Continue to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                      onClick={handleCreateCouple}
                    >
                      Generate Pairing Code
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="pairing-code">Enter Pairing Code</Label>
                  <Input
                    id="pairing-code"
                    placeholder="ABC123"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                    className="text-center text-lg tracking-wider"
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                    onClick={handleJoinCouple}
                    disabled={pairingCode.length < 6}
                  >
                    Join Partner's Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard View
  const healthScore = calculateHealthScore();
  const balance = calculateBalance();
  const monthlySpending = getTotalMonthlySpending();
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const filteredTransactions = getFilteredTransactions();
  const categorySpending = getCategorySpending();

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-200",
      darkMode
        ? "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
        : "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b sticky top-0 z-10 transition-colors duration-200",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className={cn("font-bold text-lg", darkMode && "text-white")}>WeBalance</h1>
              <p className={cn("text-xs", darkMode ? "text-gray-400" : "text-muted-foreground")}>
                {currentUser?.name} & {partner?.name || "Partner"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Main Menu Button */}
            <DropdownMenu open={showMainMenu} onOpenChange={setShowMainMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open main menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-sm font-semibold">Main Menu</p>
                </div>
                <DropdownMenuItem onClick={restartTutorial}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  View Tutorial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowRestartConfirm(true)}
                  className="text-orange-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart / Reset Data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowExitMenu(true)}
                  className="text-red-600"
                >
                  <Power className="h-4 w-4 mr-2" />
                  Exit / Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="max-h-[400px]">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start p-3 cursor-pointer",
                          !notification.isRead && "bg-blue-50"
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            notification.type === "insight" && "bg-green-100",
                            notification.type === "goal" && "bg-purple-100",
                            notification.type === "overspending" && "bg-red-100",
                            notification.type === "bill" && "bg-yellow-100"
                          )}>
                            {notification.type === "insight" && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {notification.type === "goal" && <Target className="h-4 w-4 text-purple-600" />}
                            {notification.type === "overspending" && <AlertCircle className="h-4 w-4 text-red-600" />}
                            {notification.type === "bill" && <CreditCard className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(notification.date, "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
{isPremium ? (
              <Link to="/premium">
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </Link>
            ) : (
              <Link to="/premium">
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  darkMode && "text-white"
                )}>
                  Welcome back, {currentUser?.name?.split(" ")[0]}!
                </h2>
                <p className={cn(
                  "text-muted-foreground",
                  darkMode && "text-gray-400"
                )}>
                  Here's your financial overview
                </p>
              </div>
              <Button
                onClick={() => setShowAddTransaction(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                aria-label="Add new transaction"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={cn(
                "border-l-4 border-l-green-500",
                darkMode && "bg-gray-800 border-gray-700"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                        darkMode && "text-gray-400"
                      )}>
                        Health Score
                      </p>
                      <p className="text-2xl font-bold text-green-600">{healthScore}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-l-4 border-l-pink-500",
                darkMode && "bg-gray-800 border-gray-700"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                        darkMode && "text-gray-400"
                      )}>
                        You Owe
                      </p>
                      <p className="text-2xl font-bold text-pink-600">${balance.user2Owes.toFixed(2)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-l-4 border-l-blue-500",
                darkMode && "bg-gray-800 border-gray-700"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                        darkMode && "text-gray-400"
                      )}>
                        This Month
                      </p>
                      <p className="text-2xl font-bold text-blue-600">${monthlySpending.toFixed(2)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-l-4 border-l-purple-500",
                darkMode && "bg-gray-800 border-gray-700"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                        darkMode && "text-gray-400"
                      )}>
                        Savings
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${goals.reduce((sum, g) => sum + g.current, 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <PiggyBank className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className={cn(
              "bg-gradient-to-br from-pink-50/50 to-purple-50/50",
              darkMode && "bg-gray-800/50 border-gray-700"
            )}>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-pink-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowAddTransaction(true)}
                    aria-label="Add expense"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Add Expense</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowQuickSplit(true)}
                    aria-label="Quick split calculator"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Split</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-purple-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowSettleBalance(true)}
                    aria-label="Settle balance"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Settle Up</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowTransactionHistory(true)}
                    aria-label="View history"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>History</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-orange-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowAddBill(true)}
                    aria-label="Add recurring bill"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Repeat className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Add Bill</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-yellow-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowInsights(true)}
                    aria-label="View insights"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Insights</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-indigo-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowMonthlyReport(true)}
                    aria-label="Monthly report"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Report</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center gap-2 h-auto py-4 hover:bg-amber-100/50",
                      darkMode && "hover:bg-gray-700"
                    )}
                    onClick={() => setShowMilestones(true)}
                    aria-label="View milestones"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <span className={cn("text-xs font-medium", darkMode && "text-gray-300")}>Milestones</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Health Score Card */}
                <Card className={cn(
                  "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden relative",
                  darkMode && "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800"
                )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-10 -mt-10" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-green-600" />
                      Financial Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-4 mb-4">
                      <div className="text-5xl font-bold text-green-600">{healthScore}</div>
                      <div className="pb-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                          {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={healthScore} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className={darkMode ? "text-gray-300" : ""}>Budget on track</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className={darkMode ? "text-gray-300" : ""}>Goals progressing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Overview */}
                <Card className={cn(darkMode && "bg-gray-800 border-gray-700")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-lg flex items-center gap-2", darkMode && "text-white")}>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Budget Overview
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("budget")}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgets.slice(0, 3).map((budget) => {
                        const spent = getSpentForCategory(budget.category);
                        const percentage = Math.min((spent / budget.limit) * 100, 100);
                        const isOverspent = spent > budget.limit;
                        return (
                          <div key={budget.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className={cn("font-medium", darkMode && "text-gray-200")}>{budget.category}</span>
                              <span className={cn(
                                "font-medium",
                                isOverspent ? "text-red-600" : darkMode ? "text-gray-300" : "text-muted-foreground"
                              )}>
                                ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={percentage}
                                className={cn("h-2", isOverspent && "bg-red-100")}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Bills */}
                <Card className={cn(darkMode && "bg-gray-800 border-gray-700")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={cn("text-lg flex items-center gap-2", darkMode && "text-white")}>
                      <CalendarIcon className="h-5 w-5 text-orange-500" />
                      Upcoming Bills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bills.slice(0, 3).map((bill, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            darkMode ? "bg-gray-700/50" : "bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center",
                              darkMode ? "bg-gray-600" : "bg-white border"
                            )}>
                              <CreditCard className={cn(
                                "h-5 w-5",
                                darkMode ? "text-gray-300" : "text-gray-600"
                              )} />
                            </div>
                            <div>
                              <p className={cn("font-medium text-sm", darkMode && "text-gray-200")}>{bill.name}</p>
                              <p className={cn(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-muted-foreground"
                              )}>
                                Due on the {bill.dueDay}{bill.dueDay === 1 ? "st" : bill.dueDay === 2 ? "nd" : bill.dueDay === 3 ? "rd" : "th"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-bold text-sm", darkMode && "text-gray-200")}>${bill.amount.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {bill.assignedTo === "shared" ? "Shared" : bill.assignedTo === "user1" ? "You" : partner?.name || "Partner"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Balance Card */}
                <Card className={cn(
                  "bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 overflow-hidden relative",
                  darkMode && "bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-800"
                )}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-200/30 rounded-full -mr-8 -mt-8" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wallet className="h-5 w-5 text-pink-600" />
                      Balance with {partner?.name || "Partner"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn(
                            "text-sm",
                            darkMode ? "text-gray-400" : "text-muted-foreground"
                          )}>
                            You owe
                          </p>
                          <p className="text-3xl font-bold text-pink-600">
                            ${balance.user2Owes.toFixed(2)}
                          </p>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center">
                          <ArrowUpRight className="h-7 w-7 text-pink-500" />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        onClick={() => setShowSettleBalance(true)}
                        aria-label="Settle balance with partner"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Settle Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Goals Progress */}
                <Card className={cn(darkMode && "bg-gray-800 border-gray-700")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-lg flex items-center gap-2", darkMode && "text-white")}>
                        <Target className="h-5 w-5 text-purple-500" />
                        Savings Goals
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("goals")}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {goals.length === 0 ? (
                        <div className={cn(
                          "text-center py-6",
                          darkMode ? "text-gray-400" : "text-muted-foreground"
                        )}>
                          <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                            <PiggyBank className="h-6 w-6 text-purple-400" />
                          </div>
                          <p className="text-sm font-medium">No savings goals yet</p>
                          <p className="text-xs mt-1 opacity-75">Start saving for something special together!</p>
                        </div>
                      ) : (
                        goals.slice(0, 2).map((goal) => {
                          const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                          return (
                            <div
                              key={goal.id}
                              className={cn(
                                "p-4 rounded-lg",
                                darkMode ? "bg-gray-700/50" : "bg-purple-50/50"
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <PiggyBank className="h-4 w-4 text-purple-500" />
                                  <span className={cn("font-medium text-sm", darkMode && "text-gray-200")}>
                                    {goal.name}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                                  {percentage.toFixed(0)}%
                                </Badge>
                              </div>
                              <Progress value={percentage} className="h-2 mb-2" />
                              <div className="flex justify-between text-xs">
                                <span className="text-green-600 font-medium">
                                  ${goal.current.toFixed(0)} saved
                                </span>
                                <span className={darkMode ? "text-gray-400" : "text-muted-foreground"}>
                                  of ${goal.target.toFixed(0)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowAddGoal(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Goal
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className={cn(darkMode && "bg-gray-800 border-gray-700")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-lg flex items-center gap-2", darkMode && "text-white")}>
                        <Activity className="h-5 w-5 text-blue-500" />
                        Recent Activity
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("activity")}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTransactions.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            darkMode ? "bg-gray-700/50" : "bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center",
                              darkMode ? "bg-purple-900/50" : "bg-purple-100"
                            )}>
                              <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className={cn("font-medium text-sm", darkMode && "text-gray-200")}>
                                {tx.category}
                              </p>
                              <p className={cn(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-muted-foreground"
                              )}>
                                {format(new Date(tx.transaction_date), "MMM d")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-red-600">-${tx.amount.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">50/50</Badge>
                          </div>
                        </div>
                      ))}

                      {transactions.length === 0 && (
                        <div className={cn(
                          "text-center py-8",
                          darkMode ? "text-gray-400" : "text-muted-foreground"
                        )}>
                          <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <DollarSign className="h-7 w-7 text-purple-400" />
                          </div>
                          <p className="font-medium">No transactions yet</p>
                          <p className="text-sm mt-1 mb-4">Add your first expense to start tracking!</p>
                          <Button
                            size="sm"
                            onClick={() => setShowAddTransaction(true)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Expense
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Insights Card */}
            {notifications.filter(n => n.type === "insight").length > 0 && (
              <Card className={cn(
                "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200",
                darkMode && "bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold mb-1", darkMode && "text-white")}>Weekly Insight</h3>
                      <p className={darkMode ? "text-gray-300" : "text-muted-foreground"}>
                        {notifications.find(n => n.type === "insight")?.message || "Keep tracking to get personalized insights!"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Monthly Budgets</h2>
                <p className="text-muted-foreground">Track spending by category - updates automatically!</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddTransaction(true)}
                  variant="outline"
                  aria-label="Add expense"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
                <Button
                  onClick={() => setShowAddBudget(true)}
                  aria-label="Add new budget"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Budget
                </Button>
              </div>
            </div>

            {/* Budget Summary - Auto-calculated */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${budgets.reduce((sum, b) => sum + b.limit, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${budgets.reduce((sum, b) => sum + getSpentForCategory(b.category), 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budgets.reduce((sum, b) => sum + b.limit, 0) - budgets.reduce((sum, b) => sum + getSpentForCategory(b.category), 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}>
                      ${(budgets.reduce((sum, b) => sum + b.limit, 0) - budgets.reduce((sum, b) => sum + getSpentForCategory(b.category), 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {budgets.map((budget) => {
                const spent = getSpentForCategory(budget.category);
                const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                const isOverspent = percentage > 100;
                const remaining = budget.limit - spent;

                return (
                  <Card key={budget.category}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                        <Badge variant={isOverspent ? "destructive" : "secondary"}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={cn("h-3", isOverspent && "bg-red-100")}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${spent.toFixed(2)} spent
                          </span>
                          <span className="font-medium">
                            of ${budget.limit.toFixed(2)}
                          </span>
                        </div>
                        {isOverspent ? (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              You've exceeded your budget by ${Math.abs(remaining).toFixed(2)}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="text-sm text-green-600 font-medium">
                            ${remaining.toFixed(2)} remaining this month
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {!isPremium && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    Unlock Premium Budgeting
                  </CardTitle>
                  <CardDescription>
                    Get unlimited budgets, smart alerts, and category insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/premium">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600">
                      Upgrade to Premium - $4.99/mo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Savings Goals</h2>
                <p className="text-muted-foreground">Build your future together</p>
              </div>
              <Button
                onClick={() => setShowAddGoal(true)}
                aria-label="Create new savings goal"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Goal
              </Button>
            </div>

            {/* Total Savings Summary */}
            {goals.length > 0 && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${goals.reduce((sum, g) => sum + g.current, 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Target</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${goals.reduce((sum, g) => sum + g.target, 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${goals.reduce((sum, g) => sum + (g.target - g.current), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {goals.length === 0 ? (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <PiggyBank className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Savings Goals Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your future together by creating your first savings goal.
                    </p>
                    <Button
                      onClick={() => setShowAddGoal(true)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                goals.map((goal) => {
                  const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                  const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <Card key={goal.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PiggyBank className="h-5 w-5 text-pink-500" />
                            {goal.name}
                          </CardTitle>
                          <Badge variant="secondary">
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                        <CardDescription>
                          Target: ${goal.target.toFixed(2)} by {format(goal.deadline, "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Progress value={percentage} className="h-3" />

                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-green-600">
                              ${goal.current.toFixed(2)} saved
                            </span>
                            <span className="text-muted-foreground">
                              ${(goal.target - goal.current).toFixed(2)} to go
                            </span>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-muted-foreground mb-1">
                                {currentUser?.name}'s contributions
                              </p>
                              <p className="font-bold text-blue-600">
                                ${goal.user1Contrib.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-muted-foreground mb-1">
                                {partner?.name || "Partner"}'s contributions
                              </p>
                              <p className="font-bold text-purple-600">
                                ${goal.user2Contrib.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {daysUntilDeadline > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span>{daysUntilDeadline} days remaining</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setShowAddContribution(true);
                            }}
                            aria-label={`Add contribution to ${goal.name}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Contribution
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Activity & Insights</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddTransaction(true)}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCharts(!showCharts)}
                  aria-label={showCharts ? "Hide charts" : "Show charts"}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {showCharts ? "Hide" : "Charts"}
                </Button>
              </div>
            </div>

            {/* Auto-Calculated Monthly Summary */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Monthly Summary (Auto-Calculated)
                </CardTitle>
                <CardDescription>
                  All numbers update automatically as you add transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600">${monthlySpending.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{transactions.filter(tx => {
                      const txDate = new Date(tx.transaction_date);
                      return txDate.getMonth() === new Date().getMonth() && txDate.getFullYear() === new Date().getFullYear();
                    }).length} transactions</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Budgets</p>
                    <p className="text-2xl font-bold text-blue-600">${budgets.reduce((sum, b) => sum + b.limit, 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{budgets.length} categories</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Budget Left</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budgets.reduce((sum, b) => sum + b.limit, 0) - monthlySpending >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      ${(budgets.reduce((sum, b) => sum + b.limit, 0) - monthlySpending).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgets.reduce((sum, b) => sum + b.limit, 0) > 0
                        ? `${Math.round((monthlySpending / budgets.reduce((sum, b) => sum + b.limit, 0)) * 100)}% used`
                        : "No budget set"}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Daily Average</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${transactions.length > 0 ? (monthlySpending / Math.max(1, new Date().getDate())).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Day {new Date().getDate()} of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spending Charts */}
            {showCharts && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Spending Breakdown
                  </CardTitle>
                  <CardDescription>Top 5 categories this month (auto-calculated)</CardDescription>
                </CardHeader>
                <CardContent>
                  {categorySpending.length > 0 ? (
                    <div className="space-y-4">
                      {categorySpending.map(([category, amount], idx) => {
                        const percentage = monthlySpending > 0 ? (amount / monthlySpending) * 100 : 0;
                        const colors = [
                          "bg-pink-500",
                          "bg-purple-500",
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-orange-500"
                        ];
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{category}</span>
                              <span className="text-muted-foreground">
                                ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={cn("h-3 rounded-full", colors[idx])}
                                style={{ width: `${percentage}%` }}
                                role="progressbar"
                                aria-valuenow={percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${category}: ${percentage.toFixed(1)}%`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No spending data yet</p>
                      <p className="text-sm">Add transactions to see your breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        notification.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                          notification.type === "insight" && "bg-green-100",
                          notification.type === "goal" && "bg-purple-100",
                          notification.type === "overspending" && "bg-red-100",
                          notification.type === "bill" && "bg-yellow-100"
                        )}>
                          {notification.type === "insight" && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {notification.type === "goal" && <Target className="h-4 w-4 text-purple-600" />}
                          {notification.type === "overspending" && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {notification.type === "bill" && <CreditCard className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(notification.date, "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Bills */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-orange-600" />
                    Upcoming Bills
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddBill(true)}
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Bill
                  </Button>
                </div>
                <CardDescription>
                  Track recurring payments and never miss a due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bills.length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingBills().map((bill, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          bill.daysUntil <= 3 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            bill.daysUntil <= 3 ? "bg-red-100" : "bg-orange-100"
                          )}>
                            {bill.daysUntil <= 3 ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <CalendarIcon className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{bill.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {bill.daysUntil === 0
                                ? "Due today!"
                                : bill.daysUntil === 1
                                ? "Due tomorrow"
                                : `Due in ${bill.daysUntil} days`} • {bill.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold text-lg">${bill.amount.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {bill.assignedTo === "shared" ? "Shared" : bill.assignedTo === "user1" ? "Me" : "Partner"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditBill(idx)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteBill(idx)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}

                    {/* Monthly Total */}
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-muted-foreground">Monthly Total</span>
                        <span className="text-xl font-bold text-orange-600">
                          ${bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Repeat className="h-12 w-12 mx-auto mb-2 text-orange-300" />
                    <p className="text-muted-foreground mb-3">No recurring bills added yet</p>
                    <Button
                      onClick={() => setShowAddBill(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Bill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Access Buttons for New Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300"
                onClick={() => setShowInsights(true)}
              >
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                <span>Smart Insights</span>
                {generateInsights.length > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {generateInsights.length} tips
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => setShowMonthlyReport(true)}
              >
                <FileText className="h-6 w-6 text-purple-600" />
                <span>Monthly Report</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => setShowTransactionHistory(true)}
              >
                <Receipt className="h-6 w-6 text-blue-600" />
                <span>All Transactions</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {transactions.length}
                </Badge>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => setShowQuickSplit(true)}
              >
                <Calculator className="h-6 w-6 text-green-600" />
                <span>Split Calculator</span>
              </Button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            {/* Subscription Card */}
            <Card className={cn(
              isPremium
                ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200"
                : "border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isPremium && <Crown className="h-5 w-5 text-orange-500" />}
                  {isPremium ? "Premium Membership" : "Free Plan"}
                </CardTitle>
                <CardDescription>
                  {isPremium
                    ? "You have access to all premium features"
                    : "Upgrade to unlock all features"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Basic expense tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>1 shared wallet</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>1 savings goal</span>
                    </div>

                    {isPremium && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Unlimited budgets & goals</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Smart expense splitting</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Bill tracking & reminders</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Financial health score</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Monthly couple reports</span>
                        </div>
                      </>
                    )}

                    {!isPremium && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Unlimited budgets & goals</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Smart expense splitting</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Bill tracking & reminders</span>
                        </div>
                      </>
                    )}
                  </div>

                  {!isPremium && (
                    <Link to="/premium">
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600">
                        Upgrade to Premium - $4.99/month
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Settings</CardTitle>
                  {showProfileSaved && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingProfile ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Your Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                        disabled={!editName.trim()}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <div className="flex items-center gap-2">
                        <Input value={currentUser?.name || ""} disabled className="flex-1" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditName(currentUser?.name || "");
                            setEditEmail(currentUser?.email || "");
                            setEditingProfile(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={currentUser?.email || ""} disabled />
                    </div>
                  </>
                )}
                <Separator />
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Currency preference is saved automatically</p>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Use dark theme for the app</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Budget Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when approaching budget limits</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.budgetAlerts}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, budgetAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Goal Progress</p>
                    <p className="text-xs text-muted-foreground">Updates on savings goal milestones</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.goalProgress}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, goalProgress: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Bill Reminders</p>
                    <p className="text-xs text-muted-foreground">Reminders before bills are due</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.billReminders}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, billReminders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Weekly Insights</p>
                    <p className="text-xs text-muted-foreground">Weekly spending summaries and tips</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.weeklyInsights}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, weeklyInsights: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Partner Activity</p>
                    <p className="text-xs text-muted-foreground">When your partner adds expenses or contributions</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.partnerActivity}
                    onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, partnerActivity: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or manage your financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowExportData(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Transactions (CSV)
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowClearDataConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Financial Data
                </Button>
              </CardContent>
            </Card>

            {/* Partner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Partner Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-purple-500 text-white">
                      {partner?.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{partner?.name || "Partner"}</p>
                    <p className="text-sm text-muted-foreground">{partner?.email || "Not connected"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Tutorial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Help & Tutorial
                </CardTitle>
                <CardDescription>
                  Need a refresher on how to use the app?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-muted-foreground mb-3">
                    Watch the step-by-step tutorial again to learn about all the features.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={restartTutorial}
                      variant="outline"
                      className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Restart Full Tutorial
                    </Button>
                    <Button
                      onClick={resetGuidedMode}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Restart Guided Setup
                    </Button>
                  </div>
                </div>

                {/* Guided Steps Progress */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-3 text-sm">Getting Started Progress</h4>
                  <div className="space-y-2">
                    {guidedSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                          completedGuidedSteps.has(step.id)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        )}>
                          {completedGuidedSteps.has(step.id) ? (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm",
                          completedGuidedSteps.has(step.id)
                            ? "text-green-700 line-through"
                            : "text-muted-foreground"
                        )}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  {completedGuidedSteps.size === guidedSteps.length && (
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        All getting started steps completed!
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium mb-2">Quick Tips:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>All calculations happen automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Add expenses as they happen to track spending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Set budgets to get alerts when nearing limits</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Milestones Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Milestones
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMilestones(true)}
                    className="border-yellow-300 hover:bg-yellow-100"
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Track your financial achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.slice(0, 3).map(milestone => (
                    <div
                      key={milestone.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        milestone.achieved ? "bg-yellow-100" : "bg-white"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        milestone.achieved
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : "bg-gray-200"
                      )}>
                        {milestone.achieved ? (
                          <Star className="h-4 w-4 text-white" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !milestone.achieved && "text-muted-foreground"
                        )}>
                          {milestone.title}
                        </p>
                      </div>
                      {milestone.achieved && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {milestones.filter(m => m.achieved).length}/{milestones.length}
                    </span>
                  </div>
                  <Progress
                    value={(milestones.filter(m => m.achieved).length / milestones.length) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sign Out Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-5 gap-2 py-2">
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                activeTab === "home" && "text-pink-600"
              )}
              onClick={() => setActiveTab("home")}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                activeTab === "budget" && "text-pink-600"
              )}
              onClick={() => setActiveTab("budget")}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Budget</span>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                activeTab === "goals" && "text-pink-600"
              )}
              onClick={() => setActiveTab("goals")}
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Goals</span>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                activeTab === "activity" && "text-pink-600"
              )}
              onClick={() => setActiveTab("activity")}
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">Activity</span>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                activeTab === "settings" && "text-pink-600"
              )}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Settle Balance Dialog */}
      <Dialog open={showSettleBalance} onOpenChange={setShowSettleBalance}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Balance</DialogTitle>
            <DialogDescription>
              Pay ${balance.user2Owes.toFixed(2)} to {partner?.name || "your partner"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will initiate a payment to settle your current balance. In a real app, you would be redirected to your payment processor.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Amount to pay</span>
                <span className="text-2xl font-bold text-pink-600">
                  ${balance.user2Owes.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium">{partner?.name || "Partner"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettleBalance(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSettleBalance}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog */}
      <Dialog open={showAddContribution} onOpenChange={setShowAddContribution}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Contribute to {goals.find(g => g.id === selectedGoalId)?.name || "your savings goal"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contribution-amount">Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  id="contribution-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="text-2xl font-bold"
                  aria-label="Contribution amount"
                />
              </div>
            </div>

            {selectedGoalId && goals.find(g => g.id === selectedGoalId) && (() => {
              const goal = goals.find(g => g.id === selectedGoalId)!;
              const currentProgress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              const contributionValue = parseFloat(contributionAmount) || 0;
              const newTotal = goal.current + contributionValue;
              const newProgress = goal.target > 0 ? (newTotal / goal.target) * 100 : 0;
              const remaining = Math.max(0, goal.target - newTotal);

              return (
                <div className="space-y-4">
                  {/* Current Progress */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium mb-2">Current Progress</div>
                    <Progress value={currentProgress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">${goal.current.toFixed(2)} saved</span>
                      <span className="text-muted-foreground">of ${goal.target.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentProgress.toFixed(0)}% complete
                    </div>
                  </div>

                  {/* After Contribution Preview */}
                  {contributionValue > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        After This Contribution
                      </div>
                      <Progress value={Math.min(newProgress, 100)} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-bold">${newTotal.toFixed(2)} total</span>
                        <span className="text-muted-foreground">{newProgress.toFixed(0)}% complete</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ${remaining.toFixed(2)} remaining to reach goal
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContribution(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddContribution}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
            >
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Budget Dialog */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>Set a spending limit for a category</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                <SelectTrigger id="budget-category" aria-label="Select budget category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(cat => !budgets.find(b => b.category === cat)).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-limit">Monthly Limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  id="budget-limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="text-2xl font-bold"
                  aria-label="Budget limit amount"
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll receive notifications when you approach or exceed this limit.
              </AlertDescription>
            </Alert>

            {/* Budget Preview - Auto-calculated */}
            {budgetCategory && budgetLimit && parseFloat(budgetLimit) > 0 && (() => {
              const limit = parseFloat(budgetLimit);
              const alreadySpent = getSpentForCategory(budgetCategory);
              const percentage = limit > 0 ? (alreadySpent / limit) * 100 : 0;
              const remaining = limit - alreadySpent;
              const dailyBudget = limit / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
              const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

              return (
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Budget Preview (Auto-Calculated)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <span className="font-medium">{budgetCategory}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Limit</span>
                        <span className="font-bold text-blue-600">${limit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Already Spent</span>
                        <span className={cn("font-medium", alreadySpent > 0 ? "text-red-600" : "text-green-600")}>
                          ${alreadySpent.toFixed(2)}
                        </span>
                      </div>
                      {alreadySpent > 0 && (
                        <>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Remaining</span>
                            <span className={cn("font-bold", remaining >= 0 ? "text-green-600" : "text-red-600")}>
                              ${remaining.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Daily Budget</span>
                        <span className="font-medium text-purple-600">${dailyBudget.toFixed(2)}/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Weekly Budget</span>
                        <span className="font-medium text-purple-600">${(limit / 4).toFixed(2)}/week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBudget(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddBudgetSubmit}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!budgetCategory || !budgetLimit || parseFloat(budgetLimit) <= 0}
            >
              Create Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
            <DialogDescription>Set a new goal to save for together</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Vacation, New Car, Emergency Fund"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                aria-label="Goal name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-target">Target Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  id="goal-target"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="text-2xl font-bold"
                  aria-label="Target amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(goalDeadline, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={goalDeadline}
                    onSelect={(date) => date && setGoalDeadline(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Goal Preview */}
            {goalName && goalTarget && parseFloat(goalTarget) > 0 && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    Goal Preview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Goal Name</span>
                      <span className="font-medium">{goalName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Amount</span>
                      <span className="font-bold text-purple-600">${parseFloat(goalTarget).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Date</span>
                      <span className="font-medium">{format(goalDeadline, "MMM d, yyyy")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days Until Goal</span>
                      <span className="font-medium">
                        {Math.max(0, Math.ceil((goalDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                      </span>
                    </div>
                    {Math.ceil((goalDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Savings Needed</span>
                        <span className="font-bold text-green-600">
                          ${(parseFloat(goalTarget) / Math.max(1, Math.ceil((goalDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))).toFixed(2)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGoalSubmit}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!goalName || !goalTarget || parseFloat(goalTarget) <= 0}
            >
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-pink-500" />
              Add Expense
            </DialogTitle>
            <DialogDescription>
              Just enter the amount - we'll handle all the math for you!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Step 1: Amount - The only required number! */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tx-amount" className="text-base font-semibold">
                  How much did you spend?
                </Label>
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-200">
                <span className="text-3xl text-pink-600">$</span>
                <Input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="text-3xl font-bold border-0 bg-transparent focus-visible:ring-0 p-0"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the total amount paid. We'll calculate the split automatically.
              </p>
            </div>

            {/* Step 2: Category - With visual icons */}
            <div className="space-y-2">
              <Label htmlFor="tx-category" className="text-base font-semibold">
                What was it for?
              </Label>
              <Select value={txCategory} onValueChange={setTxCategory}>
                <SelectTrigger id="tx-category" className="h-12">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.label} className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Description - Optional */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tx-description">Add a note (optional)</Label>
              </div>
              <Input
                id="tx-description"
                placeholder="e.g., Dinner at Mario's, Gas for road trip..."
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
              />
            </div>

            {/* Step 4: Date - Defaults to today */}
            <div className="space-y-2">
              <Label>When did you pay?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(txDate, "EEEE, MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={txDate}
                    onSelect={(date) => date && setTxDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Step 5: Split Mode - With clear explanations */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">How should we split it?</Label>
              <div className="grid grid-cols-2 gap-2">
                {SPLIT_MODES.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    variant={txSplitMode === mode.value ? "default" : "outline"}
                    className={cn(
                      "h-auto py-3 px-4 justify-start",
                      txSplitMode === mode.value && "bg-gradient-to-r from-pink-500 to-purple-600"
                    )}
                    onClick={() => setTxSplitMode(mode.value)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{mode.label}</div>
                      <div className="text-xs opacity-80">
                        {mode.value === "50-50" && "Each pays half"}
                        {mode.value === "income-based" && "Based on earnings"}
                        {mode.value === "custom" && "You choose %"}
                        {mode.value === "one-person" && "I'll cover this"}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {txSplitMode === "custom" && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <Label>Your share: {txCustomSplit}%</Label>
                  <Label>Partner: {100 - parseFloat(txCustomSplit || "0")}%</Label>
                </div>
                <Slider
                  value={[parseFloat(txCustomSplit) || 50]}
                  onValueChange={(value) => setTxCustomSplit(value[0].toString())}
                  max={100}
                  step={5}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="tx-private">Private Purchase</Label>
                <p className="text-xs text-muted-foreground">Hide from partner</p>
              </div>
              <Switch
                id="tx-private"
                checked={txIsPrivate}
                onCheckedChange={setTxIsPrivate}
              />
            </div>

            {/* Live Calculation Preview */}
            {txAmount && parseFloat(txAmount) > 0 && txCategory && (() => {
              const amount = parseFloat(txAmount);
              const budget = budgets.find(b => b.category === txCategory);
              const currentSpent = getSpentForCategory(txCategory);
              const yourShare = txSplitMode === "50-50" ? amount / 2 :
                               txSplitMode === "one-person" ? amount :
                               txSplitMode === "custom" ? amount * (parseFloat(txCustomSplit) / 100) :
                               amount / 2;
              const partnerShare = amount - yourShare;

              return (
                <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-pink-500" />
                      Transaction Preview (Auto-Calculated)
                    </h4>
                    <div className="space-y-3">
                      {/* Split breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-white rounded border">
                          <p className="text-xs text-muted-foreground">Your share</p>
                          <p className="font-bold text-pink-600">${yourShare.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-white rounded border">
                          <p className="text-xs text-muted-foreground">Partner's share</p>
                          <p className="font-bold text-purple-600">${partnerShare.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Budget impact */}
                      {budget && (
                        <div className="p-3 bg-white rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{txCategory} Budget</span>
                            <Badge variant={currentSpent + amount > budget.limit ? "destructive" : "secondary"}>
                              {currentSpent + amount > budget.limit ? "Over budget!" : "Within budget"}
                            </Badge>
                          </div>
                          <Progress
                            value={Math.min(((currentSpent + amount) / budget.limit) * 100, 100)}
                            className="h-2 mb-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>After: ${(currentSpent + amount).toFixed(2)}</span>
                            <span>of ${budget.limit.toFixed(2)}</span>
                          </div>
                          {currentSpent + amount <= budget.limit && (
                            <p className="text-xs text-green-600 mt-1">
                              ${(budget.limit - currentSpent - amount).toFixed(2)} will remain
                            </p>
                          )}
                        </div>
                      )}

                      {!budget && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            No budget set for {txCategory}. Consider adding one to track spending!
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!txAmount || !txCategory}
            >
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Congratulations Dialog - Shows when all guided steps are complete */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl">You're All Set!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Congratulations! You've completed the getting started guide. You now know how to:
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-pink-700">Track shared expenses</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">Manage monthly budgets</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700">Create savings goals together</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <p className="text-sm text-muted-foreground">
              The app will automatically calculate balances, track spending against budgets, and monitor your goal progress. Just keep adding expenses as you go!
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowCongrats(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Using WeBalance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bill Dialog */}
      <Dialog open={showAddBill} onOpenChange={setShowAddBill}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-orange-500" />
              Add Recurring Bill
            </DialogTitle>
            <DialogDescription>Track monthly bills and get reminders</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bill-name">Bill Name</Label>
              <Input
                id="bill-name"
                placeholder="e.g., Netflix, Rent, Electric"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill-amount">Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  id="bill-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="text-2xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-due-day">Due Day</Label>
                <Select value={billDueDay} onValueChange={setBillDueDay}>
                  <SelectTrigger id="bill-due-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{getOrdinalSuffix(day)} of month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-category">Category</Label>
                <Select value={billCategory} onValueChange={setBillCategory}>
                  <SelectTrigger id="bill-category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={billAssignedTo === "shared" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBillAssignedTo("shared")}
                  className={billAssignedTo === "shared" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                >
                  Shared
                </Button>
                <Button
                  type="button"
                  variant={billAssignedTo === "user1" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBillAssignedTo("user1")}
                  className={billAssignedTo === "user1" ? "bg-blue-500" : ""}
                >
                  Me
                </Button>
                <Button
                  type="button"
                  variant={billAssignedTo === "user2" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBillAssignedTo("user2")}
                  className={billAssignedTo === "user2" ? "bg-purple-500" : ""}
                >
                  Partner
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <Label htmlFor="bill-reminder">Payment Reminder</Label>
                <p className="text-xs text-muted-foreground">Get notified 3 days before</p>
              </div>
              <Switch
                id="bill-reminder"
                checked={billReminder}
                onCheckedChange={setBillReminder}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBill(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddBill}
              className="bg-gradient-to-r from-orange-500 to-red-500"
              disabled={!billName || !billAmount || !billCategory}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={showEditBill} onOpenChange={setShowEditBill}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-blue-500" />
              Edit Bill
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-bill-name">Bill Name</Label>
              <Input
                id="edit-bill-name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bill-amount">Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-xl">$</span>
                <Input
                  id="edit-bill-amount"
                  type="number"
                  step="0.01"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bill-due-day">Due Day</Label>
                <Select value={billDueDay} onValueChange={setBillDueDay}>
                  <SelectTrigger id="edit-bill-due-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{getOrdinalSuffix(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bill-category">Category</Label>
                <Select value={billCategory} onValueChange={setBillCategory}>
                  <SelectTrigger id="edit-bill-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditBill(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBill} className="bg-blue-500">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Split Calculator Dialog */}
      <Dialog open={showQuickSplit} onOpenChange={setShowQuickSplit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
              Quick Split Calculator
            </DialogTitle>
            <DialogDescription>Calculate splits on the spot</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="split-amount">Total Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">$</span>
                <Input
                  id="split-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={quickSplitAmount}
                  onChange={(e) => setQuickSplitAmount(e.target.value)}
                  className="text-2xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Tip</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[quickSplitTip]}
                  onValueChange={(value) => setQuickSplitTip(value[0])}
                  max={30}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-right font-bold">{quickSplitTip}%</span>
              </div>
              <div className="flex gap-2">
                {[0, 15, 18, 20, 25].map(tip => (
                  <Button
                    key={tip}
                    type="button"
                    variant={quickSplitTip === tip ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuickSplitTip(tip)}
                    className={cn("flex-1", quickSplitTip === tip && "bg-green-500")}
                  >
                    {tip}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Split Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={quickSplitMode === "equal" ? "default" : "outline"}
                  onClick={() => setQuickSplitMode("equal")}
                  className={quickSplitMode === "equal" ? "bg-gradient-to-r from-pink-500 to-purple-600" : ""}
                >
                  Equal Split
                </Button>
                <Button
                  type="button"
                  variant={quickSplitMode === "custom" ? "default" : "outline"}
                  onClick={() => setQuickSplitMode("custom")}
                  className={quickSplitMode === "custom" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
                >
                  Custom %
                </Button>
              </div>
            </div>

            {quickSplitMode === "custom" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Your Share: {quickSplitCustom[0]}%</Label>
                  <Label>Partner: {100 - quickSplitCustom[0]}%</Label>
                </div>
                <Slider
                  value={[quickSplitCustom[0]]}
                  onValueChange={(value) => setQuickSplitCustom([value[0], 100 - value[0]])}
                  max={100}
                  step={5}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="split-note">Note (optional)</Label>
              <Input
                id="split-note"
                placeholder="e.g., Dinner at restaurant"
                value={quickSplitNote}
                onChange={(e) => setQuickSplitNote(e.target.value)}
              />
            </div>

            {/* Calculation Result */}
            {quickSplitAmount && parseFloat(quickSplitAmount) > 0 && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-500" />
                    Split Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${parseFloat(quickSplitAmount).toFixed(2)}</span>
                    </div>
                    {quickSplitTip > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tip ({quickSplitTip}%)</span>
                        <span>${(parseFloat(quickSplitAmount) * quickSplitTip / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(parseFloat(quickSplitAmount) * (1 + quickSplitTip / 100)).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-white rounded-lg border text-center">
                        <p className="text-xs text-muted-foreground">You Pay</p>
                        <p className="text-xl font-bold text-pink-600">
                          ${calculateQuickSplit()[0]?.toFixed(2) || "0.00"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          onClick={() => copyToClipboard(calculateQuickSplit()[0]?.toFixed(2) || "0")}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-3 bg-white rounded-lg border text-center">
                        <p className="text-xs text-muted-foreground">Partner Pays</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${calculateQuickSplit()[1]?.toFixed(2) || "0.00"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          onClick={() => copyToClipboard(calculateQuickSplit()[1]?.toFixed(2) || "0")}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowQuickSplit(false)} className="flex-1">
              Close
            </Button>
            <Button
              onClick={handleQuickSplitToExpense}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!quickSplitAmount || parseFloat(quickSplitAmount) <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add as Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History Sheet */}
      <Sheet open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              Transaction History
            </SheetTitle>
            <SheetDescription>View, search, and manage all transactions</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Select value={historyFilterCategory} onValueChange={setHistoryFilterCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={historyDateRange} onValueChange={(v) => setHistoryDateRange(v as typeof historyDateRange)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {getFilteredHistoryTransactions().length} transactions
                  </span>
                  <span className="font-bold text-blue-600">
                    ${getFilteredHistoryTransactions().reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List */}
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-2 pr-4">
                {getFilteredHistoryTransactions().map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.description || "No description"} • {format(new Date(tx.transaction_date), "MMM d")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">-${tx.amount.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setTransactionToDelete(tx.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {getFilteredHistoryTransactions().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No transactions found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Transaction
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Report Dialog */}
      <Dialog open={showMonthlyReport} onOpenChange={setShowMonthlyReport}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Monthly Report
            </DialogTitle>
            <DialogDescription>Review your financial summary</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Month Selector */}
            <div className="flex gap-2">
              <Select value={reportMonth.toString()} onValueChange={(v) => setReportMonth(parseInt(v))}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={reportYear.toString()} onValueChange={(v) => setReportYear(parseInt(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const data = getMonthlyReportData();
              return (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-lg mb-3">{data.month}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold text-red-600">${data.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Transactions</p>
                          <p className="text-2xl font-bold text-blue-600">{data.transactionCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.categoryBreakdown.length > 0 ? (
                        <div className="space-y-2">
                          {data.categoryBreakdown.map(([cat, amount], idx) => (
                            <div key={cat} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-3 w-3 rounded-full",
                                  idx === 0 && "bg-pink-500",
                                  idx === 1 && "bg-purple-500",
                                  idx === 2 && "bg-blue-500",
                                  idx === 3 && "bg-green-500",
                                  idx >= 4 && "bg-gray-400"
                                )} />
                                <span className="text-sm">{cat}</span>
                              </div>
                              <span className="font-medium">${(amount as number).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No spending data</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget Status */}
                  {data.budgetStatus.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Budget Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.budgetStatus.map(b => (
                            <div key={b.category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{b.category}</span>
                                <Badge variant={b.status === "over" ? "destructive" : b.status === "warning" ? "secondary" : "outline"}>
                                  {b.status === "over" ? "Over" : b.status === "warning" ? "Warning" : "Good"}
                                </Badge>
                              </div>
                              <Progress value={Math.min((b.spent / b.limit) * 100, 100)} className="h-2" />
                              <p className="text-xs text-muted-foreground">${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Goals Progress */}
                  {data.goalProgress.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Savings Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.goalProgress.map(g => (
                            <div key={g.name} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{g.name}</span>
                                <span className="font-medium">{g.progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={g.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">${g.current.toFixed(2)} / ${g.target.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMonthlyReport(false)}>
              Close
            </Button>
            <Button onClick={handleExportMonthlyReport} className="bg-gradient-to-r from-purple-500 to-pink-600">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spending Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart Insights
            </DialogTitle>
            <DialogDescription>Personalized tips based on your spending</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {generateInsights.length > 0 ? (
              generateInsights.map(insight => (
                <Card key={insight.id} className={cn(
                  "border-l-4",
                  insight.type === "warning" && "border-l-red-500 bg-red-50",
                  insight.type === "achievement" && "border-l-green-500 bg-green-50",
                  insight.type === "tip" && "border-l-blue-500 bg-blue-50",
                  insight.type === "trend" && "border-l-purple-500 bg-purple-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        insight.type === "warning" && "bg-red-100",
                        insight.type === "achievement" && "bg-green-100",
                        insight.type === "tip" && "bg-blue-100",
                        insight.type === "trend" && "bg-purple-100"
                      )}>
                        {insight.type === "warning" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {insight.type === "achievement" && <Star className="h-4 w-4 text-green-600" />}
                        {insight.type === "tip" && <Lightbulb className="h-4 w-4 text-blue-600" />}
                        {insight.type === "trend" && <TrendingUpIcon className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-yellow-400 opacity-50" />
                <p className="text-muted-foreground">Add more transactions to get personalized insights!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowInsights(false)} className="w-full">
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestones Dialog */}
      <Dialog open={showMilestones} onOpenChange={setShowMilestones}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Milestones
            </DialogTitle>
            <DialogDescription>Track your achievements</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  milestone.achieved
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                  milestone.achieved
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                    : "bg-gray-200"
                )}>
                  {milestone.achieved ? (
                    <Star className="h-5 w-5 text-white" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium text-sm",
                    !milestone.achieved && "text-muted-foreground"
                  )}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  {milestone.achieved && milestone.achievedDate && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Achieved {format(milestone.achievedDate, "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                {milestone.achieved && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {milestones.filter(m => m.achieved).length} of {milestones.length} milestones achieved
            </p>
            <Progress
              value={(milestones.filter(m => m.achieved).length / milestones.length) * 100}
              className="mt-2 h-2"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportData} onOpenChange={setShowExportData}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Export All Data
            </DialogTitle>
            <DialogDescription>
              Download all your financial data as a JSON file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Your export will include:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  All transactions ({transactions.length} records)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Budgets ({budgets.length} categories)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Savings goals ({goals.length} goals)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Bills ({bills.length} recurring bills)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Settings and preferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Achieved milestones
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportData(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportAllData}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDataConfirm} onOpenChange={setShowClearDataConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Clear All Financial Data
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <p className="font-medium mb-1">Warning: This will permanently delete:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>All {transactions.length} transactions</li>
                  <li>All {budgets.length} budgets</li>
                  <li>All {goals.length} savings goals</li>
                  <li>All {bills.length} recurring bills</li>
                  <li>All notifications and milestones</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your account and partner connection will remain intact. Only financial data will be cleared.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowClearDataConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guided Mode - Interactive Post-Tutorial Prompts */}
      {showGuidedMode && !showTutorial && guidedSteps[guidedStep] && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="shadow-lg border-2 border-pink-200 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-0">
                    Step {guidedStep + 1} of {guidedSteps.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={skipGuidedMode}
                  aria-label="Close guided mode"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                  guidedSteps[guidedStep].color === "pink" && "bg-gradient-to-br from-pink-400 to-pink-600",
                  guidedSteps[guidedStep].color === "blue" && "bg-gradient-to-br from-blue-400 to-blue-600",
                  guidedSteps[guidedStep].color === "purple" && "bg-gradient-to-br from-purple-400 to-purple-600"
                )}>
                  {(() => {
                    const IconComponent = guidedSteps[guidedStep].icon;
                    return <IconComponent className="h-5 w-5 text-white" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {guidedSteps[guidedStep].title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground mb-4">
                {guidedSteps[guidedStep].description}
              </p>

              {/* Progress indicators for all steps */}
              <div className="flex gap-2 mb-4">
                {guidedSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex-1 h-1.5 rounded-full transition-all duration-300",
                      completedGuidedSteps.has(step.id)
                        ? "bg-green-500"
                        : idx === guidedStep
                        ? "bg-gradient-to-r from-pink-500 to-purple-500"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  className={cn(
                    "flex-1",
                    guidedSteps[guidedStep].color === "pink" && "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
                    guidedSteps[guidedStep].color === "blue" && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                    guidedSteps[guidedStep].color === "purple" && "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  )}
                  onClick={guidedSteps[guidedStep].action}
                >
                  {guidedSteps[guidedStep].buttonText}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Skip to next step
                    if (guidedStep < guidedSteps.length - 1) {
                      setGuidedStep(guidedStep + 1);
                    } else {
                      skipGuidedMode();
                    }
                  }}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Tutorial Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
              <CardHeader className="text-center pb-4">
                {/* Step indicator */}
                <div className="flex justify-center gap-1.5 mb-4">
                  {tutorialSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === tutorialStep
                          ? "w-6 bg-gradient-to-r from-pink-500 to-purple-600"
                          : idx < tutorialStep
                          ? "w-1.5 bg-pink-300"
                          : "w-1.5 bg-gray-200"
                      )}
                    />
                  ))}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center",
                    tutorialStep === 0 || tutorialStep === tutorialSteps.length - 1
                      ? "bg-gradient-to-br from-pink-400 to-purple-500"
                      : "bg-gradient-to-br from-blue-400 to-purple-500"
                  )}>
                    {(() => {
                      const IconComponent = tutorialSteps[tutorialStep].icon;
                      return <IconComponent className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                </div>

                <CardTitle className="text-xl">
                  {tutorialSteps[tutorialStep].title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {tutorialSteps[tutorialStep].description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                {/* Step-specific hints */}
                {tutorialStep === 1 && (
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 text-sm">
                    <p className="font-medium text-pink-700 mb-2">Quick Tip:</p>
                    <ul className="list-disc list-inside text-pink-600 space-y-1">
                      <li>Choose between 50/50 split, income-based, or custom %</li>
                      <li>Add a description to remember what it was for</li>
                      <li>Mark as private if you don't want to share it</li>
                    </ul>
                  </div>
                )}

                {tutorialStep === 2 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                    <p className="font-medium text-blue-700 mb-2">Budget Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Food & Dining", "Groceries", "Entertainment", "Transportation"].map(cat => (
                        <Badge key={cat} variant="secondary" className="bg-blue-100 text-blue-700">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {tutorialStep === 3 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                    <p className="font-medium text-purple-700 mb-2">Goal Ideas:</p>
                    <ul className="list-disc list-inside text-purple-600 space-y-1">
                      <li>Vacation Fund</li>
                      <li>Emergency Savings</li>
                      <li>New Car / Home Down Payment</li>
                      <li>Wedding Fund</li>
                    </ul>
                  </div>
                )}

                {tutorialStep === 4 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm">
                    <p className="font-medium text-green-700 mb-2">Auto-Calculations:</p>
                    <p className="text-green-600">
                      The app tracks who paid for what and calculates the balance automatically.
                      No need to do any math!
                    </p>
                  </div>
                )}

                {tutorialStep === tutorialSteps.length - 1 && (
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 text-sm">
                    <p className="font-medium text-purple-700 mb-2">Getting Started:</p>
                    <div className="space-y-2 text-purple-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>All values start at $0.00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Add expenses as you spend</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Everything updates automatically</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="px-6 pb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {tutorialStep > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTutorialPrev}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {tutorialStep < tutorialSteps.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTutorialSkip}
                    >
                      Skip Tutorial
                    </Button>
                  )}
                  <Button
                    onClick={handleTutorialNext}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? (
                      <>
                        Get Started
                        <Sparkles className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Exit Menu Dialog */}
      <Dialog open={showExitMenu} onOpenChange={setShowExitMenu}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Power className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Exit WeBalance?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to log out? Your data will be saved and you can log back in anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                All your transactions, budgets, and goals are automatically saved.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                    {currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowExitMenu(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restart Menu Dialog */}
      <Dialog open={showRestartConfirm} onOpenChange={setShowRestartConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <RotateCcw className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Restart Options</DialogTitle>
            <DialogDescription className="text-center">
              Choose how you'd like to restart your WeBalance experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Option 1: Reset Financial Data Only */}
            <Card
              className="cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all"
              onClick={handleRestartFinancialData}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Reset Financial Data</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clears all transactions, budgets, goals, and bills. Your account stays active.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">Transactions</Badge>
                      <Badge variant="outline" className="text-xs">Budgets</Badge>
                      <Badge variant="outline" className="text-xs">Goals</Badge>
                      <Badge variant="outline" className="text-xs">Bills</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Start Tutorial Again */}
            <Card
              className="cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition-all"
              onClick={() => {
                setShowRestartConfirm(false);
                restartTutorial();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Restart Tutorial</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Go through the welcome tutorial again. Your data stays intact.
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Option 3: Full Reset (Logout + Clear Everything) */}
            <Card
              className="cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition-all border-red-200"
              onClick={handleFullRestart}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-red-700">Complete Reset</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log out and clear everything. You'll start fresh as a new user.
                    </p>
                    <Badge variant="destructive" className="text-xs mt-2">
                      Cannot be undone
                    </Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRestartConfirm(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
