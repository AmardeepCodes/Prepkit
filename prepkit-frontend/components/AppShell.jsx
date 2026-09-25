"use client";
import { useState,  useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../lib/api/client";
import Link from "next/link";
import Logo from "./Logo";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "grid_view" },
];

export default function AppShell({ active = "Dashboard", children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Your Account");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserName(JSON.parse(user).name);
    }
  }, []);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore - logging out client-side regardless
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile overlay - closes sidebar on tap outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-lg px-space-md transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col gap-space-xl">
          <div className="flex items-center justify-between px-space-sm">
            <div className="flex items-center gap-space-sm">
              <Logo className="h-8 w-8" />
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                PrepKit AI
              </span>
            </div>
            <button
              className="md:hidden p-1 text-on-surface-variant"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-space-xs">
            {NAV_ITEMS.map((item) => {
              const isActive = item.label === active;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all font-label-lg text-label-lg ${
                    isActive
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-space-xs">
          <button
            onClick={handleLogout}
            className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-error-container hover:text-on-error-container transition-all w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 px-gutter-mobile md:px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm flex-1 max-w-lg">
            <button
              className="md:hidden p-1 -ml-1 text-on-surface-variant"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-xl w-full text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] text-outline">
                search
              </span>
              <input
                className="bg-transparent border-none outline-none text-on-surface placeholder:text-outline font-body-sm text-body-sm w-full"
                placeholder="Search interview kits, companies, roles..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-space-md md:gap-space-lg">
            <button
              aria-label="Notifications"
              className="relative p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
            </button>
            <div className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-none">
                  {userName}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px] hidden sm:inline">
                expand_more
              </span>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 px-gutter-mobile md:px-gutter bg-surface flex-1">
          <div className="flex flex-col w-full pb-space-2xl max-w-[1360px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}























// "use client";
// import { useRouter } from "next/navigation";
// import { authApi } from "../lib/api/client";
// import Link from "next/link";
// import Logo from "./Logo";

// const NAV_ITEMS = [
//   { path: "/dashboard", label: "Dashboard", icon: "grid_view" },
// ];

// export default function AppShell({ active = "Dashboard", children }) {
//   const router = useRouter();

//   async function handleLogout() {
//     try {
//       await authApi.logout();
//     } catch {
//       // ignore - logging out client-side regardless
//     } finally {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       router.push("/login");
//     }
//   }

//   return (
//     <div className="min-h-screen bg-surface">
//       <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-lg px-space-md">
//         <div className="flex flex-col gap-space-xl">
//           <div className="flex items-center gap-space-sm px-space-sm">
//             <Logo className="h-8 w-8" />
//             <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
//               PrepKit AI
//             </span>
//           </div>
//           <nav className="flex flex-col gap-space-xs">
//             {NAV_ITEMS.map((item) => {
//               const isActive = item.label === active;
//               return (
//                 <Link
//                   key={item.label}
//                   href={item.path}
//                   aria-current={isActive ? "page" : undefined}
//                   className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all font-label-lg text-label-lg ${
//                     isActive
//                       ? "bg-primary-container text-on-primary shadow-sm"
//                       : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
//                   }`}
//                 >
//                   <span className="material-symbols-outlined text-[20px]">
//                     {item.icon}
//                   </span>
//                   <span>{item.label}</span>
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>
//         <div className="px-space-xs">
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-error-container hover:text-on-error-container transition-all w-full text-left"
//           >
//             <span className="material-symbols-outlined text-[20px]">logout</span>
//             <span>Log out</span>
//           </button>
//         </div>
//       </aside>

//       <div className="pl-64 flex flex-col min-h-screen">
//         <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between">
//           <div className="flex items-center gap-space-md flex-1 max-w-lg">
//             <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-xl w-full text-on-surface-variant">
//               <span className="material-symbols-outlined text-[20px] text-outline">
//                 search
//               </span>
//               <input
//                 className="bg-transparent border-none outline-none text-on-surface placeholder:text-outline font-body-sm text-body-sm w-full"
//                 placeholder="Search interview kits, companies, roles..."
//                 type="text"
//               />
//             </div>
//           </div>
//           <div className="flex items-center gap-space-lg">
//             <button
//               aria-label="Notifications"
//               className="relative p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
//               type="button"
//             >
//               <span className="material-symbols-outlined text-[22px]">
//                 notifications
//               </span>
//             </button>
//             <div className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none">
//               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
//                 <span className="material-symbols-outlined text-on-primary text-[18px]">
//                   person
//                 </span>
//               </div>
//               <div className="hidden sm:flex flex-col text-left">
//                 <span className="font-label-md text-label-md text-on-surface leading-none">
//                   Your Account
//                 </span>
//               </div>
//               <span className="material-symbols-outlined text-outline text-[18px]">
//                 expand_more
//               </span>
//             </div>
//           </div>
//         </header>
//         <main className="w-full pt-16 px-gutter bg-surface flex-1">
//           <div className="flex flex-col w-full pb-space-2xl max-w-[1360px] mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }