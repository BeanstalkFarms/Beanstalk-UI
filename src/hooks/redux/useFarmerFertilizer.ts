import { useSelector } from 'react-redux';
import { AppState } from '../../state';

export default function useFarmerFertilizer() {
  return useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
}
