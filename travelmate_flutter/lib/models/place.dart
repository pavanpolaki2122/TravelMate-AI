class Place {
  final String id;
  final String name;
  final String category;
  final double lat;
  final double lng;
  final String address;
  final String description;
  final String? shortDesc;
  final double entryFeeInr;
  final String timings;
  final bool isHiddenGem;
  final double rating;
  final List<String> tags;
  final Map<String, String>? audioGuide;
  final List<String> quickFacts;
  final String? imageUrl;
  final double? distanceKm;

  Place({
    required this.id,
    required this.name,
    required this.category,
    required this.lat,
    required this.lng,
    required this.address,
    required this.description,
    this.shortDesc,
    required this.entryFeeInr,
    required this.timings,
    this.isHiddenGem = false,
    this.rating = 4.5,
    this.tags = const [],
    this.audioGuide,
    this.quickFacts = const [],
    this.imageUrl,
    this.distanceKm,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'attraction',
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      address: json['address'] ?? '',
      description: json['description'] ?? '',
      shortDesc: json['short_desc'],
      entryFeeInr: (json['entry_fee_inr'] as num?)?.toDouble() ?? 0.0,
      timings: json['timings'] ?? '',
      isHiddenGem: json['is_hidden_gem'] ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      audioGuide: (json['audio_guide'] as Map<String, dynamic>?)?.map((k, v) => MapEntry(k, v.toString())),
      quickFacts: (json['quick_facts'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      imageUrl: json['image_url'],
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }
}
