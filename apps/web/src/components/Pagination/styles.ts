import styled, { css } from 'styled-components';

import { Link } from '@/i18n/navigation';

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
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
  opacity: 0.4;
  cursor: not-allowed;
`;

export const Status = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;
