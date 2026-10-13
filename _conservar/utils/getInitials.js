export function getInitials(fullName) {
  if (!fullName || typeof fullName !== "string") return "";

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    // Un solo nombre: tomar las dos primeras letras
    const singleName = parts[0];
    if (singleName.length === 0) return "";
    if (singleName.length === 1) return singleName.toUpperCase();
    return singleName.slice(0, 2).toUpperCase();
  }

  // Dos o más nombres: primera letra del primero y primera letra del segundo
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const secondInitial = parts[1].charAt(0).toUpperCase();

  return firstInitial + secondInitial;
}
