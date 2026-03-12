"use client";

import Link from "next/link";
import { COMMANDS } from "../lib/commands";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Search,
  Settings,
  User,
  Sparkles,
  CheckCheck,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Radar", href: "/radar" },
  { label: "Strategy", href: "/strategy" },
  { label: "Studio", href: "/studio" },
  { label: "Learning", href: "/learning" },
  { label: "Console", href: "/console" },
];

type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  unread: boolean;
  createdAt: number;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Narrative shift detected",
    desc: "AI sector momentum is strengthening again.",
    unread: true,
    createdAt: Date.now() - 1000 * 60 * 4,
  },
  {
    id: "notif-2",
    title: "Strategy workspace ready",
    desc: "Your last command can be continued in Console.",
    unread: true,
    createdAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: "notif-3",
    title: "Studio draft available",
    desc: "A content flow is ready for publishing.",
    unread: false,
    createdAt: Date.now() - 1000 * 60 * 24,
  },
];

const demoNotifications = [
  {
    title: "Rotation alert",
    desc: "RWA is overtaking DePIN in current radar ranking.",
  },
  {
    title: "Console follow-up available",
    desc: "OpenClaw kept your last strategy context ready.",
  },
  {
    title: "Market momentum spike",
    desc: "AI narrative confidence moved above 80.",
  },
  {
    title: "Studio content suggestion",
    desc: "A Binance Square post draft is ready to review.",
  },
];

function formatTimeAgo(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DiamondMark() {
  return (
    <motion.div
      whileHover={{ scale: 1.04, rotate: 2 }}
      transition={{ duration: 0.18 }}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card/80 shadow-[0_0_20px_rgba(252,213,53,0.08)]"
    >
      <div className="grid rotate-45 grid-cols-2 gap-[3px]">
        <div className="h-2.5 w-2.5 bg-primary" />
        <div className="h-2.5 w-2.5 bg-primary" />
        <div className="h-2.5 w-2.5 bg-primary" />
        <div className="h-2.5 w-2.5 border border-primary bg-transparent" />
      </div>
    </motion.div>
  );
}

function DropdownShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={`absolute right-0 top-[calc(100%+12px)] z-[80] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [openCommand, setOpenCommand] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [demoPulse, setDemoPulse] = useState(false);

  const commandRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  useEffect(() => {
    function closeAllPanels() {
      setOpenCommand(false);
      setOpenNotifications(false);
      setOpenUserMenu(false);
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (commandRef.current && !commandRef.current.contains(target)) {
        setOpenCommand(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setOpenNotifications(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setOpenUserMenu(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isK = event.key.toLowerCase() === "k";

      if (isCmdOrCtrl && isK) {
        event.preventDefault();
        closeAllPanels();
        setOpenCommand(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }

      if (event.key === "Escape") {
        closeAllPanels();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (openCommand) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [openCommand]);

  function closeAllPanels() {
    setOpenCommand(false);
    setOpenNotifications(false);
    setOpenUserMenu(false);
  }

  function submitCommand(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    closeAllPanels();
    setQuery("");
    router.push(`/console?q=${encodeURIComponent(trimmed)}`);
  }

  function toggleCommand() {
    setOpenCommand((prev) => {
      const next = !prev;
      if (next) {
        setOpenNotifications(false);
        setOpenUserMenu(false);
      }
      return next;
    });
  }

  function toggleNotifications() {
    setOpenNotifications((prev) => {
      const next = !prev;
      if (next) {
        setOpenCommand(false);
        setOpenUserMenu(false);
      }
      return next;
    });
  }

  function toggleUserMenu() {
    setOpenUserMenu((prev) => {
      const next = !prev;
      if (next) {
        setOpenCommand(false);
        setOpenNotifications(false);
      }
      return next;
    });
  }

  function markAllNotificationsRead() {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  }

  function addDemoNotification() {
    const picked =
      demoNotifications[Math.floor(Math.random() * demoNotifications.length)];

    const nextItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: picked.title,
      desc: picked.desc,
      unread: true,
      createdAt: Date.now(),
    };

    setNotifications((prev) => [nextItem, ...prev]);
    setDemoPulse(true);

    window.setTimeout(() => {
      setDemoPulse(false);
    }, 1800);
  }

  function openNotification(item: NotificationItem) {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === item.id ? { ...notif, unread: false } : notif
      )
    );

    setOpenNotifications(false);

    router.push(
      "/console?q=" +
        encodeURIComponent(`${item.title} - ${item.desc}`)
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <DiamondMark />
            <div className="leading-none">
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[15px] font-semibold tracking-wide text-foreground">
                  NarrClaw
                </span>
                <span className="text-[15px] font-semibold tracking-wide text-primary">
                  AI
                </span>
              </div>
              <div className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                Crypto Intelligence Terminal
              </div>
            </div>
          </Link>

          <nav className="hidden min-w-0 items-center gap-1 whitespace-nowrap xl:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.16 }}
                >
                  <Link
                    href={item.href}
                    className={`rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div ref={commandRef} className="relative hidden lg:block">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={toggleCommand}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground shadow-sm transition hover:border-primary/30"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="max-w-[150px] truncate xl:max-w-[170px]">
                Ask NarrAI anything...
              </span>
              <span className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Ctrl K
              </span>
            </motion.button>

            <AnimatePresence>
              {openCommand && (
                <DropdownShell className="w-[420px]">
                  <div className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    NarrAI Command
                  </div>

                  <div className="p-3">
                    <input
                      ref={inputRef}
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          submitCommand(query);
                        }
                      }}
                      placeholder="Ask NarrAI anything..."
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </div>

                  <div className="border-t border-border px-3 py-3">
                    <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Suggested prompts
                    </div>

                    <div className="space-y-2">
                      {COMMANDS.slice(0, 4).map((command, index) => (
                        <motion.button
                          key={command.id}
                          type="button"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.16, delay: index * 0.03 }}
                          onClick={() => {
                            setQuery(command.prompt);
                            submitCommand(command.prompt);
                          }}
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-background hover:text-foreground"
                        >
                          {command.prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </DropdownShell>
              )}
            </AnimatePresence>
          </div>

          <div ref={notificationRef} className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleNotifications}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <Bell className="h-4 w-4" />

              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-primary px-1.5 py-[2px] text-center text-[10px] font-semibold text-black"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {demoPulse && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, repeat: 1 }}
                    className="absolute inset-0 rounded-2xl border border-primary"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {openNotifications && (
                <DropdownShell className="w-[360px]">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Notifications
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addDemoNotification}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition hover:bg-primary/15"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Demo alert
                      </button>

                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Read all
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="mb-3 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                      Click <span className="font-semibold">Demo alert</span> to preview how an incoming notification looks.
                    </div>

                    <div className="space-y-2">
                      {notifications.length === 0 ? (
                        <div className="rounded-xl border border-border bg-background/60 px-3 py-4 text-sm text-muted-foreground">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((item, index) => (
                          <motion.button
                            key={item.id}
                            type="button"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.16, delay: index * 0.02 }}
                            onClick={() => openNotification(item)}
                            className={`block w-full rounded-xl border px-3 py-3 text-left transition ${
                              item.unread
                                ? "border-primary/20 bg-primary/5"
                                : "border-border bg-background/60"
                            } hover:border-primary/30`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-foreground">
                                    {item.title}
                                  </div>
                                  {item.unread && (
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>

                                <div className="mt-1 text-sm text-muted-foreground">
                                  {item.desc}
                                </div>
                              </div>

                              <div className="shrink-0 text-[11px] text-muted-foreground">
                                {formatTimeAgo(item.createdAt)}
                              </div>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>
                </DropdownShell>
              )}
            </AnimatePresence>
          </div>

          <div ref={userMenuRef} className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={toggleUserMenu}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              <span className="whitespace-nowrap">AX</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
              {openUserMenu && (
                <DropdownShell className="w-[240px]">
                  <div className="border-b border-border px-4 py-3">
                    <div className="text-sm font-semibold text-foreground">AX</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      NarrAI operator profile
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2">
                      <motion.button
                        type="button"
                        whileHover={{ x: 2 }}
                        onClick={() => {
                          setOpenUserMenu(false);
                          router.push("/console");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <User className="h-4 w-4 shrink-0 text-primary" />
                        <span>Profile Overview</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ x: 2 }}
                        onClick={() => {
                          setOpenUserMenu(false);
                          router.push("/learning");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <CreditCard className="h-4 w-4 shrink-0 text-primary" />
                        <span>Workspace Access</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ x: 2 }}
                        onClick={() => {
                          setOpenUserMenu(false);
                          router.push(
                            "/console?q=" + encodeURIComponent("open settings")
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <Settings className="h-4 w-4 shrink-0 text-primary" />
                        <span>Settings</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ x: 2 }}
                        onClick={() => {
                          setOpenUserMenu(false);
                          router.push("/");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4 shrink-0 text-primary" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </div>
                </DropdownShell>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}