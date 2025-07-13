'use client';

import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent } from '@/src/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { useAppStore } from '@/src/lib/store';
import { 
  FileText, 
  Search, 
  UsersRound, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0';

const navigation = [
  { name: 'documents', href: '/documents/manage', icon: FileText, label: 'Hồ sơ' },
  { name: 'customers', href: '/customers', icon: UsersRound, label: 'Khách hàng' },
  { name: 'profile', href: '/profile', icon: User, label: 'Tài khoản' },
];

function SidebarContent({ collapsed = false, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-foreground"
            >
              Menu
            </motion.h2>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="ml-auto"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            const buttonContent = (
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full",
                  collapsed ? "justify-center px-2" : "justify-start",
                  isActive && "bg-[#800020] hover:bg-[#722F37] text-white"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.name}>{buttonContent}</div>;
          })}
        </nav>
        
        {/* User section and logout */}
        <div className="p-4 border-t border-border mt-auto">
          {!collapsed && user && (
            <div className="mb-3 p-2 rounded-md bg-muted/50">
              <div className="text-sm font-medium text-foreground truncate">
                {user.name || user.email}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-red-600 hover:text-red-700 hover:bg-red-50",
                  collapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <a href="/auth/logout">
                  <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      Đăng xuất
                    </motion.span>
                  )}
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Đăng xuất</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    // This effect runs after hydration to sync with persisted state
  }, []);

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.div 
        className="hidden lg:block bg-background border-r border-border h-screen sticky top-16"
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggleCollapse={toggleCollapse} />
      </motion.div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}