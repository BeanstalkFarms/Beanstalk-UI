import { useSelector } from "react-redux";
import { AppState } from "state";
import { App } from "state/app";

export default function useAppFlag(key: keyof App) {
  return useSelector<AppState, AppState['app'][typeof key]>((state) => state.app[key]);
}