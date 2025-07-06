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
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'newFile', href: '/ho-so/tao-moi', icon: FileText, label: 'Hồ sơ' },
  { name: 'customers', href: '/khach-hang', icon: UsersRound, label: 'Khách hàng' },
  { name: 'search', href: '/tra-cuu', icon: Search, label: 'Tra cứu' },
  { name: 'settings', href: '/cai-dat', icon: Settings, label: 'Cài đặt' },
];

function SidebarContent({ collapsed = false, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();

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
                  isActive && "bg-orange-600 hover:bg-orange-700 text-white"
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