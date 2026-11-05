import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../models/place.dart';
import '../services/api_service.dart';

class ExploreMapScreen extends StatefulWidget {
  const ExploreMapScreen({Key? key}) : super(key: key);

  @override
  State<ExploreMapScreen> createState() => _ExploreMapScreenState();
}

class _ExploreMapScreenState extends State<ExploreMapScreen> {
  List<Place> _places = [];
  String _activeCategory = 'all';

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  Future<void> _loadPlaces() async {
    final places = await ApiService.getAllPlaces();
    setState(() => _places = places);
  }

  Future<void> _openGoogleMaps(double lat, double lng) async {
    final uri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _activeCategory == 'all'
        ? _places
        : _places.where((p) => p.category == _activeCategory).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Real-World Map & Nearby Explorer')),
      body: Column(
        children: [
          // Category Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('All Places', 'all'),
                _buildFilterChip('🏛️ Attractions', 'attraction'),
                _buildFilterChip('🍲 Food', 'food'),
                _buildFilterChip('🏥 Hospitals', 'hospital'),
                _buildFilterChip('👮 Police', 'police'),
                _buildFilterChip('🏧 ATMs', 'atm'),
              ],
            ),
          ),
          // Interactive Map Simulation Area with GPS Pin & Real Place Cards
          Container(
            height: 220,
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF111A30),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.electricCyan.withOpacity(0.3)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.location_on, size: 40, color: AppTheme.electricCyan),
                      SizedBox(height: 6),
                      Text('Google Maps Platform Integration', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      Text('Live GPS Coordinates: 17.3616° N, 78.4747° E', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
                Positioned(
                  bottom: 8,
                  right: 8,
                  child: FloatingActionButton.small(
                    backgroundColor: AppTheme.electricCyan,
                    foregroundColor: AppTheme.deepNavy,
                    onPressed: () {},
                    child: const Icon(Icons.my_location),
                  ),
                ),
              ],
            ),
          ),
          // List of Nearby Places
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final p = filtered[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.electricCyan.withOpacity(0.15),
                      child: Text(p.category == 'food' ? '🍲' : p.category == 'hospital' ? '🏥' : '🏛️'),
                    ),
                    title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(p.address, maxLines: 1, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('⭐ ${p.rating}', style: const TextStyle(fontSize: 11, color: AppTheme.accentGold)),
                            Text(p.entryFeeInr == 0 ? 'Free' : '₹${p.entryFeeInr.toInt()}', style: const TextStyle(fontSize: 11, color: AppTheme.electricCyan)),
                          ],
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.directions, color: AppTheme.electricCyan, size: 24),
                          tooltip: 'Navigate via Google Maps',
                          onPressed: () => _openGoogleMaps(p.lat, p.lng),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String category) {
    final isSelected = _activeCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppTheme.electricCyan.withOpacity(0.2),
        checkmarkColor: AppTheme.electricCyan,
        onSelected: (val) => setState(() => _activeCategory = category),
      ),
    );
  }
}
