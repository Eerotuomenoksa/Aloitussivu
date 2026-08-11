export interface UiVisibilityState {
  clock: boolean;
  secondaryClock: boolean;
  regionalServices: boolean;
  regionalNews: boolean;
  scamAlerts: boolean;
  weather: boolean;
  assistant: boolean;
  googleSearch: boolean;
}

export type UiVisibilityKey = keyof UiVisibilityState;

export type UiVisibilityOption = {
  key: UiVisibilityKey;
  label: string;
  className?: string;
};

export const defaultUiVisibility: UiVisibilityState = {
  clock: true,
  secondaryClock: false,
  regionalServices: true,
  regionalNews: true,
  scamAlerts: true,
  weather: true,
  assistant: true,
  googleSearch: true,
};
