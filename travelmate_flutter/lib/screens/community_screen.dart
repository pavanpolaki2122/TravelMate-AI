import 'package:flutter/material.dart';
import '../config/theme.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tourist Community & Buddies')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Share Post Box
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Share a Travel Tip or Hidden Gem', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 10),
                  TextFormField(
                    decoration: const InputDecoration(
                      hintText: 'Discovered a secret photo spot or food stall?',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.electricCyan,
                        foregroundColor: AppTheme.deepNavy,
                      ),
                      onPressed: () {},
                      child: const Text('Post', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Community Feed Cards
          const Text('Recent Experiences & Tips', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),

          _buildPostCard(
            author: 'Ananya Sharma',
            place: 'Paigah Tombs',
            content: 'Discovered Paigah Tombs with TravelMate AI! The intricate jaali work is magnificent with zero crowds. Great for quiet photography.',
            likes: 42,
          ),
          _buildPostCard(
            author: 'Vikram Reddy',
            place: 'Hotel Shadab',
            content: 'Order the Mutton Dum Biryani along with Double ka Meetha at Shadab. Piping hot batch starts at 1 PM!',
            likes: 88,
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard({required String author, required String place, required String content, required int likes}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(child: Icon(Icons.person)),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(author, style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('📍 $place', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(content, style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Chip(label: Text('Travel Tip', style: TextStyle(fontSize: 10))),
                Text('❤️ $likes likes', style: const TextStyle(fontSize: 12, color: AppTheme.accentGold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
