<?php
/**
 * Extracts location details from a Google Maps share URL.
 * Returns: name, display_name, city, country, latitude, longitude
 */
function extractMapUrl(string $url): array {
    require_once __DIR__ . '/../config/google.php';

    // Follow redirects to resolve shortened URLs (goo.gl, etc.)
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    curl_exec($ch);
    $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 && $httpCode !== 301 && $httpCode !== 302) {
        $finalUrl = $url;
    }

    // Extract lat/lng from @lat,lng
    $lat = null;
    $lng = null;
    preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $coords);
    if ($coords) {
        $lat = $coords[1];
        $lng = $coords[2];
    }

    // Extract name from /place/Name/ path
    $name = '';
    preg_match('/\/place\/([^\/@?]+)/', $finalUrl, $pathMatch);
    if ($pathMatch) {
        $name = urldecode(str_replace('+', ' ', $pathMatch[1]));
    }

    // Fallback: extract from ?q= param
    if (empty($name)) {
        $query = parse_url($finalUrl, PHP_URL_QUERY);
        if ($query) {
            parse_str($query, $queryParams);
            $q = $queryParams['q'] ?? '';
            if ($q && !preg_match('/^-?\d+\.\d+,-?\d+\.\d+$/', $q)) {
                $name = $q;
            }
        }
    }

    // If we have coordinates, get detailed info from Geocoding API
    $displayName = '';
    $city = '';
    $country = '';
    if ($lat && $lng && !empty(GOOGLE_API_KEY)) {
        $geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng={$lat},{$lng}&key=" . GOOGLE_API_KEY;
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $geoUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        $geoCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($geoCode === 200 && $response) {
            $data = json_decode($response, true);
            if (!empty($data['results'][0])) {
                $result = $data['results'][0];
                $displayName = $result['formatted_address'] ?? '';
                foreach ($result['address_components'] ?? [] as $comp) {
                    $types = $comp['types'] ?? [];
                    if (in_array('point_of_interest', $types) || in_array('establishment', $types) || in_array('premise', $types)) {
                        $name = $comp['long_name'];
                        break;
                    }
                }
                if (empty($name)) {
                    foreach ($result['address_components'] ?? [] as $comp) {
                        if (in_array('route', $comp['types'] ?? [])) {
                            $name = $comp['long_name'];
                            break;
                        }
                    }
                }
                if (empty($name)) {
                    $name = $result['address_components'][0]['long_name'] ?? '';
                }
                foreach ($result['address_components'] ?? [] as $comp) {
                    $types = $comp['types'] ?? [];
                    if (in_array('locality', $types) || in_array('administrative_area_level_2', $types)) {
                        if (empty($city)) $city = $comp['long_name'];
                    }
                    if (in_array('country', $types)) {
                        $country = $comp['long_name'];
                    }
                }
            }
        }
    }

    return [
        "name" => $name ?: '',
        "display_name" => $displayName,
        "city" => $city,
        "country" => $country,
        "latitude" => $lat ? (float)$lat : null,
        "longitude" => $lng ? (float)$lng : null,
    ];
}