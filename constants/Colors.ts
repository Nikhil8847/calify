/**
 * Color palette for Calify - a calorie tracking app with voice features.
 * Defined for both light and dark modes to ensure proper theme support.
 * Following Apple's Human Interface Guidelines for color contrast and accessibility.
 */

// Primary brand colors
const primaryGreen = '#4CAF50';
const primaryDarkGreen = '#388E3C';

// Accent colors 
const accentLight = '#43A047';
const accentDark = '#81C784';

export const Colors = {
  light: {
    text: '#2E2E2E',
    background: '#FFFFFF',
    tint: primaryGreen,
    icon: '#757575',
    tabIconDefault: '#757575',
    tabIconSelected: primaryGreen,
    card: '#F5F5F5',
    border: '#E0E0E0',
    notification: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    calorieBudget: '#4CAF50',
    calorieIntake: '#FF9800',
    calorieBurn: '#2196F3',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: accentDark,
    icon: '#BABABA',
    tabIconDefault: '#BABABA',
    tabIconSelected: accentDark,
    card: '#1E1E1E',
    border: '#2C2C2C',
    notification: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
    calorieBudget: '#81C784',
    calorieIntake: '#FFB74D',
    calorieBurn: '#64B5F6',
  },
};
