import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/place.dart';
import '../services/api_service.dart';

class HomeDashboard extends StatefulWidget {
  final Function(int) onNavigateTab;
  const HomeDashboard({Key? key, required this.onNavigateTab}) : super(key: key);

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  List<Place> _places = [];
  List<Place> _hiddenGems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final places = await ApiService.getAllPlaces();
    final hidden = await ApiService.getHiddenGems();
    if (mounted) {
      setState(() {
        _places = places;
        _hiddenGems = hidden;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.electricCyan, AppTheme.electricBlue],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('TM', style: TextStyle(color: AppTheme.deepNavy, fontWeight: FontWeight.w900)),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('TravelMate AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Hyderabad, Telangana', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.support_agent, color: AppTheme.electricCyan),
            onPressed: () => widget.onNavigateTab(3), // Assistant / Nav
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.electricCyan))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Weather & Hero Card
                  Card(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.electricBlue.withOpacity(0.3),
                            AppTheme.electricCyan.withOpacity(0.1),
                          ],
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('☀️ 31°C • Sunny', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              SizedBox(height: 4),
                              Text('Air Quality: AQI 68 (Good)', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              SizedBox(height: 2),
                              Text('Perfect for Charminar & Fort visit', style: TextStyle(fontSize: 11, color: AppTheme.accentGold)),
                            ],
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.electricCyan,
                              foregroundColor: AppTheme.deepNavy,
                            ),
                            onPressed: () => widget.onNavigateTab(1), // Planner
                            child: const Text('Plan Trip', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Quick Action Grid
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickTile(context, '🧭 Planner', 1),
                      _buildQuickTile(context, '🗺️ Maps', 2),
                      _buildQuickTile(context, '📱 AR Nav', 3),
                      _buildQuickTile(context, '👥 Social', 4),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Must-Visit Monuments Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Top Heritage Marvels', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Text('View All', style: TextStyle(fontSize: 12, color: AppTheme.electricCyan)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 190,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _places.length,
                      itemBuilder: (context, index) {
                        final p = _places[index];
                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 12),
                          child: Card(
                            clipBehavior: Clip.antiAlias,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (p.imageUrl != null)
                                  Image.network(p.imageUrl!, height: 100, width: double.infinity, fit: BoxFit.cover),
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1),
                                      const SizedBox(height: 2),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text('⭐ ${p.rating}', style: const TextStyle(fontSize: 11, color: AppTheme.accentGold)),
                                          Text(p.entryFeeInr == 0 ? 'Free' : '₹${p.entryFeeInr.toInt()}', style: const TextStyle(fontSize: 11, color: AppTheme.electricCyan)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Hidden Gems Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Hidden Places Discovery', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Chip(
                        label: Text('Verified', style: TextStyle(fontSize: 10)),
                        backgroundColor: Color(0x33FFD166),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ..._hiddenGems.map((gem) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: gem.imageUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(gem.imageUrl!, width: 50, height: 50, fit: BoxFit.cover),
                                )
                              : const Icon(Icons.place, color: AppTheme.accentGold),
                          title: Text(gem.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(gem.shortDesc ?? gem.category, maxLines: 2, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.electricCyan),
                          onTap: () => widget.onNavigateTab(2), // View on Map
                        ),
                      )),
                ],
              ),
            ),
    );
  }

  Widget _buildQuickTile(BuildContext context, String title, int tabIndex) {
    return GestureDetector(
      onTap: () => widget.onNavigateTab(tabIndex),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.cardSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.electricCyan.withOpacity(0.2)),
        ),
        child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
