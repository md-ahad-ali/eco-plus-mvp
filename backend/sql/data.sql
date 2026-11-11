
USE ecopulse;

INSERT INTO users
(id, username, email, password_hash, role)
VALUES
(1, 'demo_manager', 'demo_manager@example.com',
 'mock_bcrypt_hash_not_for_login', 'building_manager'),

(2, 'demo_admin', 'demo_admin@example.com',
 'mock_bcrypt_hash_not_for_login', 'admin');


INSERT INTO buildings
(id, user_id, name, area_sqm)
VALUES
(1, 1, 'Campus Building A', 800.0),
(2, 1, 'Campus Building B', 900.0);

INSERT INTO rooms
(id, building_id, room_name)
VALUES
(1, 1, 'Lecture Hall 101'),
(2, 1, 'Computer Lab 102'),
(3, 1, 'Office 103'),
(4, 2, 'Library Floor 1'),
(5, 2, 'Library Floor 2'),
(6, 2, 'Server Room');

SET SESSION cte_max_recursion_depth = 1000;

INSERT INTO energy_logs
(room_id, `timestamp`, energy_consumed_kwh, indoor_temp)

WITH RECURSIVE hours (h) AS (
    SELECT 0

    UNION ALL

    SELECT h + 1
    FROM hours
    WHERE h < 719
)

SELECT
    r.id,

    TIMESTAMP('2026-09-01 00:00:00')
        + INTERVAL h.h HOUR,

    ROUND(
        (0.5 + r.id * 0.15)
        *
        CASE
            WHEN HOUR(
                TIMESTAMP('2026-09-01 00:00:00')
                + INTERVAL h.h HOUR
            ) BETWEEN 8 AND 18
            THEN 1.0
            ELSE 0.3
        END
        *
        (0.8 + RAND() * 0.4),
        3
    ),

    ROUND(19 + RAND() * 4, 1)

FROM rooms r
CROSS JOIN hours h;


UPDATE energy_logs
SET energy_consumed_kwh = energy_consumed_kwh * 4
WHERE room_id = 2
AND `timestamp` IN (
    '2026-09-10 14:00:00',
    '2026-09-18 15:00:00'
);

UPDATE energy_logs
SET energy_consumed_kwh = energy_consumed_kwh * 8
WHERE room_id = 6
AND `timestamp` = '2026-09-22 03:00:00';


INSERT INTO ai_recommendations
(building_id, created_at, recommendation_text,
 estimated_savings_percent)
VALUES

(1, '2026-09-05 10:00:00',
 'Reduce unnecessary lighting during non-working hours in Lecture Hall 101.',
 12.5),

(1, '2026-09-10 15:00:00',
 'Unusually high energy consumption detected in Computer Lab 102. Investigate computers and cooling equipment.',
 18.0),

(1, '2026-09-15 09:00:00',
 'Optimize HVAC operating schedules to reduce energy consumption during unoccupied hours.',
 15.5),

(2, '2026-09-12 11:00:00',
 'Introduce automated lighting controls in library areas to reduce unnecessary electricity usage.',
 10.0),

(2, '2026-09-22 04:00:00',
 'Critical energy consumption spike detected in Server Room. Check cooling systems and server utilization.',
 22.0),

(2, '2026-09-25 14:00:00',
 'Improve temperature management and optimize heating and cooling schedules.',
 13.5);


INSERT INTO csv_uploads
(filename, status)
VALUES
('building_a_energy_september.csv', 'completed'),
('building_b_energy_september.csv', 'completed'),
('computer_lab_energy.csv', 'completed'),
('server_room_energy.csv', 'processed');



SELECT 'Users' AS table_name, COUNT(*) AS total
FROM users

UNION ALL

SELECT 'Buildings', COUNT(*)
FROM buildings

UNION ALL

SELECT 'Rooms', COUNT(*)
FROM rooms

UNION ALL

SELECT 'Energy Logs', COUNT(*)
FROM energy_logs

UNION ALL

SELECT 'AI Recommendations', COUNT(*)
FROM ai_recommendations

UNION ALL

SELECT 'CSV Uploads', COUNT(*)
FROM csv_uploads;

