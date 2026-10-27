import { createContext, useContext } from 'react';
/** true inside the Russia-Audio composition: heavy visuals (3D, map rasters, plates) skip themselves so the soundtrack renders fast */
export const AudioOnly = createContext(false);
export const useAudioOnly = () => useContext(AudioOnly);
