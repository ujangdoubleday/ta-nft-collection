"use client";

import React, { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Win98SubMenu, Win98Alert } from "@/components/ui/win98";
import {
  Undo,
  Eraser,
  Save,
  FileOutput,
  Copy,
  RefreshCw,
  Search,
  FolderOpen,
  FilePlus,
  FileText,
  Home,
  HelpCircle,
  X,
} from "lucide-react";

// Page help descriptions
const PAGE_HELP = {
  home: "Welcome to MyNFTs.exe - a Windows 98 styled NFT platform. Navigate through the application using the navigation bar and menus. Click on icons to access different features.",

  about:
    "This page contains information about MyNFTs.exe platform, its creators, and the technology used to build it. Learn more about our mission and goals.",

  contact:
    "Use this page to get in touch with the developers of MyNFTs.exe. You can send feedback, report issues, or ask questions about the platform.",

  myCollections:
    "Browse and manage your NFT collections. Create new collections, view your existing ones, and manage your digital assets all in one place.",

  collectionCreate:
    "Create a new NFT collection by filling out the form. You can set a name, description, and upload preview images for your collection.",

  collectionEdit:
    "Edit your existing NFT collection details including name, description, and preview images.",

  todos:
    "Manage your tasks with this simple todo application. Add, edit, and mark tasks as complete to stay organized.",

  default:
    "Welcome to MyNFTs.exe! This Windows 98-style interface allows you to navigate through the application. Use the menu at the top to access different features.",
};

export function Win98SubMenuBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelpAlert, setShowHelpAlert] = useState(false);
  const [helpContent, setHelpContent] = useState("");
  const [helpTitle, setHelpTitle] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle help click
  const handleHelpClick = () => {
    let title = "Help";
    let content = PAGE_HELP.default;

    // Set help content based on current path
    if (pathname === "/") {
      title = "Home - Help";
      content = PAGE_HELP.home;
    } else if (pathname === "/about") {
      title = "About - Help";
      content = PAGE_HELP.about;
    } else if (pathname === "/contact") {
      title = "Contact - Help";
      content = PAGE_HELP.contact;
    } else if (pathname === "/my-collections") {
      title = "My Collections - Help";
      content = PAGE_HELP.myCollections;
    } else if (pathname.includes("/my-collections/create")) {
      title = "Create Collection - Help";
      content = PAGE_HELP.collectionCreate;
    } else if (pathname.includes("/my-collections/edit")) {
      title = "Edit Collection - Help";
      content = PAGE_HELP.collectionEdit;
    } else if (pathname.includes("/todos")) {
      title = "Todos - Help";
      content = PAGE_HELP.todos;
    }

    setHelpTitle(title);
    setHelpContent(content);
    setShowHelpAlert(true);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Reset search query when showing the search input
      setSearchQuery("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Here you would implement actual search functionality
      alert(`Searching for: ${searchQuery}`);
      // Example: Navigate to search results page with query parameter
      // router.push(`/my-collections/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPageActions = useMemo(() => {
    const defaultActions = [
      {
        label: "Help",
        icon: <HelpCircle className="h-3 w-3" />,
        onClick: handleHelpClick,
      },
    ];

    // Home page actions
    if (pathname === "/") {
      return [
        {
          label: "Refresh",
          icon: <RefreshCw className="h-3 w-3" />,
          onClick: () => window.location.reload(),
        },
        ...defaultActions,
      ];
    }

    // My Collections page actions
    if (pathname === "/my-collections") {
      return [
        {
          label: "New Collection",
          icon: <FilePlus className="h-3 w-3" />,
          onClick: () => router.push("/my-collections/create"),
        },
        {
          label: "Search",
          icon: <Search className="h-3 w-3" />,
          onClick: toggleSearch,
        },
        ...defaultActions,
      ];
    }

    // NFT Mint page - check for /my-collections/[collectionId]/mint pattern
    const mintPathMatch = pathname.match(/^\/my-collections\/([^/]+)\/mint$/);
    if (mintPathMatch) {
      return [
        {
          label: "Reset Form",
          icon: <Eraser className="h-3 w-3" />,
          onClick: () => {
            // Dispatch a custom event that the mint page can listen for
            const event = new CustomEvent("resetMintForm");
            window.dispatchEvent(event);
          },
        },
        ...defaultActions,
      ];
    }

    // Dynamic collection page - check if it matches /my-collections/[something] but NOT /my-collections/create or /my-collections/edit
    const collectionPathMatch = pathname.match(/^\/my-collections\/([^/]+)$/);
    if (
      collectionPathMatch &&
      collectionPathMatch[1] !== "create" &&
      collectionPathMatch[1] !== "edit"
    ) {
      const collectionId = collectionPathMatch[1];
      return [
        {
          label: "Add NFT",
          icon: <FilePlus className="h-3 w-3" />,
          onClick: () => router.push(`/my-collections/${collectionId}/mint`),
        },
        {
          label: "Search NFT",
          icon: <Search className="h-3 w-3" />,
          onClick: toggleSearch,
        },
        {
          label: "Refresh Data",
          icon: <RefreshCw className="h-3 w-3" />,
          onClick: () => window.location.reload(),
        },
        ...defaultActions,
      ];
    }

    // Collection creation/edit page
    if (
      pathname.includes("/my-collections/create") ||
      pathname.includes("/my-collections/edit")
    ) {
      return [
        {
          label: "Reset Form",
          icon: <Eraser className="h-3 w-3" />,
          onClick: () => alert("Redo last action"),
        },
        ...defaultActions,
      ];
    }

    // Todos page
    if (pathname.includes("/todos")) {
      return [
        {
          label: "Add Todo",
          icon: <FilePlus className="h-3 w-3" />,
          onClick: () => alert("Add new todo"),
        },
        {
          label: "Refresh",
          icon: <RefreshCw className="h-3 w-3" />,
          onClick: () => window.location.reload(),
        },
        ...defaultActions,
      ];
    }

    // Default actions for other pages
    return [...defaultActions];
  }, [pathname, router, toggleSearch]);

  // Generate title based on path
  const pageTitle = useMemo(() => {
    if (pathname === "/") return "My Computer";
    if (pathname === "/my-collections") return "My Collections";
    if (pathname === "/todos") return "Task Manager";

    // Handle specific paths or use the last segment
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];

      // Format some common segments nicely
      if (lastSegment === "create") return "New Item";
      if (lastSegment === "edit") return "Edit Item";

      return lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return "Explorer";
  }, [pathname]);

  // Search input component
  const SearchInput = () => (
    <div className="my-1 w-full md:w-auto">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections..."
          className="px-2 py-1 h-6 border border-[#808080] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white text-sm focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] h-6 px-2 press-effect hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] active:bg-[#b0b0b0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white transition-colors duration-100"
        >
          <Search className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={toggleSearch}
          className="bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] h-6 px-2 press-effect hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] active:bg-[#b0b0b0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white transition-colors duration-100"
        >
          <X className="h-3 w-3" />
        </button>
      </form>
    </div>
  );

  return (
    <>
      <Win98SubMenu
        title={pageTitle}
        actions={getPageActions}
        showBackButton={pathname !== "/"}
        className="mb-1 shadow-sm"
        extraContent={
          showSearch && pathname === "/my-collections" ? <SearchInput /> : null
        }
      />

      {showHelpAlert && (
        <Win98Alert
          title={helpTitle}
          message={helpContent}
          type="info"
          onClose={() => setShowHelpAlert(false)}
          buttons={[{ label: "OK", onClick: () => {}, primary: true }]}
        />
      )}
    </>
  );
}
