export interface ParsedDeviceInfo {
  deviceType: string;
  deviceName: string;
  browser: string;
  os: string;
}

export function parseUserAgent(userAgent?: string): ParsedDeviceInfo {
  if (!userAgent) {
    return {
      deviceType: 'Desktop',
      deviceName: 'Unknown Device',
      browser: 'Web Browser',
      os: 'Unknown OS'
    };
  }

  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';

  let browser = 'Web Browser';
  if (/chrome|crios/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/edg/i.test(userAgent)) browser = 'Edge';

  let deviceType = 'Desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
  else if (/tablet|ipad/i.test(userAgent)) deviceType = 'Tablet';

  const deviceName = `${browser} on ${os}`;

  return {
    deviceType,
    deviceName,
    browser,
    os
  };
}

