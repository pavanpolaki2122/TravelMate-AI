import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/place.dart';
import '../models/itinerary.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator, or 127.0.0.1 for desktop/web
  static const String baseUrl = 'http://10.0.2.2:8000';

  static Future<List<Place>> getAllPlaces() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/places/all'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data['places'] as List;
        return list.map((e) => Place.fromJson(e)).toList();
      }
    } catch (e) {
      print('[ApiService] Error fetching places: $e');
    }
    return [];
  }

  static Future<List<Place>> getHiddenGems() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/places/hidden'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data['hidden_places'] as List;
        return list.map((e) => Place.fromJson(e)).toList();
      }
    } catch (e) {
      print('[ApiService] Error fetching hidden gems: $e');
    }
    return [];
  }

  static Future<List<DayPlan>> generateItinerary({
    required int days,
    required double budget,
    required List<String> interests,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/planner/generate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'destination': 'Hyderabad',
          'days': days,
          'budget': budget,
          'interests': interests,
          'start_time': '09:00',
          'travel_mode': 'Affordable (Metro / Auto)',
          'companions': 'Solo',
        }),
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data['itinerary'] as List;
        return list.map((e) => DayPlan.fromJson(e)).toList();
      }
    } catch (e) {
      print('[ApiService] Error generating itinerary: $e');
    }
    return [];
  }

  static Future<String> chatWithAssistant(String message, {double? lat, double? lng}) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/guide/assistant/chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'user_lat': lat ?? 17.3616,
          'user_lng': lng ?? 78.4747,
          'language': 'en',
        }),
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return data['reply'] ?? 'Hello from TravelMate AI!';
      }
    } catch (e) {
      print('[ApiService] Chat error: $e');
    }
    return 'Could not connect to Gemini Assistant. Please check connection.';
  }
}
