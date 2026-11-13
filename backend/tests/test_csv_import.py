
import pandas as pd
from services.csv_import import _clean


def create_test_data():
    return pd.DataFrame({
        "username": ["manager1"],
        "building_name": ["Building A"],
        "room_name": ["Room 101"],
        "timestamp": ["2026-11-10 10:00:00"],
        "energy_consumed_kwh": ["120.5"],
        "indoor_temp": ["22.5"],
    })


# Test 1: Valid CSV data should be accepted
def test_clean_accepts_valid_data():
    df = create_test_data()

    result = _clean(df)

    assert len(result) == 1
    assert result.iloc[0]["energy_consumed_kwh"] == 120.5
    assert result.iloc[0]["indoor_temp"] == 22.5


# Test 2: Invalid timestamp should be rejected
def test_clean_rejects_invalid_timestamp():
    df = create_test_data()
    df.loc[0, "timestamp"] = "invalid-date"

    result = _clean(df)

    assert len(result) == 0


# Test 3: Out-of-range energy consumption should be rejected
def test_clean_rejects_out_of_range_energy():
    df = create_test_data()
    df.loc[0, "energy_consumed_kwh"] = "1500"

    result = _clean(df)

    assert len(result) == 0
