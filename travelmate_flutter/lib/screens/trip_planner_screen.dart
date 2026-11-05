import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/itinerary.dart';
import '../services/api_service.dart';

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({Key? key}) : super(key: key);

  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  int _selectedDays = 1;
  double _budget = 2000;
  List<DayPlan> _plans = [];
  bool _isLoading = false;

  Future<void> _generatePlan() async {
    setState(() => _isLoading = true);
    final plans = await ApiService.generateItinerary(
      days: _selectedDays,
      budget: _budget,
      interests: ['Heritage', 'Food', 'Photography'],
    );
    setState(() {
      _plans = plans;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Smart Trip Planner')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Plan Your Hyderabad Journey', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          value: _selectedDays,
                          decoration: const InputDecoration(labelText: 'Days'),
                          items: const [
                            DropdownMenuItem(value: 1, child: Text('1 Day Express')),
                            DropdownMenuItem(value: 2, child: Text('2 Days Complete')),
                            DropdownMenuItem(value: 3, child: Text('3 Days Leisure')),
                          ],
                          onChanged: (val) => setState(() => _selectedDays = val ?? 1),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          initialValue: _budget.toStringAsFixed(0),
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Budget (₹)'),
                          onChanged: (val) => _budget = double.tryParse(val) ?? 2000,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.electricCyan,
                        foregroundColor: AppTheme.deepNavy,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: _generatePlan,
                      child: const Text('✨ Generate AI Itinerary', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_isLoading)
            const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator(color: AppTheme.electricCyan)))
          else if (_plans.isNotEmpty) ...[
            Text('Optimized Schedule (Day 1)', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.electricCyan)),
            const SizedBox(height: 10),
            ..._plans[0].stops.map((stop) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.electricCyan.withOpacity(0.2),
                      child: Text('${stop.sequence}', style: const TextStyle(color: AppTheme.electricCyan, fontWeight: FontWeight.bold)),
                    ),
                    title: Text(stop.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('🕒 ${stop.arrivalTime} - ${stop.departureTime}', style: const TextStyle(fontSize: 11, color: AppTheme.electricCyan)),
                        Text(stop.notes, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                    trailing: Text(stop.entryFeeInr == 0 ? 'Free' : '₹${stop.entryFeeInr.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                )),
          ],
        ],
      ),
    );
  }
}
