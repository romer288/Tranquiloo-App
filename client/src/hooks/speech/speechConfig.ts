
export const getSpeechConfig = (language: 'en' | 'es') => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (language === 'es') {
    return {
      lang: 'es-ES',
      rate: isMobile ? 0.9 : 1.0,
      pitch: isIOS ? 1.1 : 1.3,
      volume: 1.0
    };
  } else {
    return {
      lang: 'en-US',
      rate: isMobile ? 0.85 : 0.95,
      pitch: isIOS ? 1.0 : 1.2,
      volume: 1.0
    };
  }
};

export const getMobileDelay = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS ? 500 : 300;
};

export const getCancellationDelay = () => 300;
