export function formatFirstTwoNames(fullName) {
  if (!fullName || typeof fullName !== "string") return "";

  const parts = fullName.trim().split(/\s+/);
  const firstTwo = parts.slice(0, 2);

  const capitalized = firstTwo.map((name) => {
    if (name.length === 0) return name;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  });

  return capitalized.join(" ");
}
