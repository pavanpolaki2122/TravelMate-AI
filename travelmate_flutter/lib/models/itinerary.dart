class ItineraryStop {
  final int sequence;
  final String placeId;
  final String name;
  final String category;
  final String arrivalTime;
  final String departureTime;
  final int durationMinutes;
  final double entryFeeInr;
  final int estimatedTravelTimeMin;
  final String travelMode;
  final double travelCostInr;
  final String notes;
  final double lat;
  final double lng;
  final String? imageUrl;

  ItineraryStop({
    required this.sequence,
    required this.placeId,
    required this.name,
    required this.category,
    required this.arrivalTime,
    required this.departureTime,
    required this.durationMinutes,
    required this.entryFeeInr,
    required this.estimatedTravelTimeMin,
    required this.travelMode,
    required this.travelCostInr,
    required this.notes,
    required this.lat,
    required this.lng,
    this.imageUrl,
  });

  factory ItineraryStop.fromJson(Map<String, dynamic> json) {
    return ItineraryStop(
      sequence: json['sequence'] ?? 1,
      placeId: json['place_id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'attraction',
      arrivalTime: json['arrival_time'] ?? '',
      departureTime: json['departure_time'] ?? '',
      durationMinutes: json['duration_minutes'] ?? 60,
      entryFeeInr: (json['entry_fee_inr'] as num?)?.toDouble() ?? 0.0,
      estimatedTravelTimeMin: json['estimated_travel_time_min'] ?? 15,
      travelMode: json['travel_mode'] ?? 'Metro',
      travelCostInr: (json['travel_cost_inr'] as num?)?.toDouble() ?? 30.0,
      notes: json['notes'] ?? '',
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      imageUrl: json['image_url'],
    );
  }
}

class DayPlan {
  final int day;
  final String title;
  final List<ItineraryStop> stops;
  final double totalDayBudget;
  final int totalTravelTimeMin;

  DayPlan({
    required this.day,
    required this.title,
    required this.stops,
    required this.totalDayBudget,
    required this.totalTravelTimeMin,
  });

  factory DayPlan.fromJson(Map<String, dynamic> json) {
    return DayPlan(
      day: json['day'] ?? 1,
      title: json['title'] ?? '',
      stops: (json['stops'] as List<dynamic>?)
              ?.map((s) => ItineraryStop.fromJson(s))
              .toList() ??
          [],
      totalDayBudget: (json['total_day_budget'] as num?)?.toDouble() ?? 0.0,
      totalTravelTimeMin: json['total_travel_time_min'] ?? 0,
    );
  }
}
