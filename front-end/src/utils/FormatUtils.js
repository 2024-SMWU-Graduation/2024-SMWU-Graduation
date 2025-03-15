export function formatPercentage(string) {
    const numberMatch = string.match(/\d+(\.\d+)?/);
    return numberMatch ? parseFloat(numberMatch[0]) : null;
}
