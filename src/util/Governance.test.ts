import { getProposalTag } from '~/util/Governance';

describe('combines balances', () => {
  it('adds balances correctly', () => {
    expect(getProposalTag('BSP-7: Fund Bean Portion of the Six-Month Halborn Retainer')).toBe('BSP-7');
    expect(getProposalTag('BFCP-A-4: Add sweetredbeans to the BFC')).toBe('BFCP-A-4');
  });
});
