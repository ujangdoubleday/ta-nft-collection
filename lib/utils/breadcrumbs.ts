type Breadcrumb = {
  label: string;
  path: string;
};

/**
 * Generate breadcrumb items from a pathname
 */
export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  if (pathname === "/") return [];

  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  let currentPath = "";

  for (let i = 0; i < paths.length; i++) {
    currentPath += `/${paths[i]}`;

    // Handle special cases for better labeling
    let label = paths[i].replace(/-/g, " ");
    label = label.charAt(0).toUpperCase() + label.slice(1);

    // For collection IDs, add "Collection: " prefix
    if (i === 1 && paths[0] === "my-collections" && paths[i] !== "create") {
      breadcrumbs.push({ label: `Collection: ${label}`, path: currentPath });
    }
    // For NFT IDs
    else if (i === 2 && paths[0] === "my-collections") {
      breadcrumbs.push({ label: `NFT: ${paths[i]}`, path: currentPath });
    }
    // For "create" or other special pages
    else if (paths[i] === "create") {
      breadcrumbs.push({ label: "Create New", path: currentPath });
    }
    // For "mint" page
    else if (paths[i] === "mint") {
      breadcrumbs.push({ label: "Mint NFT", path: currentPath });
    }
    // Standard pages
    else if (i === 0) {
      if (paths[i] === "my-collections") {
        breadcrumbs.push({ label: "My Collections", path: currentPath });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    }
  }

  return breadcrumbs;
}
