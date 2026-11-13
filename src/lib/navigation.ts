type ActiveRouteOptions = {
  exact?: boolean;
};

/**
 * Indique si un lien de navigation correspond au pathname courant.
 * Les ancres et liens externes sont ignorés car ils ne représentent pas des routes applicatives.
 */
export function isActiveRoute(
  pathname: string,
  href: string,
  options: ActiveRouteOptions = {},
) {
  if (!href || href.startsWith('#') || href.startsWith('http')) {
    return false;
  }

  const [routePath] = href.split('#');

  if (!routePath || options.exact || routePath === '/') {
    return pathname === routePath;
  }

  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}
