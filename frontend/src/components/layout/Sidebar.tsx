import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Music, 
  FileText, 
  List, 
  Settings,
  Calendar,
  Speaker,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: Music },
  { name: "Podcasts", href: "/podcasts", icon: FileText },
  { name: "Ad Campaigns", href: "/campaigns", icon: Speaker },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Playlists", href: "/playlists", icon: List },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm" 
             style={{ display: sidebarOpen ? 'block' : 'none' }} />

        <div className={cn(
          "fixed inset-0 z-50 flex transform transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="relative flex w-72 flex-1">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col overflow-y-auto bg-gray-900 pb-4">
              <div className="flex h-40 shrink-0 items-center justify-center px-6 border-b border-gray-800">
                <Image
                  src="/images/airp-logo.svg"
                  alt="AI Radio"
                  width={200}
                  height={200}
                  priority
                  className="h-32 w-auto"
                />
              </div>
              <SidebarContent pathname={pathname} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-gray-900">
          <div className="flex h-40 shrink-0 items-center justify-center px-6 border-b border-gray-800">
            <Image
              src="/images/airp-logo.svg"
              alt="AI Radio"
              width={200}
              height={200}
              priority
              className="h-32 w-auto"
            />
          </div>
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Mobile nav header */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-x-4 bg-gray-900 px-4 shadow-sm">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-center">
            <Image
              src="/images/airp-logo.svg"
              alt="AI Radio"
              width={48}
              height={48}
              priority
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <nav className="flex-1 space-y-2 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-base font-medium rounded-md",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-4 h-6 w-6 flex-shrink-0",
                  isActive
                    ? "text-[#7ac5be]"
                    : "text-gray-400 group-hover:text-[#7ac5be]"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-shrink-0 border-t border-gray-800 p-6">
        <div className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-base font-medium text-white">Admin User</p>
              <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                View profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 