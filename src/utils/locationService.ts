import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { SaKaeoDistrict } from '../types/incident';

export interface LocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  district: SaKaeoDistrict;
  source: 'gps_high' | 'gps_network' | 'ip_lookup' | 'district_preset';
  sourceLabel: string;
  isApproximate?: boolean;
}

export function getClosestDistrict(lat: number, lng: number): SaKaeoDistrict {
  let closest: SaKaeoDistrict = 'เมืองสระแก้ว';
  let minDist = Infinity;
  for (const [name, info] of Object.entries(SA_KAEO_DISTRICTS)) {
    const dist = Math.hypot(info.lat - lat, info.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = name as SaKaeoDistrict;
    }
  }
  return closest;
}

// Bounding box for Sa Kaeo & Eastern Border Region
function isInSaKaeoRegion(lat: number, lng: number): boolean {
  return lat >= 13.2 && lat <= 14.4 && lng >= 101.7 && lng <= 103.2;
}

/**
 * Multi-tier robust location resolver:
 * 1. High-accuracy GPS (satellite)
 * 2. Network-based Geolocation (Wi-Fi/Cell towers)
 * 3. Client IP Geolocation lookup (safeguarded against ISP Bangkok gateway routing)
 * 4. Sa Kaeo Provincial Command Center default
 */
export async function resolveCurrentLocation(): Promise<LocationResult> {
  // 1. Try Browser Geolocation High Accuracy
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000
        });
      });

      const lat = Number(pos.coords.latitude.toFixed(5));
      const lng = Number(pos.coords.longitude.toFixed(5));
      return {
        lat,
        lng,
        accuracy: Math.round(pos.coords.accuracy),
        district: getClosestDistrict(lat, lng),
        source: 'gps_high',
        sourceLabel: 'GPS ดาวเทียมมือถือ'
      };
    } catch {
      // High accuracy timed out or failed - try Low Accuracy (Wi-Fi/Cell tower)
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 120000
          });
        });

        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        return {
          lat,
          lng,
          accuracy: Math.round(pos.coords.accuracy),
          district: getClosestDistrict(lat, lng),
          source: 'gps_network',
          sourceLabel: 'สัญญาณเครือข่ายมือถือ/Wi-Fi'
        };
      } catch (e2) {
        console.warn('Browser geolocation unavailable, checking fallback:', e2);
      }
    }
  }

  // 2. Try Client IP Lookup with safe AbortController (compatible with all browser versions)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      const lat = Number(data.latitude.toFixed(5));
      const lng = Number(data.longitude.toFixed(5));

      // If IP coordinates fall within Sa Kaeo region, use them
      if (isInSaKaeoRegion(lat, lng)) {
        const district = getClosestDistrict(lat, lng);
        return {
          lat,
          lng,
          accuracy: 1500,
          district,
          source: 'ip_lookup',
          sourceLabel: `ตรวจจับจาก IP อินเทอร์เน็ต (${data.city || data.region || 'สระแก้ว'})`,
          isApproximate: true
        };
      } else {
        // Cellular ISP router is located in Bangkok or another province
        // Use default Sa Kaeo center so user pin is not placed 200km away
        console.info('IP located outside Sa Kaeo region (ISP gateway in Bangkok/Central), falling back to provincial center');
      }
    }
  } catch (ipErr) {
    console.warn('IP location lookup failed:', ipErr);
  }

  // 3. Fallback to Sa Kaeo Disaster Command Center (Default Center)
  const defaultCenter = SA_KAEO_DISTRICTS['เมืองสระแก้ว'];
  return {
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    accuracy: 3000,
    district: 'เมืองสระแก้ว',
    source: 'district_preset',
    sourceLabel: 'ศูนย์บัญชาการ ปภ. จ.สระแก้ว (ตำแหน่งเริ่มต้น)',
    isApproximate: true
  };
}
