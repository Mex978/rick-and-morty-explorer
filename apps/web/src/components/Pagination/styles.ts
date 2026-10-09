import styled, { css } from 'styled-components';

import { Link } from '@/i18n/navigation';

export const Nav = styled.nav`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
`;

const pageControl = css`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: inherit;
  font: inherit;
  font-weight: 500;
`;

export const PageLink = styled(Link)`
  ${pageControl}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const PageButton = styled.button`
  ${pageControl}
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const Pages = styled.ol`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Current = styled.li`
  ${pageControl}
  border-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

export const Gap = styled.li`
  padding: 0 4px;
  color: ${({ theme }) => theme.colors.muted};
`;

// Announced to assistive tech on every change; the numbers already say it visually.
export const Status = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
