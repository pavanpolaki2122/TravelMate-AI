import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'screens/home_dashboard.dart';
import 'screens/trip_planner_screen.dart';
import 'screens/explore_map_screen.dart';
import 'screens/ar_navigation_screen.dart';
import 'screens/community_screen.dart';

void main() {
  runApp(const TravelMateApp());
}

class TravelMateApp extends StatelessWidget {
  const TravelMateApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TravelMate AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({Key? key}) : super(key: key);

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  void _onTabSelected(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeDashboard(onNavigateTab: _onTabSelected),
      const TripPlannerScreen(),
      const ExploreMapScreen(),
      const ARNavigationScreen(),
      const CommunityScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.emergencyRed,
        foregroundColor: Colors.white,
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: AppTheme.emergencyRed,
              content: Text('🚨 EMERGENCY SOS: Calling 112 & Sharing Live GPS Location!'),
            ),
          );
        },
        child: const Text('SOS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabSelected,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Planner'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Map'),
          BottomNavigationBarItem(icon: Icon(Icons.camera_alt), label: 'AR Nav'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Community'),
        ],
      ),
    );
  }
}
