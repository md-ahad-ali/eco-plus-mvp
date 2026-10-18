USE ecopulse;

INSERT INTO users (username, password_hash)
VALUES ('demo_manager', 'mock_bcrypt_hash_not_for_login');

INSERT INTO buildings (user_id, name, area_sqm) VALUES
(1, 'Campus Building A', 800.0),
(1, 'Campus Building B', 900.0);

INSERT INTO rooms (building_id, room_name) VALUES
(1, 'Lecture Hall 101'),
(1, 'Computer Lab 102'),
(1, 'Office 103'),
(2, 'Library Floor 1'),
(2, 'Library Floor 2'),
(2, 'Server Room');

-- 30 days of hourly data for every room (6 rooms x 720 hours = 4320 rows)
SET SESSION cte_max_recursion_depth = 1000;

INSERT INTO energy_logs (room_id, `timestamp`, energy_consumed_kwh, indoor_temp)
WITH RECURSIVE hours (h) AS (
    SELECT 0 UNION ALL SELECT h + 1 FROM hours WHERE h < 719
)
SELECT
    r.id,
    TIMESTAMP('2026-09-01 00:00:00') + INTERVAL x.h HOUR,
    ROUND((0.5 + r.id * 0.15)
          * CASE WHEN HOUR(TIMESTAMP('2026-09-01 00:00:00') + INTERVAL x.h HOUR) BETWEEN 8 AND 18
                 THEN 1.0 ELSE 0.3 END
          * (0.8 + RAND() * 0.4), 3),
    ROUND(19 + RAND() * 4, 1)
FROM rooms r
CROSS JOIN hours x;

-- A few spikes for the anomaly detection demo
UPDATE energy_logs SET energy_consumed_kwh = energy_consumed_kwh * 4
WHERE room_id = 2 AND `timestamp` IN ('2026-09-10 14:00:00', '2026-09-18 15:00:00');

UPDATE energy_logs SET energy_consumed_kwh = energy_consumed_kwh * 8
WHERE room_id = 6 AND `timestamp` = '2026-09-22 03:00:00';