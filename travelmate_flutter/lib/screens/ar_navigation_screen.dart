import 'package:flutter/material.dart';
import '../config/theme.dart';

class ARNavigationScreen extends StatefulWidget {
  const ARNavigationScreen({Key? key}) : super(key: key);

  @override
  State<ARNavigationScreen> createState() => _ARNavigationScreenState();
}

class _ARNavigationScreenState extends State<ARNavigationScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AR Navigation View')),
      body: Stack(
        children: [
          // Simulated Camera Feed Backdrop
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage('https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          // Dark Overlay for Contrast
          Container(color: Colors.black.withOpacity(0.35)),

          // AR HUD Elements
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Compass Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.deepNavy.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: AppTheme.electricCyan.withOpacity(0.4)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('🧭 COMPASS: 045° NE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.electricCyan)),
                        Text('GPS ACCURACY: ±3m', style: TextStyle(fontSize: 10, color: AppTheme.successGreen)),
                      ],
                    ),
                  ),

                  // Center Floating Target Reticle & Bearing Arrow
                  Column(
                    children: [
                      ScaleTransition(
                        scale: Tween(begin: 0.95, end: 1.05).animate(_pulseController),
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.electricCyan.withOpacity(0.2),
                            border: Border.all(color: AppTheme.electricCyan, width: 3),
                            boxShadow: [
                              BoxShadow(color: AppTheme.electricCyan.withOpacity(0.6), blurRadius: 20),
                            ],
                          ),
                          child: const Center(
                            child: Icon(Icons.navigation, size: 40, color: AppTheme.electricCyan),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.deepNavy.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.electricCyan),
                        ),
                        child: const Text('120 meters ahead', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                      ),
                    ],
                  ),

                  // Bottom Target Info Card
                  Card(
                    color: AppTheme.deepNavy.withOpacity(0.92),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Charminar Monument', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.electricCyan)),
                              Chip(
                                label: Text('AR Waypoint', style: TextStyle(fontSize: 10)),
                                backgroundColor: Color(0x3300E5FF),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text('Built in 1591 CE. Head towards Laad Bazaar archway.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.electricCyan,
                                foregroundColor: AppTheme.deepNavy,
                              ),
                              icon: const Icon(Icons.headphones),
                              label: const Text('Listen to Audio Tour Guide', style: TextStyle(fontWeight: FontWeight.bold)),
                              onPressed: () {},
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
