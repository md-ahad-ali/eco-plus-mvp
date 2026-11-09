from services.recommendations import generate_recommendations
from services.reporting import build_report, to_pdf, to_csv

building = {
    "building_id": 1, "name": "Campus Building A", "area_sqm": 800.0,
    "total_kwh": 5123.4, "cost_eur": 1537.0, "carbon_kg_co2": 2049.3,
    "avg_indoor_temp": 23.4, "score": 38.0, "grade": "D",
    "anomaly_count": 2,
    "rooms": [{"room_name": "Lecture Hall 101", "total_kwh": 2600.0}],
}

result = generate_recommendations(building)   # uses fallback if no API key
print(result["source"], result["notice"])

report = build_report(building, result["recommendations"], "full", source=result["source"])

open("report.pdf", "wb").write(to_pdf(report))
open("report.csv", "w", newline="", encoding="utf-8").write(to_csv(report))