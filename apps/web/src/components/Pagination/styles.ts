import styled from 'styled-components';

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
`;

export const PageLink = styled.span<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  font-weight: 500;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Status = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;
