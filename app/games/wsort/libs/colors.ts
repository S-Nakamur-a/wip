export const isDark = (color: string): boolean => {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return r * 0.299 + g * 0.587 + b * 0.114 < 186
}