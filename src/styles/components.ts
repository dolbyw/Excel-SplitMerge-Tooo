/**
 * 组件样式工具类
 * 提供统一的样式管理和组织方式
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并Tailwind CSS类名的工具函数
 */
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 按钮样式变体
 */
export const buttonVariants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors duration-200",
  success:
    "bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200",
  danger:
    "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200",
  outline:
    "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200",
  ghost:
    "text-gray-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-colors duration-200",
};

/**
 * 卡片样式变体
 */
export const cardVariants = {
  default: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
  elevated: "bg-white rounded-lg shadow-md border border-gray-200 p-6",
  bordered: "bg-white rounded-lg border-2 border-gray-300 p-6",
  flat: "bg-gray-50 rounded-lg p-6",
};

/**
 * 输入框样式变体
 */
export const inputVariants = {
  default:
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200",
  error:
    "w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200",
  success:
    "w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200",
};

/**
 * 标签样式变体
 */
export const labelVariants = {
  default: "block text-sm font-medium text-gray-700 mb-2",
  required:
    'block text-sm font-medium text-gray-700 mb-2 after:content-["*"] after:text-red-500 after:ml-1',
  optional: "block text-sm font-medium text-gray-500 mb-2",
};

/**
 * 状态指示器样式
 */
export const statusVariants = {
  success:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
  error:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
  warning:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
  info: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
  processing:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800",
};

/**
 * 进度条样式
 */
export const progressVariants = {
  default: {
    container: "w-full bg-gray-200 rounded-full h-2.5",
    bar: "bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out",
  },
  success: {
    container: "w-full bg-gray-200 rounded-full h-2.5",
    bar: "bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out",
  },
  error: {
    container: "w-full bg-gray-200 rounded-full h-2.5",
    bar: "bg-red-600 h-2.5 rounded-full transition-all duration-300 ease-out",
  },
};

/**
 * 布局样式
 */
export const layoutStyles = {
  container: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-8",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexCol: "flex flex-col",
  spacingY: "space-y-4",
  spacingX: "space-x-4",
};

/**
 * 文本样式
 */
export const textStyles = {
  heading1: "text-3xl font-bold text-gray-900",
  heading2: "text-2xl font-semibold text-gray-800",
  heading3: "text-xl font-medium text-gray-800",
  body: "text-base text-gray-700",
  small: "text-sm text-gray-600",
  muted: "text-sm text-gray-500",
  error: "text-sm text-red-600",
  success: "text-sm text-green-600",
};

/**
 * 动画样式
 */
export const animationStyles = {
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  slideOut: "animate-out slide-out-to-bottom-4 duration-300",
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
};

/**
 * 响应式断点工具
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * 阴影样式
 */
export const shadowStyles = {
  sm: "shadow-sm",
  default: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  inner: "shadow-inner",
  none: "shadow-none",
};

/**
 * 边框样式
 */
export const borderStyles = {
  default: "border border-gray-200",
  thick: "border-2 border-gray-300",
  dashed: "border border-dashed border-gray-300",
  dotted: "border border-dotted border-gray-300",
  none: "border-none",
  rounded: "rounded-lg",
  roundedFull: "rounded-full",
};

/**
 * 间距工具
 */
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
};

/**
 * 颜色主题
 */
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    900: "#14532d",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    900: "#7f1d1d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    900: "#78350f",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};
