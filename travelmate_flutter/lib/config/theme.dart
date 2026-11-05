import 'package:flutter/material.dart';

class AppTheme {
  static const Color deepNavy = Color(0xFF0A1128);
  static const Color cardSurface = Color(0xFF131E3D);
  static const Color electricCyan = Color(0xFF00E5FF);
  static const Color electricBlue = Color(0xFF0072CE);
  static const Color accentGold = Color(0xFFFFD166);
  static const Color emergencyRed = Color(0xFFEF476F);
  static const Color successGreen = Color(0xFF06D6A0);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA0AEC0);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: deepNavy,
      primaryColor: electricCyan,
      colorScheme: const ColorScheme.dark(
        primary: electricCyan,
        secondary: electricBlue,
        surface: cardSurface,
        error: emergencyRed,
        onPrimary: deepNavy,
        onSecondary: textPrimary,
        onSurface: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: deepNavy,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardTheme(
        color: cardSurface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: electricCyan.withOpacity(0.18)),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: deepNavy,
        selectedItemColor: electricCyan,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
